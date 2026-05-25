import { profileQuery } from "@/lib/sanity.query";
import type { ProfileType } from "@/types";
import { sanityFetch } from "@/lib/sanity.client";
import { MarkdownOrPortableText } from "../shared/MarkdownOrPortableText";
import { CustomPortableTextFavicon } from "../shared/CustomPortableTextFavicon";

export default async function Usage() {
  const profile: ProfileType = await sanityFetch({
    query: profileQuery,
    tags: ["profile"],
  });

  return (
    <section className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-4xl mb-4 font-bold tracking-tight">Usage</h2>
        <p className="dark:text-zinc-400 text-zinc-600 max-w-xl">
          Tools, technologies and gadgets I use on a daily basis but not limited
          to.
        </p>
      </div>
      <MarkdownOrPortableText
        value={profile?.usage}
        components={CustomPortableTextFavicon}
      />
    </section>
  );
}
