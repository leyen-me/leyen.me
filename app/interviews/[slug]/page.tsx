import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/lib/sanity.client";
import { singleInterviewQuery } from "@/lib/sanity.query";
import type { InterviewQuestionType } from "@/types";
import { MdxMarkdownBody } from "@/app/components/shared/MdxMarkdownBody";
import { Slide } from "@/app/animation/Slide";
import { formatDate } from "@/app/utils/date";
import { getInterviewCategoryLabel } from "@/lib/interview-categories";
import { markdownToPlainExcerpt } from "@/lib/markdown-excerpt";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const interview = await sanityFetch<InterviewQuestionType | null>({
    query: singleInterviewQuery,
    tags: ["interviewQuestion"],
    qParams: { slug: params.slug },
  });

  if (!interview) {
    return { title: "Not found" };
  }

  const description =
    markdownToPlainExcerpt(interview.answer ?? "") || interview.title;

  return {
    title: `${interview.title} | Interviews`,
    description,
    openGraph: {
      title: interview.title,
      description,
      type: "article",
      url: `https://leyen.me/interviews/${interview.slug}`,
    },
  };
}

export default async function InterviewDetailPage({ params }: Props) {
  const interview = await sanityFetch<InterviewQuestionType | null>({
    query: singleInterviewQuery,
    tags: ["interviewQuestion"],
    qParams: { slug: params.slug },
  });

  if (!interview) {
    notFound();
  }

  const markdown = interview.answer?.trim() ?? "";

  return (
    <main className="max-w-3xl mx-auto lg:px-16 px-8 pb-16">
      <Slide>
        <div className="mb-8">
          <Link
            href="/interviews"
            className="text-sm text-zinc-500 hover:text-primary-color transition-colors"
          >
            ← Interviews
          </Link>
        </div>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-color">
              {getInterviewCategoryLabel(interview.category)}
            </span>
          </div>

          <h1 className="font-incognito font-semibold tracking-tight sm:text-5xl text-3xl mb-6 lg:leading-[3.7rem]">
            {interview.title}
          </h1>

          <p className="text-xs text-zinc-500">
            Updated {formatDate(interview._updatedAt)}
          </p>
        </header>

        <section className="border-t border-zinc-200 dark:border-zinc-800 pt-10">
          <h2 className="font-incognito text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            面试回答
          </h2>
          {markdown ? (
            <div className="article-content min-w-0">
              <MdxMarkdownBody markdown={markdown} />
            </div>
          ) : (
            <p className="text-zinc-500 text-sm italic">
              可在 Studio 中补充「面试回答」Markdown。
            </p>
          )}
        </section>
      </Slide>
    </main>
  );
}
