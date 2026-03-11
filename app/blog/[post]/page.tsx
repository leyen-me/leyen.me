import Image from "next/legacy/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PostType } from "@/types";
import { singlePostQuery } from "@/lib/sanity.query";
import { toPlainText } from "@portabletext/react";
import { createCompiler } from "@fumadocs/mdx-remote";
import { getMDXComponents } from "@/mdx-components";
import { convertPortableTextToMarkdown } from "@/lib/portable-text-to-markdown";
import { BiChevronRight, BiSolidTime } from "react-icons/bi";
import { formatDate } from "../../utils/date";
import SharePost from "../../components/shared/SharePost";
import CopyMarkdownButton from "../../components/shared/CopyMarkdownButton";
import { Slide } from "../../animation/Slide";
import { urlFor } from "@/lib/sanity.image";
import Buymeacoffee from "@/app/components/shared/Buymeacoffee";
import PostTableOfContents from "@/app/components/pages/PostTableOfContents";
// import Comments from "@/app/components/shared/Comments";
import { HiCalendar } from "react-icons/hi";
import { sanityFetch } from "@/lib/sanity.client";
import { readTime } from "@/app/utils/readTime";
import { extractMarkdownHeadings } from "@/lib/markdown-headings";

type Props = {
  params: {
    post: string;
  };
};

const fallbackImage: string =
  "https://res.cloudinary.com/victoreke/image/upload/v1692636087/victoreke/blog.png";

const mdxCompiler = createCompiler({
  rehypeCodeOptions: {
    themes: { light: "github-light", dark: "github-dark" },
    fallbackLanguage: "plaintext", // 当语言标识符无效时（如 startLine:endLine:filepath）使用纯文本
  },
  rehypeTocOptions: false, // format: "md" 会产生 raw 节点，rehype-toc 无法处理，需禁用
  format: "md", // 纯 Markdown 模式，禁用 import/export 与 {expression} 解析，避免 acorn 报错
});

