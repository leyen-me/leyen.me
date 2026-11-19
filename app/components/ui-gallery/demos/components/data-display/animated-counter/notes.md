# Animated Counter

## 关键点

- 用 `IntersectionObserver` 而不是 scroll 事件：只在真正进入视口时启动，且不阻塞滚动。
- `started` 标志保证只播放一次；卸载时同时 `disconnect()` 与 `cancelAnimationFrame()`，避免内存泄漏。
- `prefers-reduced-motion: reduce` 时直接显示最终值，不做补间动画。
- `tabular-nums` 让数字宽度固定，滚动时不会左右抖动。

## 可复用之处

- 官网数据看板、作品集统计、价格展示。

## 注意

- 数字格式化不要用 `toFixed(0)` 拼接，`toLocaleString` 才能同时处理千分位与本地化。
- 服务端渲染首帧是 0，若 SEO 需要真实数字，应同时输出可读文本供爬虫读取。
