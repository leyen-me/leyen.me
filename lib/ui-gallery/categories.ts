import type { GalleryKind } from "./types";

export type GalleryCategory = {
  id: string;
  label: string;
  description: string;
};

export type GalleryKindMeta = {
  label: string;
  description: string;
  /** components 直接渲染，blocks 在 iframe 中渲染 */
  preview: "live" | "iframe";
};

export const galleryKinds = ["components", "blocks"] as const;

export const galleryKindMeta: Record<GalleryKind, GalleryKindMeta> = {
  components: {
    label: "Components",
    description: "可复用的界面单元，直接渲染在页面中预览。",
    preview: "live",
  },
  blocks: {
    label: "Blocks",
    description: "由多个组件拼成的整块页面区域，在隔离的 iframe 中预览。",
    preview: "iframe",
  },
};

export const galleryCategories: Record<GalleryKind, GalleryCategory[]> = {
  components: [
    { id: "button", label: "Button", description: "按钮、操作触发器与加载态。" },
    { id: "input", label: "Input", description: "输入框、选择器与表单控件。" },
    { id: "form", label: "Form", description: "完整表单与校验交互。" },
    { id: "card", label: "Card", description: "卡片、容器与悬浮效果。" },
    { id: "tabs", label: "Tabs", description: "分段控件、标签切换。" },
    { id: "modal", label: "Modal", description: "对话框、抽屉与弹层。" },
    { id: "toast", label: "Toast", description: "轻提示、通知与状态反馈。" },
    { id: "tooltip", label: "Tooltip", description: "悬浮提示与浮层信息。" },
    { id: "table", label: "Table", description: "数据表格与列表。" },
    { id: "navigation", label: "Navigation", description: "菜单、分页与导航控件。" },
    { id: "feedback", label: "Feedback", description: "加载、空态、进度与骨架屏。" },
    { id: "data-display", label: "Data Display", description: "数字、徽标与数据可视化。" },
    { id: "typography", label: "Typography", description: "文本效果与排版。" },
  ],
  blocks: [
    { id: "hero", label: "Hero", description: "首屏区块与主视觉。" },
    { id: "navbar", label: "Navbar", description: "顶部导航与悬浮菜单。" },
    { id: "footer", label: "Footer", description: "页脚与站点信息区。" },
    { id: "feature-grid", label: "Feature Grid", description: "特性介绍与 Bento 布局。" },
    { id: "pricing", label: "Pricing", description: "定价表与套餐对比。" },
    { id: "testimonial", label: "Testimonial", description: "用户评价与品牌背书。" },
    { id: "faq", label: "FAQ", description: "常见问题与折叠列表。" },
    { id: "cta", label: "CTA", description: "转化引导区块。" },
    { id: "auth", label: "Auth", description: "登录、注册与验证流程。" },
    { id: "dashboard", label: "Dashboard", description: "数据概览与后台布局。" },
    { id: "gallery", label: "Gallery", description: "图片墙与作品展示。" },
  ],
};

export function isGalleryKind(value: string): value is GalleryKind {
  return (galleryKinds as readonly string[]).includes(value);
}

export function findGalleryCategory(
  kind: GalleryKind,
  categoryId: string
): GalleryCategory | undefined {
  return galleryCategories[kind].find((category) => category.id === categoryId);
}

export function getGalleryCategoryLabel(
  kind: GalleryKind,
  categoryId: string
): string {
  return findGalleryCategory(kind, categoryId)?.label ?? categoryId;
}
