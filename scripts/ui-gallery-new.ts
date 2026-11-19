/**
 * 创建 UI Gallery 作品脚手架。
 *
 * 用法：
 *   npm run ui:new -- --kind components --category button --slug gradient-border --title "Gradient Border"
 *   npm run ui:new -- --kind blocks --category hero --slug aurora-hero --title "Aurora Hero" --tags gradient,motion
 */
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { findGalleryCategory, galleryKinds } from "../lib/ui-gallery/categories";
import type { GalleryKind } from "../lib/ui-gallery/types";
import { syncGallery } from "./ui-gallery-sync";

const ROOT = process.cwd();
const DEMOS_DIR = path.join(ROOT, "app/components/ui-gallery/demos");
const SLUG_REGEX = /^[a-z][a-z0-9-]*$/;

type Options = {
  kind: string;
  category: string;
  slug: string;
  title: string;
  summary?: string;
  tags: string[];
};

function parseArgs(argv: string[]): Partial<Options> {
  const options: Partial<Options> & { tags?: string[] } = {};

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (!raw.startsWith("--")) continue;
    const key = raw.slice(2);
    const next = argv[index + 1];
    const value = next && !next.startsWith("--") ? next : undefined;
    if (value === undefined) continue;
    index += 1;

    switch (key) {
      case "kind":
        options.kind = value;
        break;
      case "category":
        options.category = value;
        break;
      case "slug":
        options.slug = value;
        break;
      case "title":
        options.title = value;
        break;
      case "summary":
        options.summary = value;
        break;
      case "tags":
        options.tags = value
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        break;
      default:
        console.warn(`忽略未知参数 --${key}`);
    }
  }

  return options;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function renderEntry(title: string): string {
  return `"use client";

export default function Demo() {
  return (
    <div className="flex w-full items-center justify-center p-8">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        ${title} — TODO
      </p>
    </div>
  );
}
`;
}

function renderMeta(options: Required<Options>): string {
  return `import type { GalleryMeta } from "@/lib/ui-gallery/types";

const meta = {
  title: ${JSON.stringify(options.title)},
  summary: ${JSON.stringify(options.summary)},
  tags: ${JSON.stringify(options.tags)},
  status: "wip",
  createdAt: ${JSON.stringify(today())},
  source: { label: "Original", license: "MIT" },
  requires: [],
} satisfies GalleryMeta;

export default meta;
`;
}

function renderNotes(options: Required<Options>): string {
  return `# ${options.title}

## 关键点

- TODO

## 可复用之处

- TODO
`;
}

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<number> {
  const parsed = parseArgs(process.argv.slice(2));

  const missing = [
    ["--kind", parsed.kind],
    ["--category", parsed.category],
    ["--slug", parsed.slug],
    ["--title", parsed.title],
  ]
    .filter(([, value]) => !value)
    .map(([flag]) => flag);

  if (missing.length > 0) {
    console.error(`\n缺少参数：${missing.join(", ")}`);
    console.error(
      '\n示例：npm run ui:new -- --kind components --category button --slug gradient-border --title "Gradient Border"\n'
    );
    return 1;
  }

  const kind = parsed.kind as GalleryKind;
  if (!galleryKinds.includes(kind)) {
    console.error(`\n--kind 只能是 ${galleryKinds.join(" / ")}`);
    return 1;
  }

  const category = findGalleryCategory(kind, parsed.category!);
  if (!category) {
    console.error(`\n${kind} 下不存在分类 "${parsed.category}"，可选：`);
    console.error(
      `  ${(await import("../lib/ui-gallery/categories")).galleryCategories[kind]
        .map((item) => item.id)
        .join(", ")}\n`
    );
    return 1;
  }

  const slug = parsed.slug!;
  if (!SLUG_REGEX.test(slug)) {
    console.error("\n--slug 必须是小写 kebab-case（a-z、0-9、-）");
    return 1;
  }

  const options: Required<Options> = {
    kind,
    category: category.id,
    slug,
    title: parsed.title!,
    summary: parsed.summary ?? `${parsed.title} 组件演示。`,
    tags: parsed.tags ?? [],
  };

  const itemDir = path.join(DEMOS_DIR, kind, category.id, slug);
  if (await exists(itemDir)) {
    console.error(`\n作品目录已存在：${path.relative(ROOT, itemDir)}\n`);
    return 1;
  }

  await mkdir(itemDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(itemDir, "index.tsx"), renderEntry(options.title)),
    writeFile(path.join(itemDir, "meta.ts"), renderMeta(options)),
    writeFile(path.join(itemDir, "notes.md"), renderNotes(options)),
  ]);

  console.log(`\n✓ 已创建 ${path.relative(ROOT, itemDir)}`);
  return syncGallery();
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
