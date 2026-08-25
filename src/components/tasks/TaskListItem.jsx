import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  SELECTABLE_STATUSES,
} from "../../utils/constants";
import { toDateTimeLocalValue, isOverdue } from "../../utils/helpers";
import Avatar from "../common/Avatar";

function MiniSpinner() {
  return (
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-surface-600 border-t-primary-400 inline-block" />
  );
}

function TaskListItem({
  task,
  index = 0,
  onStatusChange,
  onDueDateChange,
  onEdit,
  onDelete,
}) {
  const [saving, setSaving] = useState(null); // "status" | "dueDate"
  const overdue = !task.completed && isOverdue(task.dueDate);

  const rawStatus =
    task.rawStatus === TASK_STATUS.COMPLETED
      ? TASK_STATUS.PENDING
      : task.rawStatus || TASK_STATUS.PENDING;
  const currentStatus = task.completed ? TASK_STATUS.COMPLETED : rawStatus;

  const handleStatus = async (e) => {
    setSaving("status");
    try {
      await onStatusChange(task, e.target.value);
    } finally {
      setSaving(null);
    }
  };

  const handleDueDate = async (e) => {
    if (!e.target.value) return;
    setSaving("dueDate");
    try {
      await onDueDateChange(task, e.target.value);
    } finally {
      setSaving(null);
    }
  };

  const statusKey = overdue ? TASK_STATUS.OVERDUE : task.status;

  return (
    <div
      className={`glass rounded-2xl px-4 py-3.5 flex flex-col gap-3 md:flex-row md:items-center transition-all duration-200 hover:border-white/20 animate-fade-in-up ${task.completed ? "opacity-70" : ""}`}
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      {/* Inline status dropdown */}
      <div className="relative flex-shrink-0 w-fit">
        <select
          value={currentStatus}
          onChange={handleStatus}
          disabled={saving === "status"}
          aria-label="Task status"
          className={`appearance-none cursor-pointer rounded-full border pl-3 pr-8 py-1.5 text-xs font-semibold outline-none transition-all hover:brightness-125 ${TASK_STATUS_COLORS[statusKey] || TASK_STATUS_COLORS.pending}`}
        >
          {SELECTABLE_STATUSES.map((status) => (
            <option
              key={status}
              value={status}
              className="bg-surface-900 text-surface-100"
            >
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/tasks/${task.$id}`}
          className={`block font-medium truncate transition-colors hover:text-primary-300 ${task.completed ? "line-through text-surface-500" : "text-surface-100"}`}
        >
          {task.title}
        </Link>
        <div className="mt-1 flex items-center gap-2 text-xs text-surface-400 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Avatar name={task.assignedToName || "?"} size="xs" />
            {task.assignedToName || "Unassigned"}
          </span>
          {task.createdByName && task.assignedTo !== task.userId && (
            <span>· assigned by {task.createdByName}</span>
          )}
          {overdue && (
            <span
              className={`badge ${TASK_STATUS_COLORS.overdue}`}
            >
              ⚠ Overdue
            </span>
          )}
        </div>
      </div>

      {/* Inline due-date editor */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {saving === "dueDate" && <MiniSpinner />}
        <input
          type="datetime-local"
          value={toDateTimeLocalValue(task.dueDate)}
          onChange={handleDueDate}
          aria-label="Due date"
          className={`rounded-lg bg-white/5 border px-2.5 py-1.5 text-xs outline-none transition-all focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/60 ${overdue ? "border-rose-500/40 text-rose-300" : "border-white/10 text-surface-200"}`}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 md:pl-2">
        {saving === "status" && <MiniSpinner />}
        <button
          onClick={() => onEdit(task)}
          className="icon-btn"
          title="Edit task"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-2 rounded-lg text-surface-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          title="Delete task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TaskListItem;
