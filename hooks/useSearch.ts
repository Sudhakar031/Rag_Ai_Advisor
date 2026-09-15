"use client";

import { useMemo, useState } from "react";

export function useSearch<T extends { title?: string; name?: string }>(items: T[]) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const search = query.toLowerCase();
    return items.filter((item) => {
      const label = `${item.title ?? ""} ${item.name ?? ""}`.toLowerCase();
      return label.includes(search);
    });
  }, [items, query]);

  return { query, setQuery, filtered };
}
