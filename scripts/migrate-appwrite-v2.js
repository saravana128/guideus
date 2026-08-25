/**
 * Appwrite Migration Script – v2 (Courses, Comments, Profiles, Task assignment)
 *
 * Run this ONCE after the original setup-appwrite.js has been run.
 * It is idempotent – safe to re-run; existing resources are skipped.
 *
 * What it does:
 *   1. Creates the "courses" collection (title, description, color, createdBy...)
 *   2. Creates the "comments" collection (course chat messages)
 *   3. Creates the "profiles" collection (mirrors the Appwrite user list so the
 *      client can display a user directory for task assignment)
 *   4. Adds new attributes to "tasks": courseId, assignedTo, assignedToName,
 *      createdByName
 *   5. Creates indexes for the new collections/attributes
 *   6. Backfills a profile document for every existing Appwrite user
 *   7. Moves existing tasks (that have no courseId) into a per-user
 *      "General" course and assigns them to their owner
 *
 * Usage:
 *   npm run setup:appwrite:v2
 *   (or) node scripts/migrate-appwrite-v2.js
 *
 * Required env vars (in .env):
 *   APPWRITE_API_KEY=your_api_key          (server-side key, required)
 *   VITE_APPWRITE_PROJECT_ID=...           (or APPWRITE_PROJECT_ID)
 *   VITE_APPWRITE_ENDPOINT=...             (or APPWRITE_ENDPOINT)
 */

import {
  Client,
  Databases,
  Permission,
  Role,
  Users,
  Query,
} from "node-appwrite";

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
const coursesCollectionId =
  process.env.APPWRITE_COURSES_COLLECTION_ID ||
  process.env.VITE_APPWRITE_COURSES_COLLECTION_ID ||
  "courses";
const commentsCollectionId =
  process.env.APPWRITE_COMMENTS_COLLECTION_ID ||
  process.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID ||
  "comments";
const profilesCollectionId =
  process.env.APPWRITE_PROFILES_COLLECTION_ID ||
  process.env.VITE_APPWRITE_PROFILES_COLLECTION_ID ||
  "profiles";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function validateConfig() {
  if (!projectId)
    throw new Error("APPWRITE_PROJECT_ID (or VITE_APPWRITE_PROJECT_ID) is required");
  if (!apiKey) {
    throw new Error(
      "APPWRITE_API_KEY is required. Add it to your .env file first.\n" +
        "Create one in the Appwrite Console → Project → API Keys " +
        "(needs databases.write, collections.write, attributes.write, indexes.write, users.read scopes).",
    );
  }
}

const isAlreadyExists = (error) =>
  error.code === 409 || error.message?.includes("already exists");

async function ensureCollection(databases, id, name) {
  try {
    await databases.getCollection(databaseId, id);
    console.log(`✅ Collection "${id}" exists`);
  } catch {
    await databases.createCollection(
      databaseId,
      id,
      name,
      [Permission.create(Role.users())],
      true, // document security
    );
    console.log(`✅ Created collection "${id}" (document security enabled)`);
  }
}

async function ensureStringAttribute(databases, collectionId, key, size, required, def) {
  try {
    await databases.createStringAttribute(
      databaseId,
      collectionId,
      key,
      size, // required by Appwrite – you can still change it in the console afterwards
      required,
      def || undefined, // xdefault
      false, // array – always create a plain string column, never an array
    );
    console.log(`✅ [${collectionId}] attribute "${key}" created`);
  } catch (error) {
    if (isAlreadyExists(error)) {
      console.log(`ℹ️  [${collectionId}] attribute "${key}" exists`);
    } else {
      console.error(`❌ [${collectionId}] attribute "${key}" failed:`, error.message);
    }
  }
}

async function ensureDatetimeAttribute(databases, collectionId, key, required) {
  try {
    await databases.createDatetimeAttribute(
      databaseId,
      collectionId,
      key,
      required,
    );
    console.log(`✅ [${collectionId}] attribute "${key}" created`);
  } catch (error) {
    if (isAlreadyExists(error)) {
      console.log(`ℹ️  [${collectionId}] attribute "${key}" exists`);
    } else {
      console.error(`❌ [${collectionId}] attribute "${key}" failed:`, error.message);
    }
  }
}

