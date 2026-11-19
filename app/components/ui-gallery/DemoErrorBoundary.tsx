"use client";

import { Component, type ReactNode } from "react";

type DemoErrorBoundaryProps = {
  children: ReactNode;
  resetKey?: string;
};

type DemoErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

/**
 * 单个作品崩溃不应该影响整个页面。
 * 这里刻意不做错误上报，作品是静态内容，控制台日志足够定位。
 */
export class DemoErrorBoundary extends Component<
  DemoErrorBoundaryProps,
  DemoErrorBoundaryState
> {
  state: DemoErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): DemoErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }

  componentDidCatch(error: unknown) {
    console.error("[ui-gallery] demo crashed", error);
  }

  componentDidUpdate(previous: DemoErrorBoundaryProps) {
    if (previous.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: "" });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center dark:border-amber-500/40 dark:bg-amber-500/5"
      >
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
          这个作品渲染失败了
        </p>
        <p className="max-w-md font-mono text-xs text-amber-700/80 dark:text-amber-300/70">
          {this.state.message}
        </p>
        <button
          type="button"
          onClick={() => this.setState({ hasError: false, message: "" })}
          className="mt-2 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/10"
        >
          重试
        </button>
      </div>
    );
  }
}
