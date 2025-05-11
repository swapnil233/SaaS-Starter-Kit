import { RegistrationForm } from "@/components/auth/RegistrationForm";
import SharedHead from "@/components/shared/SharedHead";
import app from "@/lib/app";
import { Box, LoadingOverlay } from "@mantine/core";
import { motion } from "framer-motion";
import { Provider } from "next-auth/providers/index";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.15, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
  },
};

interface IRegisterPage {}

const RegisterPage: React.FC<IRegisterPage> = () => {
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [providersLoading, setProvidersLoading] = useState(true);
  const { status } = useSession();
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const callbackUrl = (router.query.callbackUrl as string) || "/dashboard";

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setProvidersLoading(true);
        const response = await fetch("/api/auth/providers");
        if (!response.ok) {
          throw new Error("Failed to fetch providers");
        }
        const providersData = await response.json();
        setProviders(providersData);
        setProvidersLoading(false);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setProvidersLoading(false);
      }
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      setAuthenticated(true);
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  return (
    <>
      <SharedHead
        title="Register"
        description={`Register an account for ${app.name}`}
      />
      <Box pos="relative">
        <LoadingOverlay
          visible={authenticated || providersLoading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <div className="flex md:h-screen">
          <div className="hidden md:flex md:flex-col md:justify-between w-[55%] bg-blue-800 text-white p-12 relative overflow-hidden">
            <motion.div
              className="z-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="mb-10" variants={itemVariants}>
                <Link href="/">
                  <Image
                    src={app.logoUrl}
                    alt={app.logoUrlAlt}
                    width={139}
                    height={40}
                    className="object-contain"
                  />
                </Link>
              </motion.div>

              <motion.div className="mb-8" variants={itemVariants}>
                <h1 className="text-4xl font-bold mb-4">
                  Elevate your UX research today.
                </h1>
                <p className="text-xl opacity-90">
                  Analyze interviews, discover insights, and collaborate with
                  your team. Your qualitative data analysis journey starts here.
                </p>
              </motion.div>

              <motion.div className="relative w-full" variants={imageVariants}>
                <Image
                  src="https://qualsearch-public.s3.us-east-1.amazonaws.com/public/demo-light-no-border.png"
                  alt="QualSearch product screenshot"
                  width={800}
                  height={500}
                  className="rounded-lg shadow-lg object-cover w-full"
                  priority
                />
              </motion.div>
            </motion.div>

            <div className="absolute bottom-0 right-0 opacity-20">
              <svg
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                width="400"
                height="400"
              >
                <path
                  fill="currentColor"
                  d="M39.9,-65.7C51.5,-58.4,60.8,-47.6,67.2,-35.5C73.7,-23.3,77.4,-9.7,77.8,4.1C78.1,18,75.1,32.1,68.8,45.6C62.5,59.1,52.8,72.1,40.2,79.7C27.7,87.4,12.2,89.7,-3.2,89.2C-18.6,88.7,-34.1,85.3,-43.9,75.5C-53.7,65.8,-57.9,49.7,-63.8,34.9C-69.7,20.1,-77.3,6.5,-78.9,-8.1C-80.5,-22.7,-76.1,-38.5,-66.9,-49.9C-57.7,-61.4,-43.6,-68.7,-30.5,-75.1C-17.3,-81.4,-4.9,-86.8,7.1,-86.2C19.1,-85.7,28.3,-73,39.9,-65.7Z"
                  transform="translate(100 100)"
                />
              </svg>
            </div>
          </div>
          <div className="w-full md:w-[45%] flex items-center justify-center">
            <RegistrationForm
              providers={providers}
              providersLoading={providersLoading}
            />
          </div>
        </div>
      </Box>
    </>
  );
};

export default RegisterPage;
