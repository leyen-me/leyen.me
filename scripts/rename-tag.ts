/**
 * One-off maintenance: rename (merge) a tag across Sanity documents.
 *
 * Tags are plain strings stored on each document, so a "tag" cannot be deleted
 * or renamed on its own — every document carrying it has to be patched.
 *
 * Dry run by default; nothing is written until --execute is passed.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/rename-tag.ts --from 小计 --to 小记
 *   npx tsx --env-file=.env.local scripts/rename-tag.ts --from 小计 --to 小记 --execute
 *
 * Options:
 *   --from <tag>     Tag to replace (required)
 *   --to <tag>       Replacement tag (required)
 *   --type <type>    Document type to scan (default: Post)
 *   --execute        Persist changes; without it the script only reports
 *
 * Before writing, the original tag arrays are saved to
 * `.backups/rename-tag-<timestamp>.json` so the change can be reverted.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "next-sanity";
import { renameTag } from "@/lib/admin/tags";

type Options = {
  from: string;
  to: string;
  type: string;
  execute: boolean;
};

type TaggedDocument = {
  _id: string;
  title?: string;
  name?: string;
  tags: string[];
};

const BACKUP_DIR = path.join(process.cwd(), ".backups");

function fail(message: string): never {
  console.error(`Error: ${message}`);
  console.error(
    "Usage: npx tsx --env-file=.env.local scripts/rename-tag.ts --from <tag> --to <tag> [--type Post] [--execute]"
  );
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  const options: Options = { from: "", to: "", type: "Post", execute: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) fail(`missing value for ${arg}`);
      i += 1;
      return value.trim();
    };

    if (arg === "--from") options.from = next();
    else if (arg === "--to") options.to = next();
    else if (arg === "--type") options.type = next();
    else if (arg === "--execute") options.execute = true;
    else if (arg === "--help" || arg === "-h") fail("help requested");
    else fail(`unknown argument: ${arg}`);
  }

  if (!options.from) fail("--from is required");
  if (!options.to) fail("--to is required");
  if (options.from.toLowerCase() === options.to.toLowerCase()) {
    fail("--from and --to must differ");
  }

  return options;
}

function label(doc: TaggedDocument): string {
  return doc.title ?? doc.name ?? "(untitled)";
}

function displayWidth(value: string): number {
  let width = 0;
  for (const char of value) {
    const codePoint = char.codePointAt(0) ?? 0;
    const isWide =
      (codePoint >= 0x1100 && codePoint <= 0x115f) ||
      (codePoint >= 0x2e80 && codePoint <= 0xa4cf) ||
      (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
      (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
      (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
      (codePoint >= 0xff00 && codePoint <= 0xff60) ||
      (codePoint >= 0xffe0 && codePoint <= 0xffe6);
    width += isWide ? 2 : 1;
  }
  return width;
}

function printTable(rows: Array<{ id: string; name: string; before: string; after: string }>) {
  const widths = {
    id: Math.max(2, ...rows.map((r) => displayWidth(r.id))),
    name: Math.max(4, ...rows.map((r) => displayWidth(r.name))),
    before: Math.max(6, ...rows.map((r) => displayWidth(r.before))),
  };

  const pad = (value: string, width: number) =>
    value + " ".repeat(Math.max(0, width - displayWidth(value)));
  const header = `${pad("_id", widths.id)}  ${pad("title", widths.name)}  ${pad("before", widths.before)}  after`;
  console.log(header);
  console.log("-".repeat(header.length));
  for (const row of rows) {
    console.log(
      `${pad(row.id, widths.id)}  ${pad(row.name, widths.name)}  ${pad(row.before, widths.before)}  ${row.after}`
    );
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId || !dataset) fail("missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET");
  if (!token) fail("missing SANITY_API_TOKEN");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-07-21",
    token,
    useCdn: false,
  });

  const docs = await client.fetch<TaggedDocument[]>(
    `*[_type == $type && $from in tags]{ _id, title, name, tags }`,
    { type: options.type, from: options.from }
  );

  if (docs.length === 0) {
    console.log(`No ${options.type} documents use the tag "${options.from}" — nothing to do.`);
    return;
  }

  const rows = docs.map((doc) => ({
    id: doc._id,
    name: label(doc),
    before: JSON.stringify(doc.tags),
    after: JSON.stringify(renameTag(doc.tags, options.from, options.to)),
  }));

  printTable(rows);
  console.log(
    `\n${docs.length} ${options.type} document(s) match "${options.from}" → "${options.to}".`
  );

  if (!options.execute) {
    console.log("\nDRY RUN — no changes written. Re-run with --execute to apply.");
    return;
  }

  mkdirSync(BACKUP_DIR, { recursive: true });
  const backupFile = path.join(
    BACKUP_DIR,
    `rename-tag-${Date.now()}.json`
  );
  writeFileSync(
    backupFile,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        type: options.type,
        from: options.from,
        to: options.to,
        documents: docs.map((doc) => ({ _id: doc._id, tags: doc.tags })),
      },
      null,
      2
    )
  );
  console.log(`\nBackup written: ${backupFile}`);

  const transaction = client.transaction();
  for (const doc of docs) {
    transaction.patch(doc._id, (patch) =>
      patch.set({ tags: renameTag(doc.tags, options.from, options.to) })
    );
  }
  await transaction.commit();

  console.log(`Patched ${docs.length} document(s).`);
  console.log(
    `Revalidate the "${options.type}" tag in Next.js (e.g. save a post in /admin) so cached pages pick up the change.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
