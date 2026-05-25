import { groq } from "next-sanity";

const adminPostFields = groq`
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  description,
  canonicalLink,
  date,
  coverImage {
    "assetId": asset._ref,
    "url": asset->url,
    "lqip": asset->metadata.lqip,
    alt
  },
  featured,
  tags,
  "authorId": author._ref,
  "authorName": author->name,
  content,
  isPublished
`;

export const adminPostsQuery = groq`*[_type == "Post"] | order(_createdAt desc) { ${adminPostFields} }`;
export const adminPostByIdQuery = groq`*[_type == "Post" && _id == $id][0] { ${adminPostFields} }`;

export const adminInterviewsQuery = groq`*[_type == "interviewQuestion"] | order(_updatedAt desc) {
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  category,
  answer,
  isPublished
}`;

export const adminInterviewByIdQuery = groq`*[_type == "interviewQuestion" && _id == $id][0] {
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  category,
  answer,
  isPublished
}`;

export const adminAuthorsQuery = groq`*[_type == "author"] | order(name asc) {
  _id,
  name,
  photo {
    "assetId": asset._ref,
    "url": asset->url,
    alt
  },
  twitterUrl
}`;

export const adminAuthorByIdQuery = groq`*[_type == "author" && _id == $id][0] {
  _id,
  name,
  photo {
    "assetId": asset._ref,
    "url": asset->url,
    alt
  },
  twitterUrl
}`;

export const adminQuotesQuery = groq`*[_type == "quote"] | order(_createdAt desc) {
  _id,
  _createdAt,
  contentType,
  quote,
  author,
  context,
  tags
}`;

export const adminQuoteByIdQuery = groq`*[_type == "quote" && _id == $id][0] {
  _id,
  _createdAt,
  contentType,
  quote,
  author,
  context,
  tags
}`;

export const adminMoviesQuery = groq`*[_type == "movie"] | order(releaseDate desc) {
  _id,
  title,
  "slug": slug.current,
  mediaType,
  coverImage {
    "assetId": asset._ref,
    "url": asset->url,
    alt
  },
  rating,
  releaseDate,
  director,
  cast,
  description,
  externalUrl
}`;

export const adminMovieByIdQuery = groq`*[_type == "movie" && _id == $id][0] {
  _id,
  title,
  "slug": slug.current,
  mediaType,
  coverImage {
    "assetId": asset._ref,
    "url": asset->url,
    alt
  },
  rating,
  releaseDate,
  director,
  cast,
  description,
  externalUrl
}`;

export const adminJobsQuery = groq`*[_type == "job"] | order(_createdAt desc) {
  _id,
  name,
  jobTitle,
  logo {
    "assetId": asset._ref,
    "url": asset->url
  },
  url,
  description,
  startDate,
  endDate
}`;

export const adminJobByIdQuery = groq`*[_type == "job" && _id == $id][0] {
  _id,
  name,
  jobTitle,
  logo {
    "assetId": asset._ref,
    "url": asset->url
  },
  url,
  description,
  startDate,
  endDate
}`;

export const adminProjectsQuery = groq`*[_type == "project"] | order(order asc, _createdAt desc) {
  _id,
  name,
  "slug": slug.current,
  tagline,
  logo {
    "assetId": asset._ref,
    "url": asset->url
  },
  projectUrl,
  repository,
  coverImage {
    "assetId": asset._ref,
    "url": asset->url,
    alt
  },
  description,
  order
}`;

export const adminProjectByIdQuery = groq`*[_type == "project" && _id == $id][0] {
  _id,
  name,
  "slug": slug.current,
  tagline,
  logo {
    "assetId": asset._ref,
    "url": asset->url
  },
  projectUrl,
  repository,
  coverImage {
    "assetId": asset._ref,
    "url": asset->url,
    alt
  },
  description,
  order
}`;

export const adminProfileQuery = groq`*[_type == "profile"][0] {
  _id,
  fullName,
  headline,
  profileImage {
    "assetId": asset._ref,
    "url": asset->url,
    "lqip": asset->metadata.lqip,
    alt
  },
  shortBio,
  email,
  location,
  fullBio,
  usage,
  "resumeAssetId": resumeURL.asset._ref,
  "resumeURL": resumeURL.asset->url
}`;
