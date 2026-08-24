import React from 'react'
import TaskCard from './TaskCard'
import Loader from '../common/Loader'

function TaskList({ tasks, loading, onToggle, onDelete, onEdit, emptyMessage = 'No tasks found.' }) {
  if (loading) {
    return <Loader size="lg" className="py-12" />
  }

  if (tasks.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.$id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

export default TaskList
