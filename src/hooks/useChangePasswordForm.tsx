import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { Account } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const schema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long"),
    confirmNewPassword: z
      .string()
      .min(8, "Confirm new password must be at least 8 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  });

export const useChangePasswordForm = (_account: Account | null) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation<any, Error, ChangePasswordFormData>({
    mutationFn: async (data: ChangePasswordFormData) => {
      const response = await fetch("/api/users/updatePassword", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update password");
      }
      return response.json();
    },
    onError: () => {
      notifications.show({
        title: "We couldn't change your password.",
        message:
          "Please make sure your current password is correct. If you continue to have trouble, please contact support.",
        color: "red",
        withCloseButton: false,
      });
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Your password has been changed.",
        color: "green",
      });
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    mutation.mutate(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading: mutation.isPending,
  };
};
