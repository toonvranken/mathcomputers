import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function resolveSqlitePath() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const filePart = url.startsWith("file:") ? url.slice("file:".length) : url;
  if (path.isAbsolute(filePart)) return filePart;
  // Match Prisma CLI: relative to project cwd
  return path.join(
    /* turbopackIgnore: true */ process.cwd(),
    filePart.replace(/^\.\//, "").replace(/^\.\\/, ""),
  );
}

function createPrismaClient() {
  const dbPath = resolveSqlitePath();
  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  } catch {
    // ignore if path already exists / read-only during build
  }
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
