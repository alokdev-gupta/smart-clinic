import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env.local for Next.js-style env vars
dotenv.config({ path: ".env.local" });
// Fallback to .env
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