async function ensureIndex(databases, collectionId, key, type, attributes) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await databases.createIndex(databaseId, collectionId, key, type, attributes);
      console.log(`✅ [${collectionId}] index "${key}" created`);
      return;
    } catch (error) {
      if (isAlreadyExists(error)) {
        console.log(`ℹ️  [${collectionId}] index "${key}" exists`);
        return;
      }
      // Attributes may still be processing – wait and retry
      await sleep(2000 * attempt);
      if (attempt === 3) {
        console.error(`❌ [${collectionId}] index "${key}" failed:`, error.message);
      }
    }
  }
}

async function setupCollections(databases) {
  console.log("\n📦 Step 1: Collections");
  await ensureCollection(databases, coursesCollectionId, "Courses");
  await ensureCollection(databases, commentsCollectionId, "Comments");
  await ensureCollection(databases, profilesCollectionId, "Profiles");

  console.log("\n🧱 Step 2: Attributes");

  console.log("  → courses");
  await ensureStringAttribute(databases, coursesCollectionId, "title", 255, true);
  await ensureStringAttribute(databases, coursesCollectionId, "description", 2000, false);
  await ensureStringAttribute(databases, coursesCollectionId, "color", 50, false, "violet");
  await ensureStringAttribute(databases, coursesCollectionId, "createdBy", 255, true);
  await ensureStringAttribute(databases, coursesCollectionId, "createdByName", 255, false);
  await ensureDatetimeAttribute(databases, coursesCollectionId, "createdAt", true);
  await ensureDatetimeAttribute(databases, coursesCollectionId, "updatedAt", true);

  console.log("  → comments");
  await ensureStringAttribute(databases, commentsCollectionId, "courseId", 255, true);
  await ensureStringAttribute(databases, commentsCollectionId, "userId", 255, true);
  await ensureStringAttribute(databases, commentsCollectionId, "userName", 255, true);
  await ensureStringAttribute(databases, commentsCollectionId, "content", 2000, true);
  await ensureDatetimeAttribute(databases, commentsCollectionId, "createdAt", true);

  console.log("  → profiles");
  await ensureStringAttribute(databases, profilesCollectionId, "userId", 255, true);
  await ensureStringAttribute(databases, profilesCollectionId, "name", 255, true);
  await ensureStringAttribute(databases, profilesCollectionId, "email", 255, false);
  await ensureDatetimeAttribute(databases, profilesCollectionId, "createdAt", true);

  console.log("  → tasks (new columns)");
  await ensureStringAttribute(databases, tasksCollectionId, "courseId", 255, false);
  await ensureStringAttribute(databases, tasksCollectionId, "assignedTo", 255, false);
  await ensureStringAttribute(databases, tasksCollectionId, "assignedToName", 255, false);
  await ensureStringAttribute(databases, tasksCollectionId, "createdByName", 255, false);

  // Give Appwrite a moment to finish processing attributes before indexing
  await sleep(2000);

  console.log("\n🗂️  Step 3: Indexes");
  await ensureIndex(databases, coursesCollectionId, "idx_createdBy", "key", ["createdBy"]);
  await ensureIndex(databases, commentsCollectionId, "idx_courseId", "key", ["courseId"]);
  await ensureIndex(databases, profilesCollectionId, "unique_userId", "unique", ["userId"]);
  await ensureIndex(databases, tasksCollectionId, "idx_courseId", "key", ["courseId"]);
  await ensureIndex(databases, tasksCollectionId, "idx_assignedTo", "key", ["assignedTo"]);
}

/** Step 4: create a profile document for every existing Appwrite user */
async function backfillProfiles(client, databases) {
  console.log("\n👥 Step 4: Backfilling profiles from the Appwrite user list");
  const usersApi = new Users(client);
  const profileNames = new Map();
  let created = 0;
  let skipped = 0;
  let offset = 0;
  const limit = 100;

  for (;;) {
    const res = await usersApi.list([Query.limit(limit), Query.offset(offset)]);
    for (const u of res.users) {
      const name = u.name || (u.email || "").split("@")[0] || "User";
      profileNames.set(u.$id, name);
      try {
        await databases.createDocument(
          databaseId,
          profilesCollectionId,
          u.$id, // profile doc id == user id for easy lookups
          {
            userId: u.$id,
            name,
            email: u.email || "",
            createdAt: new Date().toISOString(),
          },
          [
            Permission.read(Role.users()),
            Permission.update(Role.user(u.$id)),
            Permission.delete(Role.user(u.$id)),
          ],
        );
        created += 1;
      } catch (error) {
        if (isAlreadyExists(error)) {
          skipped += 1;
        } else {
          console.error(`❌ Profile for "${u.email}" failed:`, error.message);
        }
      }
    }
    if (res.users.length < limit) break;
    offset += limit;
  }

  console.log(`✅ Profiles: ${created} created, ${skipped} already existed`);
  return profileNames;
}

