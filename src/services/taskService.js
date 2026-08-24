import { databases, ID, Query, Permission, Role } from "../lib/appwrite";
import { DATABASE_CONFIG, TASK_STATUS } from "../utils/constants";
import { isOverdue } from "../utils/helpers";
import { storageService } from "./storageService";

const { databaseId, tasksCollectionId } = DATABASE_CONFIG;

function ensureConfig() {
  if (!databaseId || !tasksCollectionId) {
    throw new Error("Database or collection ID is not configured");
  }
}

function resolveStatus(task) {
  if (task.completed) return TASK_STATUS.COMPLETED;
  if (isOverdue(task.dueDate)) return TASK_STATUS.OVERDUE;
  return task.status || TASK_STATUS.PENDING;
}

export const taskService = {
  async listTasks(userId, filters = {}) {
    ensureConfig();

    try {
      const queries = [Query.equal("userId", userId)];

      if (filters.status && filters.status !== "all") {
        queries.push(Query.equal("status", filters.status));
      }

      if (filters.search) {
        queries.push(Query.search("title", filters.search));
      }

      queries.push(Query.orderDesc("createdAt"));

      const response = await databases.listDocuments(
        databaseId,
        tasksCollectionId,
        queries,
      );

      return response.documents.map((task) => ({
        ...task,
        status: resolveStatus(task),
      }));
    } catch (error) {
      throw new Error(error.message || "Failed to fetch tasks");
    }
  },

  async getTask(taskId) {
    ensureConfig();

    try {
      const task = await databases.getDocument(
        databaseId,
        tasksCollectionId,
        taskId,
      );
      return {
        ...task,
        status: resolveStatus(task),
      };
    } catch (error) {
      throw new Error(error.message || "Failed to fetch task");
    }
  },

  async createTask(taskData, userId) {
    ensureConfig();

    try {
      const data = {
        title: taskData.title,
        description: taskData.description || "",
        status: taskData.status || TASK_STATUS.PENDING,
        dueDate: taskData.dueDate,
        completed: false,
        userId,
        imageUrl: taskData.imageUrl || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const task = await databases.createDocument(
        databaseId,
        tasksCollectionId,
        ID.unique(),
        data,
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ],
      );

      return {
        ...task,
        status: resolveStatus(task),
      };
    } catch (error) {
      throw new Error(error.message || "Failed to create task");
    }
  },

  async updateTask(taskId, taskData, existingImageUrl = null) {
    ensureConfig();

    try {
      const data = {
        title: taskData.title,
        description: taskData.description || "",
        status: taskData.status,
        dueDate: taskData.dueDate,
        completed: taskData.completed ?? false,
        updatedAt: new Date().toISOString(),
      };

      if (taskData.imageUrl !== undefined) {
        data.imageUrl = taskData.imageUrl || null;
      }

      const task = await databases.updateDocument(
        databaseId,
        tasksCollectionId,
        taskId,
        data,
      );

      if (
        existingImageUrl &&
        data.imageUrl !== existingImageUrl &&
        !data.imageUrl
      ) {
        await storageService.deleteImage(existingImageUrl).catch(() => {});
      }

      return {
        ...task,
        status: resolveStatus(task),
      };
    } catch (error) {
      throw new Error(error.message || "Failed to update task");
    }
  },

  async toggleComplete(task) {
    ensureConfig();

    try {
      const completed = !task.completed;
      const data = {
        completed,
        status: completed
          ? TASK_STATUS.COMPLETED
          : task.status === TASK_STATUS.COMPLETED
            ? TASK_STATUS.PENDING
            : task.status,
        updatedAt: new Date().toISOString(),
      };

      const updated = await databases.updateDocument(
        databaseId,
        tasksCollectionId,
        task.$id,
        data,
      );

      return {
        ...updated,
        status: resolveStatus(updated),
      };
    } catch (error) {
      throw new Error(error.message || "Failed to update task");
    }
  },

  async deleteTask(taskId, imageUrl = null) {
    ensureConfig();

    try {
      await databases.deleteDocument(databaseId, tasksCollectionId, taskId);

      if (imageUrl) {
        await storageService.deleteImage(imageUrl).catch(() => {});
      }
    } catch (error) {
      throw new Error(error.message || "Failed to delete task");
    }
  },
};
