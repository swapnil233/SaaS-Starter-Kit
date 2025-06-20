import { usePersonalInfoForm } from "@/hooks/account";
import { useProfilePicture } from "@/hooks/account/useProfilePicture";
import { useUser } from "@/hooks/auth/useUser";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  FileButton,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { User, UserPreferences } from "@prisma/client";
import { IconUpload } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface PersonalInfoProps {
  user: User;
  preferences: UserPreferences | null;
}

const PersonalInfo = ({
  user: initialUser,
  preferences,
}: PersonalInfoProps) => {
  const { update: updateSession } = useSession();
  const { data: user = initialUser } = useUser(initialUser);
  const { profilePictureUrl, invalidateProfilePictures } = useProfilePicture(
    user.image
  );

  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading,
    setValue,
    watch,
  } = usePersonalInfoForm(user, preferences);

  // Update profile picture
  const updateProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        // Process image on client side using browser's canvas
        const processedImage = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          img.onload = () => {
            // Calculate dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;
            const MAX_DIMENSION = 512;

            if (width > height && width > MAX_DIMENSION) {
              height = (height * MAX_DIMENSION) / width;
              width = MAX_DIMENSION;
            } else if (height > MAX_DIMENSION) {
              width = (width * MAX_DIMENSION) / height;
              height = MAX_DIMENSION;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress image
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("Failed to process image"));
                }
              },
              "image/jpeg",
              0.8
            );
          };

          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = URL.createObjectURL(file);
        });

        // Get the presigned URL
        const response = await fetch(
          `/api/users/getProfilePictureUploadUrl?fileName=${encodeURIComponent(
            file.name
          )}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get upload URL");
        }

        const { uploadUrl, key } = await response.json();

        // Upload directly to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: processedImage,
          headers: { "Content-Type": "image/jpeg" },
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image to storage");
        }

        // Update user's profile picture in the database
        const updateResponse = await fetch(
          "/api/users/updateProfilePictureKey",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error("Failed to update profile picture reference");
        }

        return key;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unexpected error occurred");
      }
    },
    onSuccess: async (key) => {
      notifications.show({
        title: "Success",
        message: "Profile picture updated successfully",
        color: "green",
      });

      try {
        await updateSession({ user: { image: key } });
        invalidateProfilePictures();
      } catch (error) {
        console.error("Failed to update session:", error);
        notifications.show({
          title: "Warning",
          message:
            "Profile picture updated but session refresh failed. Please refresh the page.",
          color: "yellow",
        });
      }
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update profile picture",
        color: "red",
      });
    },
  });

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validate file type with more specific checks
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      notifications.show({
        title: "Invalid file type",
        message: "Please upload a JPG, PNG, GIF, or WebP image.",
        color: "red",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: "File too large",
        message:
          "Please choose an image under 5MB. You may need to resize your image before uploading.",
        color: "red",
      });
      return;
    }

    // Validate minimum dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width < 100 || img.height < 100) {
        notifications.show({
          title: "Image too small",
          message: "Please choose an image that is at least 100x100 pixels.",
          color: "red",
        });
        return;
      }
      updateProfilePictureMutation.mutate(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      notifications.show({
        title: "Invalid image",
        message: "The selected file could not be loaded as an image.",
        color: "red",
      });
    };

    img.src = objectUrl;
  };

  const getErrorMessage = (error: any) => {
    if (error) {
      if (typeof error.message === "string") {
        return error.message;
      }
      if (typeof error === "string") {
        return error;
      }
    }
    return undefined;
  };

  const contactTimeOptions = [
    { value: "MORNING", label: "Morning" },
    { value: "AFTERNOON", label: "Afternoon" },
    { value: "EVENING", label: "Evening" },
  ];

  // Watch the current value of contactTimePreference
  const contactTimePreference = watch("contactTimePreference");

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="xs">
          <Text fw={500} size="lg">
            Personal information
          </Text>
          <Text c="dimmed">
            This information may be viewable by other users of this application.
          </Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card radius="md" withBorder p={0}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <Stack
                gap={24}
                px={{ base: 16, md: 32 }}
                py={{ base: 16, md: 32 }}
              >
                <Stack gap={8}>
                  <Text fw={500}>Profile picture</Text>
                  <Group>
                    <Avatar
                      size="lg"
                      src={profilePictureUrl}
                      alt="User profile picture."
                    />
                    <Group gap="xs">
                      <FileButton
                        onChange={handleFileChange}
                        accept="image/png,image/jpeg,image/jpg,image/gif"
                      >
                        {(props) => (
                          <Button
                            {...props}
                            variant="default"
                            leftSection={<IconUpload size={14} />}
                            loading={updateProfilePictureMutation.isPending}
                          >
                            Change
                          </Button>
                        )}
                      </FileButton>
                      <Text size="sm" c="#7d7d7d">
                        JPG, GIF or PNG. Max file size 5MB.
                      </Text>
                    </Group>
                  </Group>
                </Stack>
                <TextInput
                  radius="xs"
                  label="Full name"
                  placeholder="John"
                  {...register("name")}
                  error={getErrorMessage(errors.name)}
                />
                <Tooltip
                  label={
                    user.emailVerified
                      ? `Your email was verified on ${new Date(
                          user.emailVerified
                        ).toLocaleDateString()} at ${new Date(
                          user.emailVerified
                        ).toLocaleTimeString()}. Email address cannot be changed.`
                      : undefined
                  }
                >
                  <TextInput
                    radius="xs"
                    label="Email address"
                    placeholder={user.email || ""}
                    disabled
                  />
                </Tooltip>
                <Select
                  label="Preferred contact time"
                  placeholder="Pick one"
                  data={contactTimeOptions}
                  radius="xs"
                  value={contactTimePreference || ""}
                  onChange={(value) => {
                    if (typeof value === "string") {
                      setValue("contactTimePreference", value);
                    }
                  }}
                />
                <Stack gap="xs">
                  <Checkbox
                    {...register("emailNotifications")}
                    label="Send me emails about my account."
                  />
                  <Checkbox
                    {...register("smsNotifications")}
                    label="Send me notifications about product updates."
                  />
                  <Checkbox
                    {...register("pushNotifications")}
                    label="Send me occasional newsletters and special offers."
                  />
                </Stack>
              </Stack>
              <div className="h-[1px] w-full bg-[#D6D6D6]"></div>
              <Group justify="flex-start" px={{ base: 16, md: 32 }} pb={16}>
                <Button type="submit" loading={isLoading}>
                  Save changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default PersonalInfo;
