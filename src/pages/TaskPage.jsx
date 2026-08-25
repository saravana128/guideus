import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { taskService } from "../services/taskService";
import { storageService } from "../services/storageService";
import { useAuth } from "../hooks/useAuth";
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "../utils/constants";
import { formatDateTime } from "../utils/helpers";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import Avatar from "../components/common/Avatar";
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
        setTask(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleUpdate = async (formData) => {
    const updated = await taskService.updateTask(id, formData);
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
      navigate(task.courseId ? `/courses/${task.courseId}` : "/dashboard");
    }
  };

  if (loading) return <Loader size="lg" className="py-24" />;
  if (error) {
    return (
      <div className="card max-w-2xl mx-auto text-rose-300 border-rose-500/30 bg-rose-500/10">
        {error}
      </div>
    );
  }
  if (!task) {
    return <div className="card max-w-2xl mx-auto">Task not found.</div>;
  }

  const imageUrl = task.imageUrl
    ? storageService.getImageUrl(task.imageUrl)
    : null;
  const isCreator = user?.$id === task.userId;
  const isAssignee = user?.$id === task.assignedTo;
  const canUpdate = isCreator || isAssignee;
  const backTarget = task.courseId ? `/courses/${task.courseId}` : "/dashboard";

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={backTarget}
          className="text-sm text-surface-400 hover:text-primary-300 transition-colors"
        >
          ← Back
        </Link>
        {isCreator && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span
            className={`badge ${TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.pending}`}
          >
            {TASK_STATUS_LABELS[task.status] || "Pending"}
          </span>
          {task.completed && (
            <span className="badge bg-emerald-400/10 text-emerald-300 border-emerald-400/25">
              ✓ Completed
            </span>
          )}
        </div>

        <h1
          className={`font-display text-2xl md:text-3xl font-bold mb-5 ${task.completed ? "line-through text-surface-500" : "text-white"}`}
        >
          {task.title}
        </h1>

        <div className="text-surface-300 mb-6">
          {task.description ? (
            <p className="whitespace-pre-wrap">{task.description}</p>
          ) : (
            <p className="text-surface-500 italic">No description provided.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-surface-500 mb-1 text-xs uppercase tracking-wider">
              Due Date
            </p>
            <p
              className={`font-medium ${task.status === "overdue" ? "text-rose-300" : "text-surface-100"}`}
            >
              {formatDateTime(task.dueDate)}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-surface-500 mb-1 text-xs uppercase tracking-wider">
              Created
            </p>
            <p className="font-medium text-surface-100">
              {formatDateTime(task.createdAt)}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-surface-500 mb-2 text-xs uppercase tracking-wider">
              Assigned To
            </p>
            <div className="flex items-center gap-2">
              <Avatar name={task.assignedToName || "?"} size="xs" />
              <span className="font-medium text-surface-100">
                {task.assignedToName || "Unassigned"}
              </span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-surface-500 mb-2 text-xs uppercase tracking-wider">
              Created By
            </p>
            <div className="flex items-center gap-2">
              <Avatar name={task.createdByName || "?"} size="xs" />
              <span className="font-medium text-surface-100">
                {task.createdByName || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {imageUrl && (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-surface-500 mb-2">
              Reference Image
            </p>
            <img
              src={imageUrl}
              alt="Task reference"
              className="rounded-xl border border-white/10 max-h-96 object-contain"
            />
          </div>
        )}

        {canUpdate && (
          <Button
            variant={task.completed ? "secondary" : "primary"}
            onClick={handleToggle}
          >
            {task.completed ? "Mark as Pending" : "✓ Mark as Complete"}
          </Button>
        )}
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
