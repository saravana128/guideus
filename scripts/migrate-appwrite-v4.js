/**
 * Appwrite Migration Script – v4 (Task reference links)
 *
 * Run this once after the v3 migration. It is idempotent and safe to re-run.
 * Adds an optional "referenceUrl" string attribute to the tasks collection.
 *
 * Usage:
 *   npm run setup:appwrite:v4
 *
 * Required env vars:
 *   APPWRITE_API_KEY=your server-side API key
 *   VITE_APPWRITE_PROJECT_ID=... (or APPWRITE_PROJECT_ID)
 *   VITE_APPWRITE_ENDPOINT=...   (or APPWRITE_ENDPOINT)
 */

import { Client, Databases } from "node-appwrite";

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

function validateConfig() {
  if (!projectId) {
    throw new Error(
      "APPWRITE_PROJECT_ID (or VITE_APPWRITE_PROJECT_ID) is required",
    );
  }
  if (!apiKey) {
    throw new Error(
      "APPWRITE_API_KEY is required. The key needs attributes.write scope.",
    );
  }
}

const isAlreadyExists = (error) =>
  error.code === 409 || error.message?.includes("already exists");

async function migrate() {
  validateConfig();

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  const databases = new Databases(client);

  console.log("🔧 Starting Appwrite v4 migration (task reference links)...");

  try {
    await databases.createStringAttribute(
      databaseId,
      tasksCollectionId,
      "referenceUrl",
      2000,
      false,
    );
    console.log(`✅ [${tasksCollectionId}] attribute "referenceUrl" created`);
  } catch (error) {
    if (isAlreadyExists(error)) {
      console.log(`ℹ️  [${tasksCollectionId}] attribute "referenceUrl" exists`);
    } else {
      throw error;
    }
  }

  console.log("\n🎉 Migration complete!");
  console.log("Restart the dev server afterwards (npm run dev).");
}

migrate().catch((error) => {
  console.error("\n❌ Migration failed:", error.message);
  process.exit(1);
});
