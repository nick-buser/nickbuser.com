"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CommandPaletteProvider,
  type SearchItem,
} from "@/components/command-palette";

/**
 * Client-side context boundary: TanStack Query (used only where a feature has
 * genuinely async data — never for static content) and the ⌘K palette.
 */
export function Providers({
  searchItems,
  children,
}: {
  searchItems: SearchItem[];
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CommandPaletteProvider items={searchItems}>
        {children}
      </CommandPaletteProvider>
    </QueryClientProvider>
  );
}
