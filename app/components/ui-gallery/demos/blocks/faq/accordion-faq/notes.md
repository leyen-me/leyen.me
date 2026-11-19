# Accordion FAQ

## 关键点

- 原生 `details/summary` 自带展开状态与键盘支持，不需要额外 JS，也不会出现「点了没反应」的无障碍死角。
- 隐藏三角标记同时兼容：`list-none` 处理现代浏览器，`[&::-webkit-details-marker]:hidden` 处理 WebKit。
- 图标用两条 1px 线拼成加号，`group-open:rotate-45` 变叉号，比替换 SVG 更轻。
- 内容区域用 `pr-10` 避开图标列，长答案不会贴边。

## 可复用之处

- FAQ、文档折叠说明、设置项说明。

## 注意

- `details` 默认不互斥；需要手风琴效果时使用 `name` 属性（现代浏览器支持）。
- 展开动画不能直接 `height: auto` 过渡，需要 `grid-template-rows` 或 JS 测量高度。
