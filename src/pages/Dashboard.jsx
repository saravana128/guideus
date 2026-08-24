import React, { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import TaskList from '../components/tasks/TaskList'
import TaskFilter from '../components/tasks/TaskFilter'
import TaskForm from '../components/tasks/TaskForm'
import Button from '../components/common/Button'

function Dashboard() {
  const [filters, setFilters] = useState({ search: '', status: 'all' })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const { tasks, loading, error, createTask, updateTask, toggleComplete, deleteTask } = useTasks(filters)

  const handleCreate = async (formData) => {
    await createTask(formData)
  }

  const handleUpdate = async (formData) => {
    await updateTask(editingTask.$id, formData, editingTask.imageUrl)
    setEditingTask(null)
  }

  const handleToggle = async (task) => {
    await toggleComplete(task)
  }

  const handleDelete = async (task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task)
    }
  }

  const openCreateForm = () => {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  const openEditForm = (task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your tasks and stay on track.</p>
        </div>
        <Button onClick={openCreateForm}>+ New Task</Button>
      </div>

      <TaskFilter filters={filters} onChange={setFilters} />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading tasks...' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <TaskList
        tasks={tasks}
        loading={loading}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={openEditForm}
        emptyMessage="No tasks yet. Create your first task to get started!"
      />

      {tasks.some((task) => task.status !== 'completed') && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setFilters({ search: '', status: 'all' })}>
            Clear Filters
          </Button>
        </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingTask ? handleUpdate : handleCreate}
        task={editingTask}
      />
    </div>
  )
}

export default Dashboard
