import { groq } from "next-sanity";

// Reusable post fields
const postField = groq`
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  description,
  coverImage {
    "image": asset->url,
    "lqip": asset->metadata.lqip,
    alt,
  },
  featured,
  isPublished
`;

export const profileQuery = groq`*[_type == "profile"][0]{
  _id,
  fullName,
  headline,
  profileImage {
    "image": asset->url,
    "lqip": asset->metadata.lqip,
    alt,
  },
  shortBio,
  location,
  fullBio,
  email,
  "resumeURL": resumeURL.asset->url,
  socialLinks,
  usage
}`;

export const jobQuery = groq`*[_type == "job"] | order(_createdAt desc){
  _id,
  name,
  jobTitle,
  "logo": logo.asset->url,
  url,
  description,
  startDate,
  endDate,
}`;

export const projectsQuery = groq`*[_type == "project"] | order(_createdAt desc){
  _id, 
  name,
  "slug": slug.current,
  tagline,
  "logo": logo.asset->url,
}`;

export const singleProjectQuery = groq`*[_type == "project" && slug.current == $slug][0]{
  _id,
  name,
  projectUrl,
  repository,
  coverImage {
    "image": asset->url,
    "lqip": asset->metadata.lqip,
    alt,
  },
  tagline,
  description
}`;

export const postsQuery = groq`*[_type == "Post"] | order(_createdAt desc){
  ${postField},
  date,
  "author": author-> {
    name, 
    photo, 
    twitterUrl
  },
  body,
}`;

export const featuredPostsQuery = groq`*[_type == "Post" && featured == true] | order(_createdAt desc) {
  ${postField}
}`;

export const singlePostQuery = groq`*[_type == "Post" && slug.current == $slug][0]{
  ${postField},
  _updatedAt,
  canonicalLink,
  date,
  tags,
  "author": author-> {
    name, 
    photo {
      "image": asset->url,
      alt
    }, 
    twitterUrl
  },
  body,
}`;

export const heroesQuery = groq`*[_type == "heroe"] | order(_createdAt asc) { _id, _createdAt, name, url, met }`;

// Movies queries
export const moviesQuery = groq`*[_type == "movie"] | order(releaseDate desc){
  _id,
  title,
  "slug": slug.current,
  mediaType,
  rating,
  releaseDate,
  director,
  description,
  externalUrl,
  coverImage {
    "image": asset->url,
    "lqip": asset->metadata.lqip,
    alt,
  }
}`;

export const moviesByTypeQuery = groq`*[_type == "movie" && mediaType == $type] | order(releaseDate desc){
  _id,
  title,
  "slug": slug.current,
  mediaType,
  rating,
  releaseDate,
  director,
  description,
  externalUrl,
  coverImage {
    "image": asset->url,
    "lqip": asset->metadata.lqip,
    alt,
  }
}`;

// Quotes queries
export const quotesQuery = groq`*[_type == "quote"] | order(_createdAt desc){
  _id,
  _createdAt,
  quote,
  author,
  context,
  tags
}`;

export const quotesByTagQuery = groq`*[_type == "quote" && $tag in tags] | order(_createdAt desc){
  _id,
  _createdAt,
  quote,
  author,
  context,
  tags
}`;

export const allTagsQuery = groq`array::unique(*[_type == "quote"].tags[])`;
