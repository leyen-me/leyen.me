export const projectId = checkValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "https://sanity.io"
);

export const dataset: string = checkValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "NEXT_PUBLIC_SANITY_DATASET",
  "https://sanity.io"
);

export const apiToken = checkValue(
  process.env.SANITY_API_TOKEN ?? process.env.NEXT_PUBLIC_SANITY_ACCESS_TOKEN,
  "SANITY_API_TOKEN",
  "https://sanity.io"
);

export const hookSecret = process.env.NEXT_PUBLIC_SANITY_HOOK_SECRET;
export const mode = process.env.NODE_ENV;

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-07-21";

export const adminPassword = process.env.ADMIN_PASSWORD;
export const sessionSecret = process.env.SESSION_SECRET;

function checkValue<T>(
  value: T | undefined,
  errorMsg: string,
  url?: string
): T {
  if (value === undefined) {
    throw new Error(
      `Missing Environment Variable: ${errorMsg}\n\nVisit ${url} to learn how you can generate your own API keys`
    );
  }
  return value;
}
