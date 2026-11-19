# Gradient Border Button

## 关键点

- 渐变边框不是 `border-image`，而是外层 `p-[1.5px]` + 内层实底圆角，才能保证内外圆角同心且描边不模糊。
- `conic-gradient` 负责色彩，`blur-[1px]` 让边缘过渡更柔和，hover 时只提升 `opacity`，避免重绘整条渐变。
- 焦点态使用 `focus-visible`，键盘用户可见、鼠标点击不出现外圈。

## 可复用之处

- 任何「渐变描边 + 实底内容」的卡片、头像、输入框都可以复用这个双层结构。

## 注意

- 渐变进度条若要旋转动画，需要 `@property --angle` 配合 `conic-gradient(from var(--angle))`，否则无法平滑插值。
