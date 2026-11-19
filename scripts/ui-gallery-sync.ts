/**
 * 扫描 UI Gallery 作品目录，生成：
 *   - lib/ui-gallery/catalog.generated.ts   列表数据（不含源码）
 *   - lib/ui-gallery/loaders.generated.ts   dynamic import 映射（客户端）
 *   - lib/ui-gallery/sources.generated.json 源码快照
 *
 * 用法：
 *   npm run ui:sync          扫描并写入生成文件
 *   npm run ui:sync --check  仅校验生成文件是否为最新（CI / prebuild）
 *
 * 作品目录约定：
 *   app/components/ui-gallery/demos/<kind>/<category>/<slug>/
 *     index.tsx   默认导出预览组件
 *     meta.ts     导出 GalleryMeta
 *     其它 .ts/.tsx/.css 可选，自动进入代码面板
 *   实现说明请直接写在代码注释里。
 */
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { galleryCategories, galleryKinds } from "../lib/ui-gallery/categories";
import type {
  GalleryFile,
  GalleryItem,
  GalleryMeta,
} from "../lib/ui-gallery/types";

const ROOT = process.cwd();
const DEMOS_DIR = path.join(ROOT, "app/components/ui-gallery/demos");
const CATALOG_PATH = path.join(ROOT, "lib/ui-gallery/catalog.generated.ts");
const LOADERS_PATH = path.join(ROOT, "lib/ui-gallery/loaders.generated.ts");
const SOURCES_PATH = path.join(ROOT, "lib/ui-gallery/sources.generated.json");

const SLUG_REGEX = /^[a-z][a-z0-9-]*$/;
const CODE_EXTENSIONS = new Set([".tsx", ".ts", ".css", ".json"]);
const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ".tsx": "tsx",
  ".ts": "ts",
  ".css": "css",
  ".json": "json",
};
/** 这些包随项目始终可用，无需写进 requires */
const IMPLICIT_PACKAGES = new Set(["react", "react-dom", "next"]);
/** 列表大卡片展示区缺省高度 */
const DEFAULT_PREVIEW_HEIGHT = 360;

type InstalledDeps = Record<string, string>;

type BuildResult = {
  catalog: GalleryItem[];
  sources: Record<string, GalleryFile[]>;
  hidden: string[];
  errors: string[];
  warnings: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function collectFiles(dir: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      files.push(...(await collectFiles(path.join(dir, entry.name), relative)));
      continue;
    }
    const extension = path.extname(entry.name);
    if (!CODE_EXTENSIONS.has(extension)) continue;
    if (relative === "meta.ts") continue;
    files.push(relative);
  }

  return files.sort((a, b) => {
    if (a === "index.tsx") return -1;
    if (b === "index.tsx") return 1;
    return a.localeCompare(b);
  });
}

function packageNameOf(specifier: string): string | null {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("node:") ||
    specifier.startsWith("~")
  ) {
    return null;
  }
  const segments = specifier.split("/");
  return specifier.startsWith("@")
    ? segments.slice(0, 2).join("/")
    : segments[0];
}

function extractImports(code: string): string[] {
  const specifiers = new Set<string>();
  const patterns = [
    /\bfrom\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /^\s*import\s+["']([^"']+)["']/gm,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) {
      if (match[1]) specifiers.add(match[1]);
    }
  }

  return [...specifiers];
}

function validateMeta(
  meta: GalleryMeta,
  where: string,
  installed: InstalledDeps,
  errors: string[]
): void {
  if (!isNonEmptyString(meta.title)) errors.push(`${where}: meta.title 缺失`);
  if (!isNonEmptyString(meta.summary)) errors.push(`${where}: meta.summary 缺失`);
  if (meta.tags !== undefined && !Array.isArray(meta.tags)) {
    errors.push(`${where}: meta.tags 必须是字符串数组`);
  }
  if (meta.status !== undefined && meta.status !== "ready" && meta.status !== "wip") {
    errors.push(`${where}: meta.status 只能是 ready / wip`);
  }
  if (meta.createdAt !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(meta.createdAt)) {
    errors.push(`${where}: meta.createdAt 必须是 YYYY-MM-DD`);
  }
  if (meta.previewHeight !== undefined) {
    const height = meta.previewHeight;
    if (
      typeof height !== "number" ||
      !Number.isInteger(height) ||
      height < 200 ||
      height > 900
    ) {
      errors.push(`${where}: meta.previewHeight 必须是 200–900 之间的整数`);
    }
  }
  if (!isRecord(meta.source) || !isNonEmptyString(meta.source.label)) {
    errors.push(`${where}: meta.source.label 必填（写清原创或灵感出处）`);
  }
  if (meta.source?.url && !/^https?:\/\//.test(meta.source.url)) {
    errors.push(`${where}: meta.source.url 必须是 http(s) 链接`);
  }
  if (meta.requires !== undefined) {
    if (!Array.isArray(meta.requires)) {
      errors.push(`${where}: meta.requires 必须是字符串数组`);
    } else {
      for (const dependency of meta.requires) {
        if (!installed[dependency]) {
          errors.push(`${where}: requires 中的 "${dependency}" 未安装于 package.json`);
        }
        if (IMPLICIT_PACKAGES.has(dependency)) {
          errors.push(`${where}: "${dependency}" 属于隐式依赖，无需写入 requires`);
        }
      }
    }
  }
}

