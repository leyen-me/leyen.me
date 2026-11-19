# Aurora Hero

## 关键点

- 光斑全部是 `blur-3xl` 的圆形 div，不加载任何图片，首屏体积接近零。
- 漂浮用 CSS `@keyframes` 只改 `transform`，走合成层；三个光斑用负的 `animation-delay` 错开相位，避免同步摆动。
- `prefers-reduced-motion: reduce` 时直接关闭动画，布局完全不变。
- 标题用 `text-balance`，段落用 `text-pretty`，长文案断行更自然。

## 可复用之处

- 任意 SaaS / 产品官网首屏；替换 `dl` 区域即可变成数据展示。

## 注意

- `blur-3xl` 在大面积元素上开销不小，移动端可减少光斑数量或降低模糊半径。
- `bg-clip-text` 的渐变标题需要同时写 `text-transparent`，否则背景会盖住文字。
- 若改用 Framer Motion，注意当前项目 `@types/react` 为 v19，与 framer-motion v10 的类型定义存在冲突，优先选择 CSS 方案。
