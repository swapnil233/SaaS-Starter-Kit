import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

/**
 * Global React Query client configuration
 * Used for all data fetching throughout the application
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute before refetching
      retry: (failureCount, error) => {
        // Skip retries for client errors (4xx)
        if (
          error instanceof Error &&
          "status" in error &&
          (error as any).status < 500
        ) {
          return false;
        }
        return failureCount < 3; // Max 3 retries for server errors
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff capped at 30s
      refetchOnWindowFocus: true, // Refresh data when tab regains focus
      refetchOnReconnect: true, // Refresh when network reconnects
      gcTime: 5 * 60 * 1000, // Cache garbage collection after 5 minutes
    },
    mutations: {
      retry: 2, // Retry failed mutations twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Provider component that makes React Query available throughout the app
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