async function FumadocsContent({ markdown }: { markdown: string }) {
  if (!markdown) return null;
  const compiled = await mdxCompiler.compile({ source: markdown });
  const MdxContent = compiled.body;
  return <MdxContent components={getMDXComponents()} />;
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.post;
  const post: PostType = await sanityFetch({
    query: singlePostQuery,
    tags: ["Post"],
    qParams: { slug },
  });

  if (!post) {
    notFound();
  }

  return {
    title: `${post.title}`,
    metadataBase: new URL(`https://leyen.me/blog/${post.slug}`),
    description: post.description,
    publisher: post.author.name,
    keywords: post.tags,
    alternates: {
      canonical:
        post.canonicalLink || `https://leyen.me/blog/${post.slug}`,
    },
    openGraph: {
      images:
        urlFor(post.coverImage?.image).width(1200).height(630).url() ||
        fallbackImage,
      url: `https://leyen.me/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      type: "article",
      siteName: "leyen.me",
      authors: post.author.name,
      tags: post.tags,
      publishedTime: post._createdAt,
      modifiedTime: post._updatedAt || "",
    },
    twitter: {
      title: post.title,
      description: post.description,
      images:
        urlFor(post.coverImage?.image).width(680).height(340).url() ||
        fallbackImage,
      creator: `@${post.author.twitterUrl.split("twitter.com/")[1]}`,
      site: `@${post.author.twitterUrl.split("twitter.com/")[1]}`,
      card: "summary_large_image",
    },
  };
}

export default async function Post({ params }: Props) {
  const slug = params.post;
  const post: PostType = await sanityFetch({
    query: singlePostQuery,
    tags: ["Post"],
    qParams: { slug },
  });

  if (!post) {
    notFound();
  }

  const markdown =
    post.content?.trim() ||
    (post.body?.length ? convertPortableTextToMarkdown(post.body) : "");
  const words = post.content
    ? post.content.replace(/#{1,6}\s|[*_`~\[\]()]/g, "").trim()
    : toPlainText(post.body || []);
  const headings = extractMarkdownHeadings(markdown);
  const publishedAt = post.date ? post.date : post._createdAt;
  const publishedLabel = formatDate(publishedAt);
  const updatedLabel = formatDate(post._updatedAt || post._createdAt);
  const authorHandle = post.author.twitterUrl
    .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, "")
    .replace(/\/$/, "");

  return (
    <main className="mx-auto max-w-7xl px-6 md:px-16">
      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[17.5rem_minmax(0,1fr)] xl:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-24 h-[calc(100vh-7rem)] overflow-hidden">
            <PostTableOfContents headings={headings} />
          </div>
        </aside>

        <article className="min-w-0 max-w-4xl">
          <header
            id="overview"
            className="scroll-mt-28 border-b border-zinc-200 pb-10 pt-6 dark:border-zinc-800"
          >
            <Slide className="flex items-center gap-x-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Link
                href="/blog"
                className="whitespace-nowrap transition hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Blog
              </Link>
              <BiChevronRight className="shrink-0" />
              <p className="truncate">{post.title}</p>
            </Slide>

            <Slide delay={0.05} className="mt-8">
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="inline-flex items-center gap-x-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                  <HiCalendar />
                  <time dateTime={publishedAt}>{publishedLabel}</time>
                </div>
                <div className="inline-flex items-center gap-x-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                  <BiSolidTime />
                  <span>{readTime(words)}</span>
                </div>
                <div className="inline-flex items-center gap-x-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                  <span>Updated</span>
                  <span>{updatedLabel}</span>
                </div>
                {markdown ? <CopyMarkdownButton markdown={markdown} /> : null}
              </div>

              <h1 className="mt-6 max-w-4xl font-incognito text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[3.35rem] sm:leading-[1.05]">
                {post.title}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                {post.description}
              </p>

              {post.tags?.length ? (
                <ul className="mt-6 flex flex-wrap items-center gap-2">
                  {post.tags.map((tag, id) => (
                    <li
                      key={id}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="relative mt-8 overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="relative w-full h-40 pt-[52.5%]">
                  <Image
                    className="object-cover"
                    layout="fill"
                    src={post.coverImage?.image || fallbackImage}
                    alt={post.coverImage?.alt || post.title}
                    quality={100}
                    placeholder={post.coverImage?.lqip ? `blur` : "empty"}
                    blurDataURL={post.coverImage?.lqip || ""}
                  />
                </div>
              </div>
            </Slide>
          </header>

          <Slide delay={0.1}>
            <div className="article-content mt-8 min-w-0">
              <FumadocsContent markdown={markdown} />
            </div>
          </Slide>

          <Slide delay={0.15}>
            <div className="mt-14 border-t border-zinc-200 pt-10 dark:border-zinc-800">
              <section className="rounded-3xl border border-zinc-200 bg-zinc-50/60 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-sm uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Written by
                </p>
                <address className="mt-4 flex items-center gap-x-4 not-italic">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-800">
                    <Image
                      src={urlFor(post.author.photo.image)
                        .width(96)
                        .height(96)
                        .url()}
                      alt={post.author.photo.alt}
                      layout="fill"
                      className="object-cover"
                    />
                  </div>
                  <div rel="author">
                    <h2 className="font-incognito text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {post.author.name}
                    </h2>
                    <a
                      href={post.author.twitterUrl}
                      className="mt-1 inline-flex text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      @{authorHandle}
                    </a>
                  </div>
                </address>
              </section>

              <div className="mt-10">
                <SharePost
                  title={post.title}
                  slug={post.slug}
                  description={post.description}
                />
              </div>

              {/* <section className="mt-10 border-b border-zinc-200 pb-10 dark:border-zinc-800">
                <h2 className="font-incognito text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Featured
                </h2>
                <div className="mt-5">
                  <FeaturedPosts params={params.post} />
                </div>
              </section> */}
            </div>
          </Slide>
          <section className="pt-10">
            <h3 className="font-incognito text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 lg:text-4xl">
              Support
            </h3>
            <div className="mt-6">
              <Buymeacoffee />
            </div>
          </section>
        </article>
      </div>

      {/* <section
        id="comments"
        className="max-w-3xl mt-10 lg:border-t dark:border-zinc-800 border-zinc-200 lg:py-10 pt-0"
      >
        <h3 className="lg:text-4xl text-3xl font-semibold tracking-tight mb-8">
          Comments
        </h3>
        <Comments />
      </section> */}
    </main>
  );
}
