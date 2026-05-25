import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | leyen.me",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {children}
    </div>
  );
}
