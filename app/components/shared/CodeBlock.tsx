"use client";

import { useRef, useState } from "react";
import { BiCopy } from "react-icons/bi";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { Refractor } from "@/lib/refractor-languages";
import { cn } from "@/lib/utils";
import {
  extractCodeTextFromPreChildren,
  formatCodeLanguageLabel,
  resolveHighlightLanguage,
} from "@/lib/code-language-label";

// Supported languages: https://prismjs.com/#supported-languages

type PortableTextCodeProps = {
  value: {
    code: string;
    language: string;
    filename?: string | null;
  };
};

type MdxCodeBlockProps = React.HTMLAttributes<HTMLPreElement> & {
  children: React.ReactNode;
  language?: string;
};

type CodeBlockProps = PortableTextCodeProps | MdxCodeBlockProps;

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "已复制代码" : "复制代码"}
      title={copied ? "已复制" : "复制代码"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 text-zinc-500 backdrop-blur transition hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-400 dark:hover:text-white"
    >
      {copied ? (
        <RiCheckboxCircleFill className="text-green-500" />
      ) : (
        <BiCopy />
      )}
    </button>
  );
}

function MdxCopyButton({
  getContent,
}: {
  getContent: () => string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const content = getContent();
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "已复制代码" : "复制代码"}
      title={copied ? "已复制" : "复制代码"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 text-zinc-500 backdrop-blur transition hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-400 dark:hover:text-white"
    >
      {copied ? (
        <RiCheckboxCircleFill className="text-green-500" />
      ) : (
        <BiCopy />
      )}
    </button>
  );
}

function isPortableTextCodeProps(
  props: CodeBlockProps
): props is PortableTextCodeProps {
  return "value" in props;
}

function CodeWithLineNumbers({
  code,
  language,
  className,
}: {
  code: string;
  language: string;
  className?: string;
}) {
  const lines = code.split("\n");

  return (
    <div className="flex overflow-x-auto">
      <div
        className="shrink-0 select-none border-r border-zinc-200 bg-zinc-50/50 py-4 pl-3 pr-3 text-right font-mono text-[0.83rem] font-extralight leading-[1.5] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-500"
        aria-hidden="true"
      >
        {lines.map((_, index) => (
          <span key={index} className="block tabular-nums">
            {index + 1}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <Refractor
          language={language}
          value={code}
          className={cn("text-sm tracking-normal !my-0", className)}
        />
      </div>
    </div>
  );
}

export default function CodeBlock(props: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);

  if (isPortableTextCodeProps(props)) {
    const { value } = props;
    const language = resolveHighlightLanguage(value.language);

    return (
      <div className="my-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
          <p className="truncate text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {value.filename ||
              formatCodeLanguageLabel(value.language) ||
              "Code"}
          </p>
          <CopyButton content={value.code} />
        </div>
        <CodeWithLineNumbers code={value.code} language={language} />
      </div>
    );
  }

  const { children, className, language, ...rest } = props;
  const headerLabel = formatCodeLanguageLabel(language);
  const code = extractCodeTextFromPreChildren(children);
  const highlightLanguage = resolveHighlightLanguage(language);

  return (
    <div className="group my-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
        <p className="truncate text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {headerLabel}
        </p>
        <MdxCopyButton getContent={() => code} />
      </div>
      {code ? (
        <CodeWithLineNumbers
          code={code}
          language={highlightLanguage}
          className={className}
        />
      ) : (
        <pre
          ref={preRef}
          {...rest}
          className={`w-full max-w-full overflow-x-auto px-4 py-4 text-sm ${className || ""}`}
        >
          {children}
        </pre>
      )}
    </div>
  );
}
