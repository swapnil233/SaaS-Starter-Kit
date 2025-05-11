import { queryKeys } from "@/lib/queries/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useProfilePicture = (imageUrl: string | null) => {
  const queryClient = useQueryClient();

  const { data: profilePictureUrl, isLoading } = useQuery({
    queryKey: queryKeys.profilePicture(imageUrl),
    queryFn: async () => {
      if (!imageUrl) return null;

      // If the image is already a full URL (from OAuth or external source), return it
      if (imageUrl.startsWith("http")) {
        return imageUrl;
      }

      // Otherwise, get a signed URL for the S3 key
      const response = await fetch(
        `/api/users/getProfilePictureUrl?key=${encodeURIComponent(imageUrl)}`
      );

      // Return null for 404s (file not found)
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) throw new Error("Failed to get profile picture URL");
      const data = await response.json();
      return data.url;
    },
    enabled: !!imageUrl,
    staleTime: 60 * 1000, // Cache for 1 minute
    gcTime: 1000 * 60 * 60, // Keep in garbage collection for 1 hour
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Don't retry on 404s
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Expose a function to invalidate all profile picture queries
  const invalidateProfilePictures = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profilePicture(null) });
    // Instead of invalidating the entire user query, we'll refetch it
    queryClient.refetchQueries({ queryKey: queryKeys.user() });
  };

  return { profilePictureUrl, invalidateProfilePictures, isLoading };
};
