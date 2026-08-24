import React from 'react'
import { Link } from 'react-router-dom'
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../../utils/constants'
import { formatDateTime, truncateText } from '../../utils/helpers'
import { storageService } from '../../services/storageService'
import Button from '../common/Button'

function TaskCard({ task, onToggle, onDelete, onEdit }) {
  const imageUrl = task.imageUrl ? storageService.getImageUrl(task.imageUrl) : null

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.pending}`}>
              {TASK_STATUS_LABELS[task.status] || 'Pending'}
            </span>
            {task.completed && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Done
              </span>
            )}
          </div>

          <Link to={`/tasks/${task.$id}`}>
            <h3 className={`text-lg font-semibold text-gray-900 hover:text-primary-600 ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>
          </Link>

          <p className="mt-1 text-gray-600 text-sm">
            {truncateText(task.description, 120)}
          </p>

          <p className="mt-3 text-sm text-gray-500">
            📅 Due: <span className={task.status === 'overdue' ? 'text-red-600 font-medium' : ''}>{formatDateTime(task.dueDate)}</span>
          </p>
        </div>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Task reference"
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Button
          variant={task.completed ? 'secondary' : 'primary'}
          onClick={() => onToggle(task)}
          className="text-sm"
        >
          {task.completed ? 'Mark Pending' : 'Mark Complete'}
        </Button>
        <Button variant="outline" onClick={() => onEdit(task)} className="text-sm">Edit</Button>
        <Link to={`/tasks/${task.$id}`}>
          <Button variant="outline" className="text-sm">View</Button>
        </Link>
        <Button
          variant="danger"
          onClick={() => onDelete(task)}
          className="text-sm"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

export default TaskCard
