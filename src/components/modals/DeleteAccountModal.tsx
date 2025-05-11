import {
  Button,
  Group,
  Modal,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

interface DeleteAccountModalProps {
  onConfirm: (_data: {
    password?: string;
    confirmText?: string;
  }) => Promise<void>;
  isLoading: boolean;
  accountType?: string;
}

const DeleteAccountModal = ({
  onConfirm,
  isLoading,
  accountType,
}: DeleteAccountModalProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);

    if (accountType === "credentials" && !password) {
      setError("Please enter your password");
      return;
    }

    if (accountType === "oauth" && confirmText !== "delete my account") {
      setError('Please type "delete my account" to confirm');
      return;
    }

    try {
      await onConfirm({ password, confirmText });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleClose = () => {
    setError(null);
    setPassword("");
    setConfirmText("");
    close();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Confirm Account Deletion"
        centered
      >
        <Text mb="md">
          Are you sure you want to delete your account? This action is
          irreversible.
        </Text>

        {accountType === "credentials" ? (
          <PasswordInput
            label="Enter your password to confirm"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            mb="md"
            required
          />
        ) : accountType === "oauth" ? (
          <TextInput
            label='Type "delete my account" to confirm'
            placeholder="delete my account"
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
            mb="md"
            required
          />
        ) : null}

        {error && (
          <Text c="red" size="sm" mb="md">
            {error}
          </Text>
        )}

        <Group justify="right" mt="md">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleConfirm}
            loading={isLoading}
            disabled={
              isLoading ||
              (accountType === "credentials" && !password) ||
              (accountType === "oauth" && confirmText !== "delete my account")
            }
          >
            Delete
          </Button>
        </Group>
      </Modal>

      <Button color="red" onClick={open}>
        Delete my account
      </Button>
    </>
  );
};

export default DeleteAccountModal;
