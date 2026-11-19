# Gradient Text

## 关键点

- `bg-clip-text text-transparent` 是渐变文字的核心，缺少 `text-transparent` 就会看到背景块。
- 过渡的是 `background-position`，配合 `bg-[length:200%_100%]` 才有移动效果；只改颜色不会有滚动感。
- 渐变文字在低对比度背景下可读性差，正文不要用，标题与强调词足够。

## 可复用之处

- Hero 标题、数据大屏、营销页的强调句。

## 注意

- 选中文本时透明文字仍可被选中高亮，但部分浏览器会出现色块，必要时给 `::selection` 单独配色。
- 打印场景下背景通常被禁用，渐变文字会变成透明不可见，需要 `print:text-zinc-900` 兜底。
