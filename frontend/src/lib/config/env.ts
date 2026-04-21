import "server-only";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  SHOPIFY_API_KEY: z.string().min(1),
  SHOPIFY_API_SECRET: z.string().min(1),
  SHOPIFY_API_SCOPES: z.string().min(1),
  SHOPIFY_WEBHOOK_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z
    .string()
    .min(32, "ENCRYPTION_KEY should be at least 32 characters."),
  EXTERNAL_AI_SHARED_SECRET: z.string().min(1),
});

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
  SHOPIFY_API_SCOPES: process.env.SHOPIFY_API_SCOPES,
  SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  EXTERNAL_AI_SHARED_SECRET: process.env.EXTERNAL_AI_SHARED_SECRET,
});

if (!parsedEnv.success) {
  const formatted = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${formatted}`);
}

const appUrl = new URL(parsedEnv.data.APP_URL);

export const env = {
  ...parsedEnv.data,
  appHost: appUrl.host,
  appProtocol: appUrl.protocol.replace(":", "") as "http" | "https",
  shopifyScopes: parsedEnv.data.SHOPIFY_API_SCOPES.split(",")
    .map((scope) => scope.trim())
    .filter(Boolean),
};
