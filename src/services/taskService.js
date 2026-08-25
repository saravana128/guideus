import { databases, ID, Query, Permission, Role } from "../lib/appwrite";
import {
  DATABASE_CONFIG,
  TASK_STATUS,
  DEFAULT_TASK_CATEGORY,
} from "../utils/constants";
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

function withResolvedStatus(task) {
  return {
    ...task,
    rawStatus: task.status,
    status: resolveStatus(task),
    // Tasks created before categories existed default to "action"
    category: task.category || DEFAULT_TASK_CATEGORY,
  };
}

function buildPermissions(creatorId, assignedTo) {
  if (!creatorId) {
    throw new Error("The signed-in user ID is missing");
  }

  if (assignedTo && !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(assignedTo)) {
    throw new Error(
      "The assignee must be an Appwrite Auth user ID, not a profile document ID",
    );
  }

  const permissions = [
    Permission.read(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ];
  return permissions;
}

function toIsoDate(value) {
  if (!value) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export const taskService = {
  async listTasks(filters = {}) {
    ensureConfig();

    try {
      const queries = [];

      if (filters.courseId) {
        queries.push(Query.equal("courseId", filters.courseId));
      }
      if (filters.userId) {
        queries.push(Query.equal("userId", filters.userId));
      }
      if (filters.assignedTo) {
        queries.push(Query.equal("assignedTo", filters.assignedTo));
      }
      queries.push(Query.limit(500));

      const response = await databases.listDocuments(
        databaseId,
        tasksCollectionId,
        queries,
      );

      let tasks = response.documents.map(withResolvedStatus);

      // Status & search are applied client-side so the derived
      // "overdue" status also works as a filter.
      if (filters.status && filters.status !== "all") {
        tasks = tasks.filter((task) => task.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        tasks = tasks.filter(
          (task) =>
            task.title?.toLowerCase().includes(search) ||
            task.description?.toLowerCase().includes(search),
        );
      }

      return tasks.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
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
      return withResolvedStatus(task);
    } catch (error) {
      throw new Error(error.message || "Failed to fetch task");
    }
  },

  async createTask(taskData, user) {
    ensureConfig();

    try {
      const assignedTo = taskData.assignedTo || user.$id;
      const status = taskData.status || TASK_STATUS.PENDING;
      const data = {
        title: taskData.title,
        description: taskData.description || "",
        status,
        category: taskData.category || DEFAULT_TASK_CATEGORY,
        dueDate: toIsoDate(taskData.dueDate),
        completed: status === TASK_STATUS.COMPLETED,
        userId: user.$id,
        createdByName: user.name || user.email || "",
        courseId: taskData.courseId || null,
        assignedTo,
        assignedToName: taskData.assignedToName || user.name || "Me",
        imageUrl: taskData.imageUrl || null,
        referenceUrl: taskData.referenceUrl?.trim() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const task = await databases.createDocument(
        databaseId,
        tasksCollectionId,
        ID.unique(),
        data,
        buildPermissions(user.$id, assignedTo),
      );

      return withResolvedStatus(task);
    } catch (error) {
      throw new Error(error.message || "Failed to create task");
    }
  },

  async updateTask(taskId, taskData) {
    ensureConfig();

    try {
      const existing = await databases.getDocument(
        databaseId,
        tasksCollectionId,
        taskId,
      );

      const data = { updatedAt: new Date().toISOString() };
      if (taskData.title !== undefined) data.title = taskData.title;
      if (taskData.description !== undefined)
        data.description = taskData.description || "";
      if (taskData.status !== undefined) {
        data.status = taskData.status;
        data.completed = taskData.status === TASK_STATUS.COMPLETED;
      }
      if (taskData.completed !== undefined) data.completed = taskData.completed;
      if (taskData.category !== undefined)
        data.category = taskData.category || DEFAULT_TASK_CATEGORY;
      if (taskData.dueDate !== undefined)
        data.dueDate = toIsoDate(taskData.dueDate);
      if (taskData.courseId !== undefined)
        data.courseId = taskData.courseId || null;
      if (taskData.assignedTo !== undefined) {
        data.assignedTo = taskData.assignedTo || existing.userId;
        data.assignedToName = taskData.assignedToName || "";
      }
      if (taskData.imageUrl !== undefined)
        data.imageUrl = taskData.imageUrl || null;
      if (taskData.referenceUrl !== undefined)
        data.referenceUrl = taskData.referenceUrl?.trim() || null;

      const task = await databases.updateDocument(
        databaseId,
        tasksCollectionId,
        taskId,
        data,
        buildPermissions(
          existing.userId,
          data.assignedTo ?? existing.assignedTo,
        ),
      );

      if (
        existing.imageUrl &&
        taskData.imageUrl !== undefined &&
        data.imageUrl !== existing.imageUrl &&
        !data.imageUrl
      ) {
        await storageService.deleteImage(existing.imageUrl).catch(() => {});
      }

      return withResolvedStatus(task);
    } catch (error) {
      throw new Error(error.message || "Failed to update task");
    }
  },

  /** Inline status change from the task list */
  async updateTaskStatus(taskId, status) {
    ensureConfig();

    try {
      const updated = await databases.updateDocument(
        databaseId,
        tasksCollectionId,
        taskId,
        {
          status,
          completed: status === TASK_STATUS.COMPLETED,
          updatedAt: new Date().toISOString(),
        },
      );
      return withResolvedStatus(updated);
    } catch (error) {
      throw new Error(error.message || "Failed to update status");
    }
  },

  /** Inline due-date change from the task list */
  async updateTaskDueDate(taskId, dueDate) {
    ensureConfig();

    try {
      const updated = await databases.updateDocument(
        databaseId,
        tasksCollectionId,
        taskId,
        {
          dueDate: toIsoDate(dueDate),
          updatedAt: new Date().toISOString(),
        },
      );
      return withResolvedStatus(updated);
    } catch (error) {
      throw new Error(error.message || "Failed to update due date");
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
          : task.rawStatus === TASK_STATUS.COMPLETED ||
              task.status === TASK_STATUS.COMPLETED
            ? TASK_STATUS.PENDING
            : task.rawStatus || task.status,
        updatedAt: new Date().toISOString(),
      };

      const updated = await databases.updateDocument(
        databaseId,
        tasksCollectionId,
        task.$id,
        data,
      );

      return withResolvedStatus(updated);
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

