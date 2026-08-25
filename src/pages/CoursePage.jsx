import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { courseService } from "../services/courseService";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import { COURSE_GRADIENTS, TASK_STATUS } from "../utils/constants";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import CourseProgress from "../components/courses/CourseProgress";
import CourseForm from "../components/courses/CourseForm";
import TaskList from "../components/tasks/TaskList";
import TaskFilter from "../components/tasks/TaskFilter";
import TaskForm from "../components/tasks/TaskForm";
import CommentSection from "../components/comments/CommentSection";

function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [courseError, setCourseError] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [query, setQuery] = useState({ search: "", status: "all" });
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);

  const filters = useMemo(() => ({ courseId: id }), [id]);
  const {
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    updateStatus,
    updateDueDate,
    deleteTask,
  } = useTasks(filters);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setCourseLoading(true);
        const data = await courseService.getCourse(id);
        if (!cancelled) setCourse(data);
      } catch (err) {
        if (!cancelled) setCourseError(err.message);
      } finally {
        if (!cancelled) setCourseLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (query.status !== "all" && task.status !== query.status)
          return false;
        if (query.search) {
          const search = query.search.toLowerCase();
          return (
            task.title?.toLowerCase().includes(search) ||
            task.description?.toLowerCase().includes(search)
          );
        }
        return true;
      }),
    [tasks, query],
  );

  const total = tasks.length;
  const completed = tasks.filter(
    (t) => t.status === TASK_STATUS.COMPLETED,
  ).length;
  const overdue = tasks.filter((t) => t.status === TASK_STATUS.OVERDUE).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const isOwner = course && user && course.createdBy === user.$id;
  const palette =
    COURSE_GRADIENTS[course?.color] || COURSE_GRADIENTS.violet;

  const handleStatusChange = async (task, status) => {
    await updateStatus(task, status);
  };

  const handleDueDateChange = async (task, dueDate) => {
    await updateDueDate(task, dueDate);
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      await deleteTask(task);
    }
  };

  const handleDeleteCourse = async () => {
    if (
      window.confirm(
        `Delete "${course.title}"? Its tasks will remain but lose their course.`,
      )
    ) {
      await courseService.deleteCourse(course.$id);
      navigate("/dashboard");
    }
  };

  if (courseLoading) return <Loader size="lg" className="py-24" />;
  if (courseError) {
    return (
      <div className="card max-w-2xl mx-auto text-rose-300 border-rose-500/30 bg-rose-500/10">
        {courseError}
      </div>
    );
  }
  if (!course) {
    return <div className="card max-w-2xl mx-auto">Course not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Course header */}
      <div className="card relative overflow-hidden mb-6 animate-fade-in-up">
        <div
          className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${palette.gradient}`}
        />
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <Link
              to="/dashboard"
              className="text-sm text-surface-400 hover:text-primary-300 transition-colors"
            >
              ← Back to courses
            </Link>
            <div className="mt-3 flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${palette.gradient} flex items-center justify-center text-xl font-display font-bold text-white shadow-glow flex-shrink-0`}
              >
                {course.title?.charAt(0)?.toUpperCase() || "📚"}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white truncate">
                {course.title}
              </h1>
            </div>
            {course.description && (
              <p className="mt-2 text-surface-400">{course.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="badge bg-white/5 text-surface-300 border-white/10">
                🗂️ {total} task{total !== 1 ? "s" : ""}
              </span>
              <span className="badge bg-emerald-400/10 text-emerald-300 border-emerald-400/25">
                ✓ {completed} completed
              </span>
              {overdue > 0 && (
                <span className="badge bg-rose-400/10 text-rose-300 border-rose-400/25">
                  ⚠ {overdue} overdue
                </span>
              )}
              {course.createdByName && (
                <span className="badge bg-white/5 text-surface-400 border-white/10">
                  👤 by {course.createdByName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 flex-shrink-0">
            <CourseProgress
              variant="ring"
              percent={percent}
              color={course.color}
              size={118}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskFormOpen(true);
                }}
              >
                + New Task
              </Button>
              {isOwner && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsCourseFormOpen(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={handleDeleteCourse}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
            Tasks
            <span className="badge bg-primary-500/15 text-primary-300 border-primary-400/25">
              {filteredTasks.length}
            </span>
          </h2>
          <TaskFilter filters={query} onChange={setQuery} />
          <TaskList
            tasks={filteredTasks}
            loading={tasksLoading}
            onStatusChange={handleStatusChange}
            onDueDateChange={handleDueDateChange}
            onEdit={(task) => {
              setEditingTask(task);
              setIsTaskFormOpen(true);
            }}
            onDelete={handleDeleteTask}
            emptyMessage="No tasks in this course yet. Add one to get started!"
          />
        </div>

        <div className="lg:sticky lg:top-24">
          <CommentSection courseId={id} />
        </div>
      </div>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={async (data) => {
          if (editingTask) {
            await updateTask(editingTask.$id, data);
          } else {
            await createTask(data);
          }
        }}
        task={editingTask}
        defaultCourseId={id}
      />

      {isOwner && (
        <CourseForm
          isOpen={isCourseFormOpen}
          onClose={() => setIsCourseFormOpen(false)}
          onSubmit={async (data) => {
            const updated = await courseService.updateCourse(id, data);
            setCourse(updated);
          }}
          course={course}
        />
      )}
    </div>
  );
}

export default CoursePage;
