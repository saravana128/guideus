import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskService } from "../services/taskService";
import { storageService } from "../services/storageService";
import { useAuth } from "../hooks/useAuth";
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "../utils/constants";
import { formatDateTime } from "../utils/helpers";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import TaskForm from "../components/tasks/TaskForm";

function TaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const data = await taskService.getTask(id);
        if (data.userId !== user.$id) {
          setError("You do not have permission to view this task");
          return;
        }
        setTask(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, user]);

  const handleUpdate = async (formData) => {
    const updated = await taskService.updateTask(id, formData, task.imageUrl);
    setTask(updated);
    setIsEditing(false);
  };

  const handleToggle = async () => {
    const updated = await taskService.toggleComplete(task);
    setTask(updated);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await taskService.deleteTask(task.$id, task.imageUrl);
      navigate("/dashboard");
    }
  };

  if (loading) return <Loader size="lg" className="py-12" />;
  if (error) return <div className="card text-red-600">{error}</div>;
  if (!task) return <div className="card">Task not found</div>;

  const imageUrl = task.imageUrl
    ? storageService.getImageUrl(task.imageUrl)
    : null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[task.status]}`}
              >
                {TASK_STATUS_LABELS[task.status]}
              </span>
              {task.completed && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Completed
                </span>
              )}
            </div>
            <h1
              className={`text-2xl md:text-3xl font-bold ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}
            >
              {task.title}
            </h1>
          </div>
        </div>

        <div className="prose max-w-none text-gray-700 mb-6">
          {task.description ? (
            <p className="whitespace-pre-wrap">{task.description}</p>
          ) : (
            <p className="text-gray-400 italic">No description provided.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 mb-1">Due Date</p>
            <p
              className={`font-medium ${task.status === "overdue" ? "text-red-600" : "text-gray-900"}`}
            >
              {formatDateTime(task.dueDate)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 mb-1">Created</p>
            <p className="font-medium text-gray-900">
              {formatDateTime(task.createdAt)}
            </p>
          </div>
        </div>

        {imageUrl && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Reference Image
            </p>
            <img
              src={imageUrl}
              alt="Task reference"
              className="rounded-lg border border-gray-200 max-h-96 object-contain"
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant={task.completed ? "secondary" : "primary"}
            onClick={handleToggle}
          >
            {task.completed ? "Mark as Pending" : "Mark as Complete"}
          </Button>
        </div>
      </div>

      <TaskForm
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={handleUpdate}
        task={task}
      />
    </div>
  );
}

export default TaskPage;
