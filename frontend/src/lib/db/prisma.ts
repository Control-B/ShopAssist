import "server-only";

import { PrismaClient } from "@prisma/client";

declare global {
  var __omniwebPrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__omniwebPrisma__ ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__omniwebPrisma__ = prisma;
}
