"use client";

import { useEffect, useState } from "react";

export type TagKind = "post" | "quote";

/**
 * Fetches the tag vocabulary already used by a content type so the editor can
 * offer existing tags instead of asking the user to retype them.
 */
export function useTagSuggestions(kind: TagKind): string[] {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/tags?type=${kind}`)
      .then((response) => (response.ok ? response.json() : { tags: [] }))
      .then((data) => {
        if (cancelled) return;
        setSuggestions(Array.isArray(data?.tags) ? data.tags : []);
      })
      .catch(() => {
        // Suggestions are a convenience; the editor still works without them.
        if (!cancelled) setSuggestions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [kind]);

  return suggestions;
}
