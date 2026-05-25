import "server-only";
import { createClient, type ClientConfig, type QueryParams } from "next-sanity";
import { projectId, dataset, apiVersion, mode } from "@/lib/env.api";

const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: mode === "development",
  perspective: "published",
};

const client = createClient(config);

export async function sanityFetch<QueryResponse>({
  query,
  qParams = {},
  tags,
}: {
  query: string;
  qParams?: QueryParams;
  tags: string[];
}): Promise<QueryResponse> {
  return client.fetch<QueryResponse>(query, qParams, {
    cache: mode === "development" ? "no-store" : "force-cache",
    next: { tags },
  });
}
