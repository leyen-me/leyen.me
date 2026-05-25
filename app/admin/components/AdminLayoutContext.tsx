"use client";

import { createContext, useContext } from "react";

type AdminLayoutContextValue = {
  immersiveWriting: boolean;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
};

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null);

export function AdminLayoutProvider({
  value,
  children,
}: {
  value: AdminLayoutContextValue;
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutContext.Provider value={value}>{children}</AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error("useAdminLayout must be used within AdminShell");
  }
  return context;
}

export function isPostWritingPath(pathname: string) {
  if (pathname === "/admin/posts/new") return true;
  return /^\/admin\/posts\/[^/]+$/.test(pathname);
}
