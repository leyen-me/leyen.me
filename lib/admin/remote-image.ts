import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { IMAGE_MAX_INPUT_BYTES } from "@/lib/admin/image-optimizer";

/**
 * Remote image import is a server-side fetch of a user supplied URL, so it is
 * an SSRF surface: block private/loopback/link-local targets, re-validate every
 * redirect hop, and cap both duration and bytes.
 */
const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;

export class RemoteImageError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RemoteImageError";
    this.status = status;
  }
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;

  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fe80")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("::ffff:")) {
    return isPrivateIPv4(normalized.replace("::ffff:", ""));
  }
  return false;
}

export function isPrivateAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) return isPrivateIPv6(ip);
  return true;
}

export async function assertSafeRemoteUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new RemoteImageError("图片链接格式不正确");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new RemoteImageError("只支持 http/https 图片链接");
  }
  if (url.username || url.password) {
    throw new RemoteImageError("图片链接不能包含账号信息");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new RemoteImageError("不支持抓取内网地址");
  }

  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new RemoteImageError("不支持抓取内网地址");
    }
    return url;
  }

  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    throw new RemoteImageError("无法解析该图片链接的域名", 502);
  }

  if (addresses.length === 0) {
    throw new RemoteImageError("无法解析该图片链接的域名", 502);
  }
  if (addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new RemoteImageError("不支持抓取内网地址");
  }

  return url;
}

async function readCappedBody(response: Response): Promise<Buffer> {
  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (declaredLength > IMAGE_MAX_INPUT_BYTES) {
    throw new RemoteImageError(
      `图片超过 ${Math.round(IMAGE_MAX_INPUT_BYTES / 1024 / 1024)}MB 上限`,
      413
    );
  }

  if (!response.body) {
    throw new RemoteImageError("图片内容为空", 502);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > IMAGE_MAX_INPUT_BYTES) {
      await reader.cancel();
      throw new RemoteImageError(
        `图片超过 ${Math.round(IMAGE_MAX_INPUT_BYTES / 1024 / 1024)}MB 上限`,
        413
      );
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

function filenameFromUrl(url: URL): string {
  const last = url.pathname.split("/").filter(Boolean).pop() ?? "image";
  return decodeURIComponent(last);
}

export async function downloadRemoteImage(raw: string): Promise<{
  buffer: Buffer;
  filename: string;
  contentType: string;
}> {
  let current = await assertSafeRemoteUrl(raw);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          // Some CDNs reject requests without a UA.
          "user-agent": "leyen.me admin image importer",
          accept: "image/*",
        },
        cache: "no-store",
      });
    } catch {
      throw new RemoteImageError("下载图片失败，请检查链接是否可访问", 502);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new RemoteImageError("图片链接重定向异常", 502);
      }
      current = await assertSafeRemoteUrl(new URL(location, current).toString());
      continue;
    }

    if (!response.ok) {
      throw new RemoteImageError(
        `下载图片失败（HTTP ${response.status}）`,
        response.status === 404 ? 404 : 502
      );
    }

    const contentType = (response.headers.get("content-type") ?? "").split(";")[0].trim();
    if (contentType && !contentType.startsWith("image/")) {
      throw new RemoteImageError("该链接不是图片", 415);
    }

    const buffer = await readCappedBody(response);

    return {
      buffer,
      filename: filenameFromUrl(current),
      contentType: contentType || "application/octet-stream",
    };
  }

  throw new RemoteImageError("图片链接重定向次数过多", 502);
}
