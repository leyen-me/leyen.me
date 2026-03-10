"use client";

import { useRef, useState } from "react";
import { BiCopy } from "react-icons/bi";
import { RiCheckboxCircleFill } from "react-icons/ri";
import Refractor from "react-refractor";
import js from "refractor/lang/javascript";
import ts from "refractor/lang/typescript";
import tsx from "refractor/lang/tsx";
import jsx from "refractor/lang/jsx";
import sql from "refractor/lang/sql";
import bash from "refractor/lang/bash";
import markdown from "refractor/lang/markdown";
import css from "refractor/lang/css";
import scss from "refractor/lang/scss";
import python from "refractor/lang/python";
import html from "refractor/lang/markup";
import yaml from "refractor/lang/yaml";
import graphql from "refractor/lang/graphql";
import json from "refractor/lang/json";
import java from "refractor/lang/java";

// Supported languages: https://prismjs.com/#supported-languages
Refractor.registerLanguage(js);
Refractor.registerLanguage(ts);
Refractor.registerLanguage(jsx);
Refractor.registerLanguage(tsx);
Refractor.registerLanguage(sql);
Refractor.registerLanguage(bash);
Refractor.registerLanguage(markdown);
Refractor.registerLanguage(css);
Refractor.registerLanguage(scss);
Refractor.registerLanguage(python);
Refractor.registerLanguage(html);
Refractor.registerLanguage(yaml);
Refractor.registerLanguage(graphql);
Refractor.registerLanguage(json);
Refractor.registerLanguage(java);

type PortableTextCodeProps = {
  value: {
    code: string;
    language: string;
    filename?: string | null;
  };
};

type MdxCodeBlockProps = React.HTMLAttributes<HTMLPreElement> & {
  children: React.ReactNode;
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white/80 text-zinc-600 backdrop-blur transition hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:text-white"
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white/80 text-zinc-600 backdrop-blur transition hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:text-white"
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

export default function CodeBlock(props: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);

  if (isPortableTextCodeProps(props)) {
    const { value } = props;

    return (
      <div className="my-6">
        <div className="flex items-center justify-between rounded-t-lg border border-zinc-200 bg-zinc-50 px-4 py-3 translate-y-2 dark:border-zinc-800 dark:bg-[#141414]">
          {value.filename ? <p className="text-sm">{value.filename}</p> : <span />}
          <CopyButton content={value.code} />
        </div>
        <Refractor
          language={value.language ?? "jsx"}
          value={value.code}
          className="rounded-b-lg border-x border-b border-zinc-200 text-sm tracking-normal dark:border-zinc-800"
        />
      </div>
    );
  }

  const { children, className, ...rest } = props;

  return (
    <div className="group relative my-6">
      <div className="absolute right-3 top-3 z-10">
        <MdxCopyButton
          getContent={() => preRef.current?.textContent?.replace(/\n$/, "") ?? ""}
        />
      </div>
      <pre
        ref={preRef}
        {...rest}
        className={`w-full max-w-full overflow-x-auto rounded-lg border border-zinc-200 p-4 pr-14 text-sm dark:border-zinc-800 ${className || ""}`}
      >
        {children}
      </pre>
    </div>
  );
}
