import { Metadata } from "next";
import { ResumePageClient } from "./ResumePageClient";

export const metadata: Metadata = {
  title: "简历 | 雷光银",
  robots: "noindex, nofollow",
};

export default function ResumePage() {
  return <ResumePageClient />;
}
