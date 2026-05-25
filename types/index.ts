import type { PortableTextBlock } from "@portabletext/types";

export interface TableRow {
  _key?: string;
  cells?: string[];
}

export interface Table {
  rows?: TableRow[];
  title?: string;
}

export interface TableValueProps {
  table?: Table;
  caption?: string;
}

export interface QuizValueProps {
  _key: string;
  question: string;
  answer: string;
}

export type ProfileType = {
  _id: string;
  fullName: string;
  headline: string;
  profileImage: {
    image: string;
    lqip: string;
    alt: string;
  };
  shortBio: string;
  email: string;
  fullBio: string | PortableTextBlock[];
  location: string;
  resumeURL: string;
  og: string;
  usage: string | PortableTextBlock[];
};

export type JobType = {
  _id: string;
  name: string;
  jobTitle: string;
  logo: string;
  url: string;
  description: string;
  startDate: string;
  endDate: string;
};

export type ProjectType = {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  projectUrl: string;
  repository: string;
  logo: string;
  coverImage: {
    image: string;
    alt: string | null;
    lqip: string;
  };
  description: string | PortableTextBlock[];
  order?: number;
};

export type PostType = {
  _id: string;
  _createdAt: string;
  _updatedAt?: string;
  title: string;
  slug: string;
  description: string;
  canonicalLink?: string;
  date?: string;
  coverImage: {
    image: string;
    lqip: string;
    alt: string | null;
  };
  tags: string[];
  author: {
    name: string;
    photo: {
      image: string;
      alt: string;
    };
    twitterUrl: string;
  };
  content?: string;
  featured: boolean;
  isPublished: boolean;
};

export type MovieType = {
  _id: string;
  title: string;
  slug: string;
  mediaType: "movie" | "tv";
  coverImage: {
    image: string;
    lqip: string;
    alt: string | null;
  };
  rating?: number;
  releaseDate?: string;
  director?: string;
  cast?: string[];
  description?: string;
  externalUrl?: string;
};

export type QuoteType = {
  _id: string;
  _createdAt: string;
  quote: string;
  author: string;
  contentType?: "quote" | "essay";
  context?: string;
  tags: string[];
};

export type InterviewQuestionListItem = {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: string;
  category: string;
};

export type InterviewQuestionType = InterviewQuestionListItem & {
  answer?: string;
};

export type PasswordEntryType = {
  _id: string;
  _createdAt: string;
  encryptedData: string;
  order?: number;
};

export type PasswordEntryData =
  | {
      type: "PASSWORD";
      name: string;
      username: string;
      password: string;
      url: string;
      notes: string;
    }
  | {
      type: "SECRET";
      key: string;
      value: string;
    };
