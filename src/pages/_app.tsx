import { RouterTransition } from "@/components/shared/RouterTransition";
import "@/styles/globals.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Roboto } from "next/font/google";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { NextPageWithLayout } from "./page";

const roboto = Roboto({
  subsets: ["latin-ext"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout & { session: Session }) {
  // Use the layout defined at the page level if available
  const getLayout = Component.getLayout || ((page) => page);

  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <MantineProvider withGlobalClasses defaultColorScheme="light">
            <RouterTransition />
            {getLayout(
              <main className={roboto.className}>
                <Component {...pageProps} />
              </main>
            )}
            <Notifications position="top-right" />
          </MantineProvider>
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}
