export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  OVERDUE: "overdue",
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: "Pending",
  [TASK_STATUS.IN_PROGRESS]: "In Progress",
  [TASK_STATUS.COMPLETED]: "Completed",
  [TASK_STATUS.OVERDUE]: "Overdue",
};

export const TASK_STATUS_COLORS = {
  [TASK_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [TASK_STATUS.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [TASK_STATUS.COMPLETED]: "bg-green-100 text-green-800",
  [TASK_STATUS.OVERDUE]: "bg-red-100 text-red-800",
};

export const DATABASE_CONFIG = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || "",
  tasksCollectionId: import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID || "",
  storageBucketId: import.meta.env.VITE_APPWRITE_STORAGE_ID || "",
};
