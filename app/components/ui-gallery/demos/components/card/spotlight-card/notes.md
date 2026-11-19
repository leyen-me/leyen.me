# Spotlight Card

## 关键点

- 坐标写到 `element.style.setProperty("--spotlight-x", ...)`，而不是 `useState`：mousemove 频率高，走 React 状态会产生大量无谓渲染。
- 光斑层 `pointer-events-none` + `opacity-0 → group-hover:opacity-100`，鼠标离开后自然淡出。
- 坐标默认值 `50%`，保证首次渲染（尚未移动）也有合理光斑位置。

## 可复用之处

- 任何需要「局部高亮」的卡片、导航项、表格行都可以套用，只需换 `radial-gradient` 颜色。

## 注意

- 光斑容器必须 `overflow-hidden`，否则光晕会溢出圆角。
- 触屏没有 hover，建议在移动端直接隐藏光斑层（可用 `hidden md:block`）。