async function buildGallery(): Promise<BuildResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const catalog: GalleryItem[] = [];
  const sources: Record<string, GalleryFile[]> = {};
  const hidden: string[] = [];

  const pkg = await readJson(path.join(ROOT, "package.json"));
  const installed: InstalledDeps = {
    ...(isRecord(pkg) && isRecord(pkg.devDependencies) ? pkg.devDependencies : {}),
    ...(isRecord(pkg) && isRecord(pkg.dependencies) ? pkg.dependencies : {}),
  } as InstalledDeps;

  for (const kind of galleryKinds) {
    const kindDir = path.join(DEMOS_DIR, kind);
    let categoryEntries;
    try {
      categoryEntries = await readdir(kindDir, { withFileTypes: true });
    } catch {
      continue;
    }

    const knownCategories = new Set(galleryCategories[kind].map((c) => c.id));

    for (const categoryEntry of categoryEntries) {
      if (!categoryEntry.isDirectory() || categoryEntry.name.startsWith(".")) {
        continue;
      }
      const category = categoryEntry.name;
      if (!knownCategories.has(category)) {
        errors.push(
          `${kind}/${category}: 未知分类，请在 lib/ui-gallery/categories.ts 中注册`
        );
        continue;
      }

      const categoryDir = path.join(kindDir, category);
      const slugEntries = await readdir(categoryDir, { withFileTypes: true });

      for (const slugEntry of slugEntries) {
        if (!slugEntry.isDirectory() || slugEntry.name.startsWith(".")) continue;
        const slug = slugEntry.name;
        const where = `${kind}/${category}/${slug}`;
        const itemDir = path.join(categoryDir, slug);

        if (!SLUG_REGEX.test(slug)) {
          errors.push(`${where}: 目录名必须是小写 kebab-case`);
          continue;
        }

        try {
          await stat(path.join(itemDir, "index.tsx"));
        } catch {
          errors.push(`${where}: 缺少入口 index.tsx`);
          continue;
        }

        let meta: GalleryMeta;
        try {
          const metaModule = await import(
            pathToFileURL(path.join(itemDir, "meta.ts")).href
          );
          meta = metaModule.default as GalleryMeta;
        } catch (error) {
          errors.push(`${where}: meta.ts 无法加载（${(error as Error).message}）`);
          continue;
        }

        if (!isRecord(meta)) {
          errors.push(`${where}: meta.ts 必须默认导出对象`);
          continue;
        }

        validateMeta(meta, where, installed, errors);

        const filePaths = await collectFiles(itemDir);
        const files = await Promise.all(
          filePaths.map(async (filePath) => {
            const extension = path.extname(filePath);
            return {
              path: filePath,
              language: LANGUAGE_BY_EXTENSION[extension] ?? "markdown",
              code: await readFile(path.join(itemDir, filePath), "utf8"),
            };
          })
        );

        const declared = new Set(meta.requires ?? []);
        const detected = new Set<string>();

        for (const file of files) {
          if (file.language !== "ts" && file.language !== "tsx") continue;
          for (const specifier of extractImports(file.code)) {
            if (specifier.startsWith("@/")) {
              errors.push(
                `${where}/${file.path}: 作品必须自包含，不允许引用项目内别名的 "${specifier}"`
              );
              continue;
            }
            const packageName = packageNameOf(specifier);
            if (!packageName) continue;
            if (!installed[packageName]) {
              errors.push(
                `${where}/${file.path}: 依赖 "${packageName}" 未安装于 package.json`
              );
              continue;
            }
            if (IMPLICIT_PACKAGES.has(packageName)) continue;
            detected.add(packageName);
            if (!declared.has(packageName)) {
              errors.push(
                `${where}/${file.path}: 使用了 "${packageName}"，请在 meta.requires 中声明`
              );
            }
          }
        }

        if (meta.hidden === true) {
          hidden.push(`${kind}/${category}/${slug}`);
          continue;
        }

        let createdAt = meta.createdAt;
        if (!createdAt) {
          const info = await stat(path.join(itemDir, "index.tsx"));
          createdAt = new Date(info.birthtimeMs || info.mtimeMs)
            .toISOString()
            .slice(0, 10);
          warnings.push(`${where}: 未声明 meta.createdAt，已回退为 ${createdAt}`);
        }

        const id = `${kind}/${category}/${slug}`;
        catalog.push({
          id,
          kind,
          category,
          slug,
          title: meta.title,
          summary: meta.summary,
          tags: meta.tags ?? [],
          status: meta.status ?? "ready",
          featured: meta.featured ?? false,
          previewHeight: meta.previewHeight ?? DEFAULT_PREVIEW_HEIGHT,
          createdAt,
          source: meta.source,
          dependencies: [...detected].sort(),
          files: filePaths,
        });
        sources[id] = files;
      }
    }
  }

  catalog.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
    return a.title.localeCompare(b.title);
  });

  return { catalog, sources, hidden, errors, warnings };
}

