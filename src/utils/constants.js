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
  [TASK_STATUS.PENDING]: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  [TASK_STATUS.IN_PROGRESS]: "bg-sky-400/10 text-sky-300 border-sky-400/25",
  [TASK_STATUS.COMPLETED]:
    "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
  [TASK_STATUS.OVERDUE]: "bg-rose-400/10 text-rose-300 border-rose-400/25",
};

// Statuses a user can pick (overdue is derived automatically from the due date)
export const SELECTABLE_STATUSES = [
  TASK_STATUS.PENDING,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.COMPLETED,
];

export const TASK_CATEGORY = {
  LEARNING: "learning",
  ACTION: "action",
};

export const TASK_CATEGORY_LABELS = {
  [TASK_CATEGORY.LEARNING]: "Learning",
  [TASK_CATEGORY.ACTION]: "Action",
};

export const TASK_CATEGORY_ICONS = {
  [TASK_CATEGORY.LEARNING]: "📚",
  [TASK_CATEGORY.ACTION]: "⚡",
};

export const TASK_CATEGORY_COLORS = {
  [TASK_CATEGORY.LEARNING]:
    "bg-violet-400/10 text-violet-300 border-violet-400/25",
  [TASK_CATEGORY.ACTION]:
    "bg-orange-400/10 text-orange-300 border-orange-400/25",
};

export const SELECTABLE_CATEGORIES = [
  TASK_CATEGORY.LEARNING,
  TASK_CATEGORY.ACTION,
];

// Fallback for tasks created before categories existed
export const DEFAULT_TASK_CATEGORY = TASK_CATEGORY.ACTION;

export const DATABASE_CONFIG = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || "",
  tasksCollectionId: import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID || "",
  coursesCollectionId:
    import.meta.env.VITE_APPWRITE_COURSES_COLLECTION_ID || "courses",
  commentsCollectionId:
    import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || "comments",
  profilesCollectionId:
    import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || "profiles",
  storageBucketId: import.meta.env.VITE_APPWRITE_STORAGE_ID || "",
};

// Gradient palettes for courses (full class names so Tailwind picks them up)
export const COURSE_GRADIENTS = {
  violet: {
    label: "Violet",
    gradient: "from-violet-500 to-fuchsia-500",
    hex: "#8b5cf6",
  },
  sky: {
    label: "Sky",
    gradient: "from-sky-500 to-indigo-500",
    hex: "#0ea5e9",
  },
  emerald: {
    label: "Emerald",
    gradient: "from-emerald-500 to-teal-400",
    hex: "#10b981",
  },
  amber: {
    label: "Amber",
    gradient: "from-amber-500 to-orange-500",
    hex: "#f59e0b",
  },
  rose: {
    label: "Rose",
    gradient: "from-rose-500 to-pink-500",
    hex: "#f43f5e",
  },
  indigo: {
    label: "Indigo",
    gradient: "from-indigo-500 to-blue-500",
    hex: "#6366f1",
  },
};

export const AVATAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
];
