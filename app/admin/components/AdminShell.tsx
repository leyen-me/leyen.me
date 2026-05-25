"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import AdminSidebar, { adminNavItems } from "./AdminSidebar";
import {
  AdminLayoutProvider,
  isPostWritingPath,
} from "./AdminLayoutContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersiveWriting = isPostWritingPath(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(!immersiveWriting);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(!immersiveWriting);
  }, [immersiveWriting]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const shouldLockScroll = mobileOpen || (immersiveWriting && sidebarOpen);
    document.body.style.overflow = shouldLockScroll ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, immersiveWriting, sidebarOpen]);

  const layoutContext = useMemo(
    () => ({
      immersiveWriting,
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar: () => setSidebarOpen((open) => !open),
    }),
    [immersiveWriting, sidebarOpen]
  );

  const currentSection =
    adminNavItems.find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href)
    )?.label ?? "Admin";

  return (
    <AdminLayoutProvider value={layoutContext}>
      <div className="flex min-h-screen">
        {!immersiveWriting && (
          <div className="hidden lg:block">
            <div className="sticky top-0 h-screen">
              <AdminSidebar className="h-screen" />
            </div>
          </div>
        )}

        {immersiveWriting && sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="关闭菜单"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[min(288px,88vw)] shadow-xl">
              <AdminSidebar
                className="h-full"
                showClose
                onClose={() => setSidebarOpen(false)}
                onNavigate={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="关闭菜单"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[min(288px,88vw)] shadow-xl">
              <AdminSidebar
                className="h-full"
                showClose
                onClose={() => setMobileOpen(false)}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {!immersiveWriting && (
            <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setMobileOpen(true)}
                aria-label="打开菜单"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{currentSection}</p>
                <p className="truncate text-xs text-zinc-500">leyen Admin</p>
              </div>
            </header>
          )}

          <main
            className={cn(
              "min-w-0 flex-1",
              immersiveWriting
                ? "flex min-h-0 flex-col overflow-hidden"
                : "overflow-x-hidden p-4 sm:p-6 lg:p-8"
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </AdminLayoutProvider>
  );
}
