import { Metadata } from "next";
import { Suspense } from "react";
import { sanityFetch } from "@/lib/sanity.client";
import {
  interviewsQuery,
  interviewAllTagsQuery,
} from "@/lib/sanity.query";
import type { InterviewQuestionListItem } from "@/types";
import PageHeading from "@/app/components/shared/PageHeading";
import { InterviewCard } from "@/app/components/shared/InterviewCard";
import { InterviewFilters } from "@/app/components/shared/InterviewFilters";
import EmptyState from "@/app/components/shared/EmptyState";

export const metadata: Metadata = {
  title: "Interviews | Leyen",
  description:
    "把日常工作里真正遇到的问题，整理成以后跳槽时能快速复习的题库。",
  openGraph: {
    title: "Interviews | Leyen",
    description:
      "把日常工作里真正遇到的问题，整理成以后跳槽时能快速复习的题库。",
    type: "website",
    locale: "zh_CN",
    url: "https://leyen.me/interviews",
  },
};

function filterInterviews(
  list: InterviewQuestionListItem[],
  cat?: string,
  tag?: string
) {
  let out = list;
  if (cat) {
    out = out.filter((i) => i.category === cat);
  }
  if (tag) {
    out = out.filter((i) => (i.tags ?? []).includes(tag));
  }
  return out;
}

export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: { cat?: string; tag?: string };
}) {
  const [interviews, tagsRaw] = await Promise.all([
    sanityFetch<InterviewQuestionListItem[]>({
      query: interviewsQuery,
      tags: ["interviewQuestion"],
    }),
    sanityFetch<string[]>({
      query: interviewAllTagsQuery,
      tags: ["interviewQuestion"],
    }),
  ]);

  const allTags = (tagsRaw ?? []).filter(Boolean);
  const filtered = filterInterviews(
    interviews,
    searchParams.cat,
    searchParams.tag
  );

  return (
    <div className="max-w-7xl mx-auto md:px-16 px-6">
      <PageHeading
        title="Interviews"
        description="把日常工作里真正遇到的问题，整理成以后跳槽时能快速复习的题库。"
      />

      <Suspense fallback={<div className="h-32 mb-8" aria-hidden />}>
        <InterviewFilters allTags={allTags} />
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
