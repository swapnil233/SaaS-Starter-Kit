import "@/styles/globals.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { RouterTransition } from "@/components/shared/RouterTransition";
import { NextPageWithLayout } from "./page";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin-ext"],
  weight: ["400", "700"],
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

  return (
    <>
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
    </>
  );
}
