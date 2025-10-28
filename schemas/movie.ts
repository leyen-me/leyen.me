import { defineField, defineType } from "sanity";

export const movie = defineType({
  name: "movie",
  title: "Movie",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [
          { title: "Movie", value: "movie" },
          { title: "TV Show", value: "tv" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (Rule) => Rule.min(0).max(10),
    }),
    defineField({
      name: "releaseDate",
      title: "Release Date",
      type: "date",
    }),
    defineField({
      name: "director",
      title: "Director",
      type: "string",
    }),
    defineField({
      name: "cast",
      title: "Cast",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      mediaType: "mediaType",
    },
    prepare({ title, media, mediaType }) {
      return {
        title,
        media,
        subtitle: mediaType === "movie" ? "Movie" : "TV Show",
      };
    },
  },
});