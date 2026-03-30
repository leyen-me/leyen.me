import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { sanityFetch } from "@/lib/sanity.client";
import { singleInterviewQuery } from "@/lib/sanity.query";
import type { InterviewQuestionType } from "@/types";
import { CustomPortableText } from "@/app/components/shared/CustomPortableText";
import { Slide } from "@/app/animation/Slide";
import { formatDate } from "@/app/utils/date";
import { getInterviewCategoryLabel } from "@/lib/interview-categories";

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

  return {
    title: `${interview.title} | Interviews`,
    description: interview.excerpt,
    openGraph: {
      title: interview.title,
      description: interview.excerpt,
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

  const tags = interview.tags ?? [];
  const followUps = interview.followUps ?? [];
  const related = interview.relatedQuestions ?? [];

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
            {interview.isFromWork ? (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Work
              </span>
            ) : null}
          </div>

          <h1 className="font-incognito font-semibold tracking-tight sm:text-5xl text-3xl mb-6 lg:leading-[3.7rem]">
            {interview.title}
          </h1>

          <p className="text-base dark:text-zinc-400 text-zinc-600 leading-relaxed mb-4">
            {interview.excerpt}
          </p>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-zinc-800/70 text-gray-600 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <p className="text-xs text-zinc-500">
            Updated {formatDate(interview._updatedAt)}
          </p>
        </header>

        <section className="space-y-10 border-t border-zinc-200 dark:border-zinc-800 pt-10">
          <div>
            <h2 className="font-incognito text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              短答案
            </h2>
            {interview.shortAnswer ? (
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {interview.shortAnswer}
              </p>
            ) : (
              <p className="text-zinc-500 text-sm italic">
                可在 Studio 中补充「短答案」。
              </p>
            )}
          </div>

          {interview.body && interview.body.length > 0 ? (
            <div>
              <h2 className="font-incognito text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                展开说明
              </h2>
              <div className="dark:text-zinc-400 text-zinc-600 leading-relaxed">
                <PortableText
                  value={interview.body}
                  components={CustomPortableText}
                />
              </div>
            </div>
          ) : null}

          {interview.workScenario ? (
            <div>
              <h2 className="font-incognito text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
                真实场景
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {interview.workScenario}
              </p>
            </div>
          ) : null}

          {followUps.length > 0 ? (
            <div>
              <h2 className="font-incognito text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
                追问
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-700 dark:text-zinc-300">
                {followUps.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {related.length > 0 ? (
            <div>
              <h2 className="font-incognito text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
                相关题
              </h2>
              <ul className="space-y-2">
                {related.map((r) => (
                  <li key={r._id}>
                    <Link
                      href={`/interviews/${r.slug}`}
                      className="text-primary-color hover:underline"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </Slide>
    </main>
  );
}
