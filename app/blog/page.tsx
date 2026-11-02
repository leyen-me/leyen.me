import { Metadata } from "next";
import { BiDetail } from "react-icons/bi";
import Posts from "../components/pages/Posts";
import Social from "../components/shared/Social";
import { Slide } from "../animation/Slide";
import PageHeading from "@/app/components/shared/PageHeading";
import { FALLBACK_COVER_IMAGE } from "@/lib/fallback-images";

export const metadata: Metadata = {
  title: "Blog | Leyen",
  metadataBase: new URL("https://leyen.me/blog"),
  description: "Read latest stories from Leyen's Blog",
  openGraph: {
    title: "Blog | Leyen",
    url: "https://leyen.me/blog",
    description: "Read latest stories from Leyen's Blog",
    images: FALLBACK_COVER_IMAGE,
  },
};

export default async function Blog() {
  return (
    <main className="max-w-7xl mx-auto md:px-16 px-6">
      <PageHeading
        title="Blog"
        description="Thoughts, reflections, and stories on what I learn and experience."
      >
        <Social type="publication" />
      </PageHeading>

      <Slide delay={0.1}>
        <div className="flex items-center gap-x-3 mb-8">
          <BiDetail />
          <h2 className="text-xl font-semibold tracking-tight">Explore All</h2>
        </div>
        <Posts />
      </Slide>
    </main>
  );
}
