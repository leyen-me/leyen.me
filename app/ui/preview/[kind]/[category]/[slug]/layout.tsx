/**
 * iframe 内只需要作品本身：隐藏站点导航与页脚，并去掉噪点背景。
 * 使用 dangerouslySetInnerHTML 输出 CSS：直接渲染字符串子节点时，
 * 服务端会把 `>` 转义成 `&gt;`，与客户端文本不一致导致 hydration 警告。
 */
const PREVIEW_RESET_CSS = `
body > header,
body > footer {
  display: none !important;
}
body {
  background-image: none !important;
}
html {
  scroll-behavior: auto;
}
`;

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PREVIEW_RESET_CSS }} />
      {children}
    </>
  );
}
