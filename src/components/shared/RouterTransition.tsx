// components/RouterTransition.tsx
import { useMantineTheme } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function RouterTransition() {
  const router = useRouter();
  const theme = useMantineTheme();
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== router.asPath) {
        setLoading(true);
        nprogress.start();
      }
    };
    const handleComplete = () => {
      setLoading(false);
      nprogress.complete();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router.asPath, router.events]);

  return (
    <>
      {loading && (
        <NavigationProgress
          className="fixed top-0 left-0 w-full z-50"
          color={colorScheme === "dark" ? "green" : theme.primaryColor}
          size={5}
        />
      )}
    </>
  );
}
