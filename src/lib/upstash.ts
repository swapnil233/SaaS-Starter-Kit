import { Redis } from "@upstash/redis";

export const upstash = new Redis({
  url: process.env.VERCEL_KV_REST_API_URL!,
  token: process.env.VERCEL_KV_REST_API_TOKEN!,
});

// (Default export too, for convenience)
export default upstash;
