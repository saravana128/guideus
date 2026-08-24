/**
 * Appwrite Setup Script
 *
 * Run this script with Node.js to create the required Appwrite resources:
 * - Database
 * - Tasks collection with attributes
 * - Collection indexes
 * - Storage bucket for task images
 *
 * Usage:
 *   node scripts/setup-appwrite.js
 *
 * Required env vars:
 *   APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
 *   APPWRITE_PROJECT_ID=your_project_id
 *   APPWRITE_API_KEY=your_api_key
 *
 * Optional env vars:
 *   APPWRITE_DATABASE_ID=guideus_db
 *   APPWRITE_TASKS_COLLECTION_ID=tasks
 *   APPWRITE_STORAGE_ID=task_attachments
 */

import { Client, Databases, Storage, Permission, Role } from "node-appwrite";

try {
  const dotenv = await import("dotenv");
  dotenv.config();
} catch {
  // dotenv not installed
}

const endpoint =
  process.env.APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const projectId = process.env.APPWRITE_PROJECT_ID || "6a8c5fae001dbdfe1290";
const apiKey = process.env.APPWRITE_API_KEY || "";
const databaseId = process.env.APPWRITE_DATABASE_ID || "guideus_db";
const tasksCollectionId = process.env.APPWRITE_TASKS_COLLECTION_ID || "tasks";
const storageBucketId = process.env.APPWRITE_STORAGE_ID || "task_attachments";

function validateConfig() {
  if (!projectId) throw new Error("APPWRITE_PROJECT_ID is required");
  if (!apiKey) throw new Error("APPWRITE_API_KEY is required");
}

async function setup() {
  validateConfig();
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  const databases = new Databases(client);
  const storage = new Storage(client);

  console.log("🔧 Starting Appwrite setup...");
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Project:  ${projectId}`);

  // 1. Database
  try {
    await databases.get(databaseId);
    console.log(`✅ Database "${databaseId}" exists`);
  } catch {
    await databases.create(databaseId, "GuideUs Database");
    console.log(`✅ Created database "${databaseId}"`);
  }

  // 2. Collection
  try {
    await databases.getCollection(databaseId, tasksCollectionId);
    console.log(`✅ Collection "${tasksCollectionId}" exists`);
  } catch {
    await databases.createCollection(
      databaseId,
      tasksCollectionId,
      "Tasks",
      [Permission.create(Role.users())],
      true,
    );
    console.log(
      `✅ Created collection "${tasksCollectionId}" with document security`,
    );
  }

  // 3. Attributes
  const attributes = [
    { key: "title", type: "string", size: 255, required: true },
    { key: "description", type: "string", size: 5000, required: false },
    {
      key: "status",
      type: "string",
      size: 50,
      required: true,
      default: "pending",
    },
    { key: "dueDate", type: "datetime", required: true },
    { key: "completed", type: "boolean", required: true, default: false },
    { key: "userId", type: "string", size: 255, required: true },
    { key: "imageUrl", type: "string", size: 255, required: false },
    { key: "createdAt", type: "datetime", required: true },
    { key: "updatedAt", type: "datetime", required: true },
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === "string") {
        await databases.createStringAttribute(
          databaseId,
          tasksCollectionId,
          attr.key,
          attr.size,
          attr.required,
          attr.default || undefined,
          attr.key !== "status",
        );
      } else if (attr.type === "datetime") {
        await databases.createDatetimeAttribute(
          databaseId,
          tasksCollectionId,
          attr.key,
          attr.required,
        );
      } else if (attr.type === "boolean") {
        await databases.createBooleanAttribute(
          databaseId,
          tasksCollectionId,
          attr.key,
          attr.required,
          attr.default ?? undefined,
        );
      }
      console.log(`✅ Created attribute "${attr.key}"`);
    } catch (error) {
      if (error.message?.includes("already exists") || error.code === 409) {
        console.log(`ℹ️  Attribute "${attr.key}" exists`);
      } else {
        console.error(`❌ Attribute "${attr.key}" failed:`, error.message);
      }
    }
  }

  // 4. Indexes
  const indexes = [
    { key: "idx_user_tasks", type: "key", attributes: ["userId", "createdAt"] },
    { key: "idx_status", type: "key", attributes: ["status", "userId"] },
    { key: "idx_due_date", type: "key", attributes: ["dueDate", "userId"] },
  ];

  for (const idx of indexes) {
    try {
      await databases.createIndex(
        databaseId,
        tasksCollectionId,
        idx.key,
        idx.type,
        idx.attributes,
      );
      console.log(`✅ Created index "${idx.key}"`);
    } catch (error) {
      if (error.message?.includes("already exists") || error.code === 409) {
        console.log(`ℹ️  Index "${idx.key}" exists`);
      } else {
        console.error(`❌ Index "${idx.key}" failed:`, error.message);
      }
    }
  }

  // 5. Storage Bucket
  try {
    await storage.getBucket(storageBucketId);
    console.log(`✅ Storage bucket "${storageBucketId}" exists`);
  } catch {
    await storage.createBucket(
      storageBucketId,
      "Task Attachments",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false,
      true,
      10 * 1024 * 1024,
      ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    );
    console.log(`✅ Created storage bucket "${storageBucketId}"`);
  }

  console.log("\n🎉 Setup complete!");
  console.log("\nAdd these to your .env file:");
  console.log(`VITE_APPWRITE_ENDPOINT=${endpoint}`);
  console.log(`VITE_APPWRITE_PROJECT_ID=${projectId}`);
  console.log(`VITE_APPWRITE_DATABASE_ID=${databaseId}`);
  console.log(`VITE_APPWRITE_TASKS_COLLECTION_ID=${tasksCollectionId}`);
  console.log(`VITE_APPWRITE_STORAGE_ID=${storageBucketId}`);
}

setup().catch((error) => {
  console.error("\n❌ Setup failed:", error.message);
  process.exit(1);
});
