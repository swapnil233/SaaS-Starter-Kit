import { queryKeys } from "@/lib/queries/queryKeys";
import { User } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useUser = (initialData?: User) => {
  const queryClient = useQueryClient();

  // If we have initial data, set it in the cache
  if (initialData && !queryClient.getQueryData(queryKeys.user())) {
    queryClient.setQueryData(queryKeys.user(), initialData);
  }

  return useQuery<User>({
    queryKey: queryKeys.user(),
    queryFn: async () => {
      try {
        const response = await fetch("/api/users/me");

        if (response.status === 401) {
          throw new Error("Unauthorized");
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user");
        }

        return response.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unexpected error occurred");
      }
    },
    // If we have initialData, use it
    initialData,
    // Don't refetch if we have initialData and it's not stale
    staleTime: initialData ? 1000 * 60 : 0, // 1 minute if we have initialData
    // Keep in cache for 5 minutes
    gcTime: 1000 * 60 * 5,
    // Retry configuration
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Unauthorized") {
        return false; // Don't retry unauthorized requests
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
