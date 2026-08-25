import { databases, ID, Query, Permission, Role } from "../lib/appwrite";
import { DATABASE_CONFIG } from "../utils/constants";

const { databaseId, commentsCollectionId } = DATABASE_CONFIG;

function ensureConfig() {
  if (!databaseId || !commentsCollectionId) {
    throw new Error("Database or comments collection ID is not configured");
  }
}

export const commentService = {
  async listComments(courseId) {
    ensureConfig();

    try {
      const response = await databases.listDocuments(
        databaseId,
        commentsCollectionId,
        [Query.equal("courseId", courseId), Query.limit(300)],
      );
      return response.documents.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
    } catch (error) {
      throw new Error(error.message || "Failed to fetch comments");
    }
  },

  async addComment(courseId, user, content) {
    ensureConfig();

    try {
      return await databases.createDocument(
        databaseId,
        commentsCollectionId,
        ID.unique(),
        {
          courseId,
          userId: user.$id,
          userName: user.name || user.email || "User",
          content,
          createdAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.users()),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ],
      );
    } catch (error) {
      throw new Error(error.message || "Failed to post comment");
    }
  },

  async deleteComment(commentId) {
    ensureConfig();

    try {
      await databases.deleteDocument(
        databaseId,
        commentsCollectionId,
        commentId,
      );
    } catch (error) {
      throw new Error(error.message || "Failed to delete comment");
    }
  },
};
