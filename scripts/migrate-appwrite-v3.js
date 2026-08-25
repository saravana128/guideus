/**
 * Appwrite Migration Script – v3 (Task categories)
 *
 * Run this ONCE after the v2 migration (migrate-appwrite-v2.js).
 * It is idempotent – safe to re-run; existing resources are skipped.
 *
 * What it does:
 *   1. Adds a "category" string attribute ("learning" | "action") to the
 *      "tasks" collection (optional, default "action")
 *   2. Backfills existing tasks that have no category with "action"
 *
 * Usage:
 *   npm run setup:appwrite:v3
 *   (or) node scripts/migrate-appwrite-v3.js
 *
 * Required env vars (in .env):
 *   APPWRITE_API_KEY=your_api_key          (server-side key, required)
 *   VITE_APPWRITE_PROJECT_ID=...           (or APPWRITE_PROJECT_ID)
 *   VITE_APPWRITE_ENDPOINT=...             (or APPWRITE_ENDPOINT)
 */

import { Client, Databases, Query } from "node-appwrite";

try {
  const dotenv = await import("dotenv");
  dotenv.config();
} catch {
  // dotenv not installed
}

const endpoint =
  process.env.APPWRITE_ENDPOINT ||
  process.env.VITE_APPWRITE_ENDPOINT ||
  "https://sgp.cloud.appwrite.io/v1";
const projectId =
  process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || "";
const apiKey = process.env.APPWRITE_API_KEY || "";
const databaseId =
  process.env.APPWRITE_DATABASE_ID ||
  process.env.VITE_APPWRITE_DATABASE_ID ||
  "guideus_db";
const tasksCollectionId =
  process.env.APPWRITE_TASKS_COLLECTION_ID ||
  process.env.VITE_APPWRITE_TASKS_COLLECTION_ID ||
  "tasks";

const DEFAULT_CATEGORY = "action";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function validateConfig() {
  if (!projectId)
    throw new Error("APPWRITE_PROJECT_ID (or VITE_APPWRITE_PROJECT_ID) is required");
  if (!apiKey) {
    throw new Error(
      "APPWRITE_API_KEY is required. Add it to your .env file first.\n" +
        "Create one in the Appwrite Console → Project → API Keys " +
        "(needs databases.write, collections.write, attributes.write scopes).",
    );
  }
}

const isAlreadyExists = (error) =>
  error.code === 409 || error.message?.includes("already exists");

async function ensureCategoryAttribute(databases) {
  try {
    await databases.createStringAttribute(
      databaseId,
      tasksCollectionId,
      "category",
      20, // fits "learning" / "action"
      false, // optional – existing documents stay valid
      DEFAULT_CATEGORY, // default applied to new documents
      false, // array – plain string column
    );
    console.log(`✅ [${tasksCollectionId}] attribute "category" created`);
  } catch (error) {
    if (isAlreadyExists(error)) {
      console.log(`ℹ️  [${tasksCollectionId}] attribute "category" exists`);
    } else {
      throw error;
    }
  }
}

async function backfillCategories(databases) {
  // Newly created attributes may take a moment to become available
  await sleep(2000);

  const allTasks = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const page = await databases.listDocuments(databaseId, tasksCollectionId, [
      Query.limit(limit),
      Query.offset(offset),
    ]);
    allTasks.push(...page.documents);
    if (page.documents.length < limit) break;
    offset += limit;
  }

  const pending = allTasks.filter((t) => !t.category);
  if (pending.length === 0) {
    console.log("ℹ️  All tasks already have a category – nothing to do");
    return;
  }

  let migrated = 0;
  for (const task of pending) {
    try {
      await databases.updateDocument(databaseId, tasksCollectionId, task.$id, {
        category: DEFAULT_CATEGORY,
      });
      migrated += 1;
    } catch (error) {
      console.error(`❌ Task "${task.title}" (${task.$id}) failed:`, error.message);
    }
  }

  console.log(`✅ Backfilled category on ${migrated}/${pending.length} tasks`);
}

async function migrate() {
  validateConfig();

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  const databases = new Databases(client);

  console.log("🔧 Starting Appwrite v3 migration (task categories)...");
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Project:  ${projectId}`);
  console.log(`   Database: ${databaseId}`);

  console.log("\n🧱 Step 1: Attribute");
  await ensureCategoryAttribute(databases);

  console.log("\n📝 Step 2: Backfill existing tasks");
  await backfillCategories(databases);

  console.log("\n🎉 Migration complete!");
  console.log("\nRestart the dev server afterwards (npm run dev).");
}

migrate().catch((error) => {
  console.error("\n❌ Migration failed:", error.message);
  process.exit(1);
});
