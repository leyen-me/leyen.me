# Pill Tabs

## 关键点

- 滑块宽度用 `calc((100% - 0.5rem) / 3)`，与 `p-1` 内边距对齐；移动用 `translateX(calc(n * 100%))`，只触发合成层，不触发布局。
- `role="tablist"` / `role="tab"` / `aria-selected` 是基础语义，读屏能理解当前选中项。
- 按钮顺序与滑块顺序一致，避免动画过程中出现「滑过两个标签」。

## 可复用之处

- 把 `grid-cols-3` 换成 `grid-cols-{n}`，滑块公式同步改成 `/ n` 即可支持任意数量。

## 注意

- 完整的 Tabs 还需要方向键切换（`ArrowLeft/ArrowRight`）与 `tabIndex` 管理；这里聚焦视觉演示。
- 若标签文字长度差异很大，等宽布局会浪费空间，可改为按内容宽度测量后设置滑块位置。