function renderCatalog(catalog: GalleryItem[]): string {
  return `// AUTO-GENERATED by scripts/ui-gallery-sync.ts — do not edit.
import type { GalleryItem } from "./types";

export const galleryCatalog: GalleryItem[] = ${JSON.stringify(catalog, null, 2)};
`;
}

function renderLoaders(catalog: GalleryItem[]): string {
  const entries = catalog
    .map(
      (item) =>
        `  ${JSON.stringify(item.id)}: dynamic(() =>
    import("@/app/components/ui-gallery/demos/${item.id}/index")
  ),`
    )
    .join("\n");

  if (!entries) {
    return `"use client";

// AUTO-GENERATED by scripts/ui-gallery-sync.ts — do not edit.
import type { ComponentType } from "react";

export const galleryLoaders: Record<string, ComponentType> = {};
`;
  }

  return `"use client";

// AUTO-GENERATED by scripts/ui-gallery-sync.ts — do not edit.
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const galleryLoaders: Record<string, ComponentType> = {
${entries}
};
`;
}

function renderSources(sources: Record<string, GalleryFile[]>): string {
  return `${JSON.stringify(sources, null, 2)}\n`;
}

async function writeIfChanged(filePath: string, content: string): Promise<boolean> {
  let current: string | null = null;
  try {
    current = await readFile(filePath, "utf8");
  } catch {
    current = null;
  }
  if (current === content) return false;
  await writeFile(filePath, content, "utf8");
  return true;
}

async function fileContent(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export async function syncGallery(options: { check?: boolean } = {}): Promise<number> {
  const result = await buildGallery();

  if (result.errors.length > 0) {
    console.error(`\n✖ UI Gallery 校验失败（${result.errors.length} 个问题）\n`);
    for (const error of result.errors) console.error(`  - ${error}`);
    console.error("");
    return 1;
  }

  const outputs: Array<[string, string]> = [
    [CATALOG_PATH, renderCatalog(result.catalog)],
    [LOADERS_PATH, renderLoaders(result.catalog)],
    [SOURCES_PATH, renderSources(result.sources)],
  ];

  if (options.check) {
    const stale: string[] = [];
    for (const [filePath, content] of outputs) {
      if ((await fileContent(filePath)) !== content) {
        stale.push(path.relative(ROOT, filePath));
      }
    }
    if (stale.length > 0) {
      console.error("\n✖ 生成文件不是最新，请运行 npm run ui:sync\n");
      for (const file of stale) console.error(`  - ${file}`);
      console.error("");
      return 1;
    }
    console.log(
      `✓ UI Gallery 已是最新（${result.catalog.length} 个作品${
        result.hidden.length > 0 ? `，${result.hidden.length} 个隐藏` : ""
      }）`
    );
    return 0;
  }

  const changed: string[] = [];
  for (const [filePath, content] of outputs) {
    if (await writeIfChanged(filePath, content)) {
      changed.push(path.relative(ROOT, filePath));
    }
  }

  for (const warning of result.warnings) console.warn(`  ! ${warning}`);

  const counts = galleryKinds
    .map((kind) => `${kind}: ${result.catalog.filter((i) => i.kind === kind).length}`)
    .join(" · ");
  console.log(
    `\n✓ UI Gallery 同步完成（${result.catalog.length} 个作品 — ${counts}${
      result.hidden.length > 0 ? `；${result.hidden.length} 个隐藏` : ""
    }）`
  );
  console.log(
    changed.length > 0
      ? `  已更新：\n${changed.map((file) => `    - ${file}`).join("\n")}`
      : "  生成文件无变化"
  );
  console.log("");
  return 0;
}

const invokedDirectly =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) {
  syncGallery({ check: process.argv.includes("--check") })
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
