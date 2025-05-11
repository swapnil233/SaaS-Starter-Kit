// This comes from
// https://next-auth.js.org/configuration/nextjs#getserversession

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getServerSession, Session } from "next-auth";

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
): Promise<Session | null> {
  return getServerSession(...args, authOptions);
}
