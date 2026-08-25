import { AVATAR_GRADIENTS } from "./constants";

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isOverdue(dueDate, completed = false) {
  if (completed || !dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || "";
  return text.slice(0, maxLength).trim() + "...";
}

export function generateFilePreview(fileId) {
  if (!fileId) return null;
  const endpoint =
    import.meta.env.VITE_APPWRITE_ENDPOINT ||
    "https://sgp.cloud.appwrite.io/v1";
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || "";
  const bucketId = import.meta.env.VITE_APPWRITE_STORAGE_ID || "";
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${projectId}`;
}

/** Convert an ISO date string to the value format used by datetime-local inputs */
export function toDateTimeLocalValue(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Human friendly relative time, e.g. "just now", "5m ago", "2h ago" */
export function relativeTime(dateString) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

export function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Deterministic gradient for a name so avatars stay consistent */
export function avatarGradient(name = "") {
  let hash = 0;
  const str = String(name);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}
