# Floating Label Input

## 关键点

- 用 `useId()` 生成 id 并让 `<label htmlFor>` 绑定，避免多实例 id 冲突，键盘点击标签也能聚焦输入框。
- 上浮条件是 `focused || value.length > 0`，不能只看 focus，否则填完失焦后标签会掉回占位位置。
- 上浮时改 `origin-left` + `text-[11px]`，从中间位置缩放会产生更自然的过渡。

## 可复用之处

- 密码、搜索、地址等表单字段都可以直接替换 `type` 与校验文案。

## 注意

- 纯 CSS 方案可用 `peer-focus:` + `peer-[:not(:placeholder-shown)]:`，但需要 `placeholder=" "` 且无法做自定义校验提示；有业务校验时用受控组件更清晰。
- 错误态应额外提供 `aria-invalid` 与 `aria-describedby`，这里为了演示只做了提示文案。
