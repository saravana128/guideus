import React from 'react'
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../utils/constants'

function TaskFilter({ filters, onChange }) {
  return (
    <div className="card mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="input"
          />
        </div>

        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="input"
          >
            <option value="all">All Statuses</option>
            {Object.values(TASK_STATUS).map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => onChange({ search: '', status: 'all' })}
            className="btn-secondary w-full sm:w-auto"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskFilter
