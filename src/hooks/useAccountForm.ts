import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { z } from "zod";

interface FormData {
  name: string;
  email: string;
}

type UpdateData = Partial<Pick<User, "name" | "email">>;

const schema = z.object({
  name: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
});

const useAccountForm = (user: User) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
    },
  });

  const mutation = useMutation(
    async (data: UpdateData) => {
      const response = await fetch("/api/updateUser", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user.id, ...data }),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    {
      onMutate: async (newData) => {
        await queryClient.cancelQueries("user");
        const previousUser = queryClient.getQueryData<User>("user");
        if (previousUser) {
          queryClient.setQueryData<User>("user", {
            ...previousUser,
            ...newData,
          });
        }
        return { previousUser };
      },
      onError: (_error, _newData, context) => {
        if (context?.previousUser) {
          queryClient.setQueryData("user", context.previousUser);
        }
        notifications.show({
          title: "We couldn't save your changes",
          message: "Something went wrong on our end. Please try again later.",
          color: "red",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries("user");
      },
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Your changes have been saved.",
          color: "green",
        });
      },
    }
  );

  const onSubmit = (data: FormData) => {
    // Filter out empty fields
    const updatedFields: UpdateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== "")
    );
    mutation.mutate(updatedFields);
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading: mutation.isLoading,
  };
};

export default useAccountForm;
