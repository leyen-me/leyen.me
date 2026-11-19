# Floating Navbar

## 关键点

- 胶囊导航依赖 `rounded-full` + 内部统一 `p-2` 间距，圆角才能与内容对齐。
- `backdrop-blur-md` 只在整个 nav 上设置一次，避免每个子元素分别合成。
- 活动项用 `aria-current="page"` 表达，而不是只靠颜色。
- 移动端菜单用 `aria-expanded` + `aria-controls` 连接到列表，读屏可感知展开状态。

## 可复用之处

- 落地页、文档站、后台顶栏。

## 注意

- 真正吸顶时再加 `sticky top-4 z-40`；在 iframe 预览里 `sticky` 没有滚动上下文，所以这里保持静态。
- 折叠菜单若内容较多，需要处理 Esc 关闭与焦点回退。
