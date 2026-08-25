import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  SELECTABLE_STATUSES,
} from "../../utils/constants";

function TaskFilter({ filters, onChange }) {
  return (
    <div className="card !p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m1.6-5.15a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="input !pl-10"
          />
        </div>

        <select
          value={filters.status || "all"}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="input sm:w-48"
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          {SELECTABLE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
          <option value={TASK_STATUS.OVERDUE}>Overdue</option>
        </select>

        <button
          onClick={() => onChange({ search: "", status: "all" })}
          className="btn-secondary whitespace-nowrap"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default TaskFilter;
