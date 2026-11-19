export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* iframe 内只需要作品本身：隐藏站点导航与页脚，并去掉噪点背景 */}
      <style>{`
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
      `}</style>
      {children}
    </>
  );
}
