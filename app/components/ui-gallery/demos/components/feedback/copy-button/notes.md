# Copy Button

## 关键点

- `navigator.clipboard` 在非 HTTPS 或权限被拒绝时会 reject，必须 `try/catch` 并给出可重试状态。
- 定时器保存在 `useRef` 中，组件卸载时清理；连续点击时先清除旧定时器，避免状态被提前重置。
- 状态变化通过 `aria-live="polite"` 播报，读屏用户能知道「已复制」。

## 可复用之处

- 代码块、邀请链接、API Key、分享按钮。

## 注意

- 纯 HTTP 环境下 `navigator.clipboard` 不可用，可回退到隐藏 `textarea` + `document.execCommand("copy")`（已废弃但仍需兼容）。
- 不要把「复制成功」当作同步结果，`await` 之后才算成功。
