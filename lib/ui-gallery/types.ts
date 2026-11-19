/**
 * UI Gallery 的类型契约。
 *
 * 作品源码是唯一事实来源：每个作品位于
 * `app/components/ui-gallery/demos/<kind>/<category>/<slug>/`，
 * 以 `index.tsx` 为入口、`meta.ts` 为元数据。
 * `scripts/ui-gallery-sync.ts` 会扫描目录并生成 catalog / loaders / sources。
 */

export type GalleryKind = "components" | "blocks";

export type GalleryStatus = "ready" | "wip";

export type GallerySource = {
  /** 例：`Original`、`Inspired by Uiverse` */
  label: string;
  url?: string;
  license?: string;
};

/** `meta.ts` 中允许声明的字段 */
export type GalleryMeta = {
  title: string;
  summary: string;
  /** 跨分类检索用，如 glass / motion / scroll */
  tags?: string[];
  status?: GalleryStatus;
  featured?: boolean;
  /** YYYY-MM-DD，缺省时使用目录创建时间 */
  createdAt?: string;
  /**
   * 仅作参考示例保留，不进入 gallery 列表、路由与打包产物。
   * 适合给 agent 看的示例作品。
   */
  hidden?: boolean;
  source: GallerySource;
  /** 依赖声明，只能是 package.json 中已安装的包 */
  requires?: string[];
};

export type GalleryFile = {
  path: string;
  language: string;
  code: string;
};

/** 列表/索引使用的轻量数据（不含源码） */
export type GalleryItem = {
  id: string;
  kind: GalleryKind;
  category: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  status: GalleryStatus;
  featured: boolean;
  createdAt: string;
  source: GallerySource;
  /** 去重后的外部依赖（不含 react / next） */
  dependencies: string[];
  /** 相对作品目录的文件路径，仅用于展示文件数量 */
  files: string[];
};

/** sources.generated.json 的结构：作品 id → 源码文件列表 */
export type GallerySourceFiles = GalleryFile[];
