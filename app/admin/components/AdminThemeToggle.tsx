"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminThemeToggle() {
  const { theme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start gap-3"
        disabled
        aria-label="加载主题"
      >
        <span className="h-4 w-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        主题
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start gap-3"
      onClick={toggleTheme}
      aria-label={isDark ? "切换浅色模式" : "切换深色模式"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {isDark ? "浅色模式" : "深色模式"}
    </Button>
  );
}
