import { queryKeys } from "@/lib/queries/queryKeys";
import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { User, UserPreferences } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface PersonalInfoFormData {
  name: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  contactTimePreference: string;
  darkMode: boolean;
  language: string;
  newsletterSubscribed: boolean;
}

const schema = z.object({
  name: z.string().min(1, "Full name is required"),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  contactTimePreference: z.enum(["MORNING", "AFTERNOON", "EVENING"]).optional(),
  darkMode: z.boolean(),
  language: z.string().optional(),
  newsletterSubscribed: z.boolean(),
});

export const usePersonalInfoForm = (
  user: User,
  preferences: UserPreferences
) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || "",
      emailNotifications: preferences.emailNotifications,
      smsNotifications: preferences.smsNotifications,
      pushNotifications: preferences.pushNotifications,
      contactTimePreference: preferences.contactTimePreference || "MORNING",
      darkMode: preferences.darkMode || false,
      language: preferences.language || "en",
      newsletterSubscribed: preferences.newsletterSubscribed || true,
    },
  });

  // Update user profile and preferences
  const mutation = useMutation<
    any,
    Error,
    PersonalInfoFormData,
    { previousUser: User | undefined }
  >({
    mutationFn: async (data: PersonalInfoFormData) => {
      // Update user profile (name)
      const profileResponse = await fetch("/api/users/updateProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, name: data.name }),
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to update profile");
      }

      // Update user preferences
      const preferencesResponse = await fetch(
        "/api/users/updateUserPreferences",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            emailNotifications: data.emailNotifications,
            smsNotifications: data.smsNotifications,
            pushNotifications: data.pushNotifications,
            contactTimePreference: data.contactTimePreference,
            darkMode: data.darkMode,
            language: data.language,
            newsletterSubscribed: data.newsletterSubscribed,
          }),
        }
      );

      if (!preferencesResponse.ok) {
        throw new Error("Failed to update preferences");
      }

      const [updatedProfile, updatedPreferences] = await Promise.all([
        profileResponse.json(),
        preferencesResponse.json(),
      ]);

      return { profile: updatedProfile, preferences: updatedPreferences };
    },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.user() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData<User>(queryKeys.user());

      // Optimistically update to the new value
      if (previousUser) {
        queryClient.setQueryData<User>(queryKeys.user(), {
          ...previousUser,
          name: newData.name,
        });
      }

      return { previousUser };
    },
    onError: (_error, _newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.user(), context.previousUser);
      }
      notifications.show({
        title: "We couldn't save your changes",
        message: "Something went wrong on our end. Please try again later.",
        color: "red",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.refetchQueries({ queryKey: queryKeys.user() });
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Your changes have been saved.",
        color: "green",
      });
    },
  });

  const onSubmit = (data: PersonalInfoFormData) => {
    mutation.mutate(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading: mutation.isPending,
    setValue,
    watch,
  };
};
