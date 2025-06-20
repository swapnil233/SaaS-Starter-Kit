import packageInfo from "../../package.json";

const app = {
  version: packageInfo.version,
  author: "Hasan Iqbal",
  name: "Boilerplate",
  description:
    "Boilerplate is a SaaS starter-kit built with Next.js pages and MantineUI.",
  prodUrl: "https://boilerplate-two-chi.vercel.app",
  devUrl: "http://localhost:3000",
  logoUrl: {
    light: "/logo.svg",
    dark: "/logo.svg",
  },
  logoUrlAlt: "Boilerplate logo",
};

export default app;
