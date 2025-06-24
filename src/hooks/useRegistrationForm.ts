import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export const useRegistrationForm = () => {
  const router = useRouter();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const mutation = useMutation<any, Error, RegistrationFormData>({
    mutationFn: async (data: RegistrationFormData) => {
      if (!recaptchaToken) {
        throw new Error("reCAPTCHA verification is required");
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      return response.json();
    },
    onSuccess: async (data, _variables) => {
      setIsSuccess(true);
      setIsError(false);

      if (
        data.message &&
        data.message.includes("If this email is not already registered")
      ) {
        notifications.show({
          title: "Registration Request Received",
          message:
            "If this email is not already registered, you will receive a verification email shortly.",
          color: "blue",
        });
        return;
      }

      notifications.show({
        title: "Registration successful",
        message: "You have been successfully registered.",
        color: "green",
      });

      // Redirect to sign-in page since we're now using Clerk
      router.push("/sign-in");
    },
    onError: (error: Error) => {
      setIsSuccess(false);
      setIsError(true);

      notifications.show({
        title: "Registration failed",
        message:
          error.message ||
          "An unexpected error occurred. Please try again later.",
        color: "red",
      });
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    setIsSuccess(false); // Reset success state before each submission
    setIsError(false); // Reset error state before each submission
    mutation.mutate(data);
    return data;
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading: mutation.isPending,
    watch,
    setValue,
    setRecaptchaToken,
    isSuccess,
    isError,
  };
};
