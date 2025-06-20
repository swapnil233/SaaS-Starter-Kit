// src/pages/_app.tsx
import { RouterTransition } from "@/components/RouterTransition";
import { useOnlineStatus } from "@/hooks/ui/useOnlineStatus";
import QueryProvider from "@/lib/queries/QueryProvider";
import "@/styles/globals.css";
import { MantineProvider } from "@mantine/core";
import { Notifications, notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import { IconX } from "@tabler/icons-react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Be_Vietnam_Pro } from "next/font/google";
import { useEffect } from "react";
import { NextPageWithLayout } from "./page";

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Include only the weights you need
  variable: "--font-be-vietnam-pro", // Optional: sets a custom variable name for the font
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout & { session: Session }) {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!isOnline) {
      notifications.show({
        id: "offline-warning-notification",
        title: "You're offline...",
        message:
          "Your internet connection has been disconnected. Please re-connect to ensure your changes are saved.",
        withCloseButton: false,
        color: "red",
        icon: <IconX />,
        autoClose: false,
      });
    } else {
      notifications.hide("offline-warning-notification");
    }
  }, [isOnline]);

  const getLayout = Component.getLayout || ((page) => page);

  return (
    <SessionProvider session={session}>
      <QueryProvider>
        <MantineProvider defaultColorScheme="auto">
          <RouterTransition />
          {getLayout(
            <main className={beVietnamPro.className}>
              <Component {...pageProps} />
            </main>
          )}
          <Notifications position="top-right" />
        </MantineProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
