import { databases, ID, Query, Permission, Role } from "../lib/appwrite";
import { DATABASE_CONFIG } from "../utils/constants";

const { databaseId, coursesCollectionId } = DATABASE_CONFIG;

function ensureConfig() {
  if (!databaseId || !coursesCollectionId) {
    throw new Error("Database or courses collection ID is not configured");
  }
}

export const courseService = {
  async listCourses() {
    ensureConfig();

    try {
      const response = await databases.listDocuments(
        databaseId,
        coursesCollectionId,
        [Query.orderDesc("$createdAt"), Query.limit(200)],
      );
      return response.documents;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch courses");
    }
  },

  async getCourse(courseId) {
    ensureConfig();

    try {
      return await databases.getDocument(
        databaseId,
        coursesCollectionId,
        courseId,
      );
    } catch (error) {
      throw new Error(error.message || "Failed to fetch course");
    }
  },

  async createCourse(data, user) {
    ensureConfig();

    try {
      return await databases.createDocument(
        databaseId,
        coursesCollectionId,
        ID.unique(),
        {
          title: data.title,
          description: data.description || "",
          color: data.color || "violet",
          createdBy: user.$id,
          createdByName: user.name || user.email || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.users()),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ],
      );
    } catch (error) {
      throw new Error(error.message || "Failed to create course");
    }
  },

  async updateCourse(courseId, data) {
    ensureConfig();

    try {
      return await databases.updateDocument(
        databaseId,
        coursesCollectionId,
        courseId,
        {
          title: data.title,
          description: data.description || "",
          color: data.color || "violet",
          updatedAt: new Date().toISOString(),
        },
      );
    } catch (error) {
      throw new Error(error.message || "Failed to update course");
    }
  },

  async deleteCourse(courseId) {
    ensureConfig();

    try {
      await databases.deleteDocument(
        databaseId,
        coursesCollectionId,
        courseId,
      );
    } catch (error) {
      throw new Error(error.message || "Failed to delete course");
    }
  },
};
