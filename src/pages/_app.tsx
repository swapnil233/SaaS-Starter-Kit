import "@mantine/core/styles.css";
import { Roboto } from "@next/font/google";

const roboto = Roboto({
  subsets: ["latin-ext"],
  weight: ["400", "700"],
});

import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider>
      <main className={roboto.className}>
        <Component {...pageProps} />
      </main>
    </MantineProvider>
  );
}
