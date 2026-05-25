/**
 * One-time migration: convert profile/project Portable Text fields to Markdown.
 *
 * Usage:
 *   SANITY_API_TOKEN=... NEXT_PUBLIC_SANITY_PROJECT_ID=... NEXT_PUBLIC_SANITY_DATASET=... \
 *   npx tsx scripts/migrate-portable-text-to-markdown.ts
 */

import { createClient } from "next-sanity";
import { portableTextToMarkdown } from "@portabletext/markdown";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN ?? process.env.NEXT_PUBLIC_SANITY_ACCESS_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing Sanity env vars");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-07-21",
  token,
  useCdn: false,
});

function convertField(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return portableTextToMarkdown(value);
  return "";
}

async function migrateProfiles() {
  const profiles = await client.fetch<
    Array<{ _id: string; fullBio: unknown; usage: unknown }>
  >(`*[_type == "profile"]{ _id, fullBio, usage }`);

  for (const profile of profiles) {
    const fullBio = convertField(profile.fullBio);
    const usage = convertField(profile.usage);
    await client.patch(profile._id).set({ fullBio, usage }).commit();
    console.log(`Migrated profile ${profile._id}`);
  }
}

async function migrateProjects() {
  const projects = await client.fetch<
    Array<{ _id: string; description: unknown }>
  >(`*[_type == "project"]{ _id, description }`);

  for (const project of projects) {
    const description = convertField(project.description);
    await client.patch(project._id).set({ description }).commit();
    console.log(`Migrated project ${project._id}`);
  }
}

async function main() {
  await migrateProfiles();
  await migrateProjects();
  console.log("Migration complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
