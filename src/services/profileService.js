import { databases, Query, Permission, Role } from "../lib/appwrite";
import { DATABASE_CONFIG } from "../utils/constants";

const { databaseId, profilesCollectionId } = DATABASE_CONFIG;

function ensureConfig() {
  if (!databaseId || !profilesCollectionId) {
    throw new Error("Database or profiles collection ID is not configured");
  }
}

/**
 * Profiles mirror the Appwrite user list so the client app can show
 * a directory of users (the client SDK cannot list users directly).
 * The migration script backfills profiles for existing users, and every
 * login/registration keeps the current user's profile up to date.
 */
export const profileService = {
  async ensureProfile(user) {
    if (!user) return null;
    ensureConfig();

    try {
      return await databases.getDocument(
        databaseId,
        profilesCollectionId,
        user.$id,
      );
    } catch {
      try {
        return await databases.createDocument(
          databaseId,
          profilesCollectionId,
          user.$id,
          {
            userId: user.$id,
            name: user.name || (user.email || "").split("@")[0] || "User",
            email: user.email || "",
            createdAt: new Date().toISOString(),
          },
          [
            Permission.read(Role.users()),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ],
        );
      } catch {
        // Profile was created concurrently – fetch it
        try {
          return await databases.getDocument(
            databaseId,
            profilesCollectionId,
            user.$id,
          );
        } catch {
          return null;
        }
      }
    }
  },

  async listProfiles() {
    ensureConfig();

    try {
      const response = await databases.listDocuments(
        databaseId,
        profilesCollectionId,
        [Query.limit(500)],
      );
      return response.documents.sort((a, b) =>
        (a.name || "").localeCompare(b.name || ""),
      );
    } catch (error) {
      throw new Error(error.message || "Failed to fetch users");
    }
  },
};
