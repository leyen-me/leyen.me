import { Metadata } from "next";
import { Suspense } from "react";
import { sanityFetch } from "@/lib/sanity.client";
import { interviewsQuery } from "@/lib/sanity.query";
import type { InterviewQuestionListItem } from "@/types";
import PageHeading from "@/app/components/shared/PageHeading";
import { InterviewCard } from "@/app/components/shared/InterviewCard";
import { InterviewFilters } from "@/app/components/shared/InterviewFilters";
import EmptyState from "@/app/components/shared/EmptyState";

export const metadata: Metadata = {
  title: "Interviews | Leyen",
  description: "个人整理的前端面试题，方便复习与查阅。",
  openGraph: {
    title: "Interviews | Leyen",
    description: "个人整理的前端面试题，方便复习与查阅。",
    type: "website",
    locale: "zh_CN",
    url: "https://leyen.me/interviews",
  },
};

function filterByCategory(
  list: InterviewQuestionListItem[],
  cat?: string
) {
  if (!cat) return list;
  return list.filter((i) => i.category === cat);
}

export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const interviews = await sanityFetch<InterviewQuestionListItem[]>({
    query: interviewsQuery,
    tags: ["interviewQuestion"],
  });

  const filtered = filterByCategory(interviews, searchParams.cat);

  return (
    <div className="max-w-7xl mx-auto md:px-16 px-6">
      <PageHeading
        title="Interviews"
        description="个人整理的前端面试题，方便复习与查阅。"
      />

      <Suspense fallback={<div className="h-32 mb-8" aria-hidden />}>
        <InterviewFilters />
      </Suspense>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map((item) => (
            <InterviewCard key={item._id} interview={item} />
          ))}
        </div>
      ) : (
        <EmptyState value="Interview question" />
      )}
    </div>
  );
}
