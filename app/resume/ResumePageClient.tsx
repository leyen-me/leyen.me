"use client";

import { resumeData } from "./data";
import { Template2 } from "./templates/Template2";

const SHOW_PROJECT_DIAMOND_LINE = false;

export function ResumePageClient() {
  return (
    <main className="resume-page min-h-screen py-4 sm:py-8 md:py-12 flex flex-col items-center gap-4 sm:gap-6 px-2 sm:px-4 print:py-0 print:px-0 print:gap-4 print:min-h-0 overflow-x-hidden">
      <Template2 data={resumeData} showProjectDiamondLine={SHOW_PROJECT_DIAMOND_LINE} />
    </main>
  );
}