/** Step 5: move existing tasks (no courseId) into a per-user "General" course */
async function backfillTasks(databases, profileNames) {
  console.log("\n📚 Step 5: Migrating existing tasks into courses");

  // Collect all tasks first (pagination + mutation don't mix well)
  const allTasks = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const res = await databases.listDocuments(databaseId, tasksCollectionId, [
      Query.limit(limit),
      Query.offset(offset),
    ]);
    allTasks.push(...res.documents);
    if (res.documents.length < limit) break;
    offset += limit;
  }

  const pending = allTasks.filter((t) => !t.courseId);
  if (pending.length === 0) {
    console.log("ℹ️  All tasks already belong to a course – nothing to do");
    return;
  }

  const generalCourseByUser = new Map();

  const getGeneralCourseId = async (ownerId) => {
    if (generalCourseByUser.has(ownerId)) {
      return generalCourseByUser.get(ownerId);
    }
    let courseId;
    const found = await databases.listDocuments(databaseId, coursesCollectionId, [
      Query.equal("createdBy", ownerId),
      Query.equal("title", "General"),
      Query.limit(1),
    ]);
    if (found.documents.length > 0) {
      courseId = found.documents[0].$id;
    } else {
      const course = await databases.createDocument(
        databaseId,
        coursesCollectionId,
        "unique()",
        {
          title: "General",
          description: "Tasks created before courses were introduced.",
          color: "indigo",
          createdBy: ownerId,
          createdByName: profileNames.get(ownerId) || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.users()),
          Permission.update(Role.user(ownerId)),
          Permission.delete(Role.user(ownerId)),
        ],
      );
      courseId = course.$id;
      console.log(`✅ Created "General" course for user ${ownerId}`);
    }
    generalCourseByUser.set(ownerId, courseId);
    return courseId;
  };

  let migrated = 0;
  for (const task of pending) {
    try {
      const ownerId = task.userId;
      const courseId = await getGeneralCourseId(ownerId);
      const ownerName = profileNames.get(ownerId) || "";
      await databases.updateDocument(databaseId, tasksCollectionId, task.$id, {
        courseId,
        assignedTo: task.assignedTo || ownerId,
        assignedToName: task.assignedToName || ownerName,
        createdByName: task.createdByName || ownerName,
      });
      migrated += 1;
    } catch (error) {
      console.error(`❌ Task "${task.title}" (${task.$id}) failed:`, error.message);
    }
  }

  console.log(`✅ Migrated ${migrated}/${pending.length} tasks into courses`);
}

async function migrate() {
  validateConfig();

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  const databases = new Databases(client);

  console.log("🔧 Starting Appwrite v2 migration...");
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Project:  ${projectId}`);
  console.log(`   Database: ${databaseId}`);

  await setupCollections(databases);
  const profileNames = await backfillProfiles(client, databases);
  await backfillTasks(databases, profileNames);

  console.log("\n🎉 Migration complete!");
  console.log("\nMake sure your .env contains:");
  console.log(`VITE_APPWRITE_DATABASE_ID=${databaseId}`);
  console.log(`VITE_APPWRITE_TASKS_COLLECTION_ID=${tasksCollectionId}`);
  console.log(`VITE_APPWRITE_COURSES_COLLECTION_ID=${coursesCollectionId}`);
  console.log(`VITE_APPWRITE_COMMENTS_COLLECTION_ID=${commentsCollectionId}`);
  console.log(`VITE_APPWRITE_PROFILES_COLLECTION_ID=${profilesCollectionId}`);
  console.log("\nThen restart the dev server (npm run dev).");
}

migrate().catch((error) => {
  console.error("\n❌ Migration failed:", error.message);
  process.exit(1);
});
