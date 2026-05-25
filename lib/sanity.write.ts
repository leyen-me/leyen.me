import "server-only";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion, apiToken } from "@/lib/env.api";

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: apiToken,
  useCdn: false,
});
