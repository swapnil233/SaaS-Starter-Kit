import { queryKeys } from "@/lib/queries/queryKeys";
import { useQuery } from "@tanstack/react-query";

interface TrialEligibilityResponse {
  isEligible: boolean;
}

const fetchTrialEligibility = async (): Promise<TrialEligibilityResponse> => {
  const response = await fetch("/api/users/me/trial-eligibility");

  if (!response.ok) {
    throw new Error("Failed to check trial eligibility");
  }

  return response.json();
};

export const useTrialEligibility = () => {
  return useQuery({
    queryKey: queryKeys.user.trialEligibility(),
    queryFn: fetchTrialEligibility,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
