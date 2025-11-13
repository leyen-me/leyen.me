import { defineField, defineType } from "sanity";
import { BiSolidQuoteRight } from "react-icons/bi";

export const quote = defineType({
  name: "quote",
  title: "Quote",
  type: "document",
  icon: BiSolidQuoteRight,
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      description: "The actual quote text"
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      description: "The author of the quote",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "context",
      title: "Context / Theme",
      type: "string",
      description: "The context or theme where this quote appears (short title)",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      description: "Add relevant tags (e.g., philosophy, humor, wisdom)",
      of: [
        {
          type: "string",
          validation: (Rule) => Rule.required().min(1).error("标签不能为空"),
        },
      ],
      validation: (Rule) => Rule.required().min(1).error("请至少添加一个标签"),
      options: {
        layout: "tags",
      },
    }),
  ],
  preview: {
    select: {
      quote: "quote",
      author: "author",
      tags: "tags",
    },
    prepare({ quote, author, tags }) {
      const preview = quote ? quote.substring(0, 50) + (quote.length > 50 ? "..." : "") : "No quote";
      return {
        title: preview,
        subtitle: `${author || "Unknown"} • ${tags?.join(", ") || "No tags"}`,
      };
    },
  },
  orderings: [
    {
      title: "Created Date, Newest",
      name: "createdAtDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
    {
      title: "Created Date, Oldest",
      name: "createdAtAsc",
      by: [{ field: "_createdAt", direction: "asc" }],
    },
  ],
});

