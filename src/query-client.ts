import { QueryClient } from "@tanstack/react-query";

/** Browser QueryClient factory — use inside `AppQueryProvider` (one client per mount). */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}
