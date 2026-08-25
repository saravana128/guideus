import { useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCourses } from "../hooks/useCourses";
import { useTasks } from "../hooks/useTasks";
import { TASK_STATUS } from "../utils/constants";
import Button from "../components/common/Button";
import CourseCard from "../components/courses/CourseCard";
import CourseForm from "../components/courses/CourseForm";
import TaskForm from "../components/tasks/TaskForm";

function Dashboard() {
  const { user } = useAuth();
  const {
    courses,
    loading: coursesLoading,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useCourses();
  const filters = useMemo(() => ({}), []);
  const { tasks, loading: tasksLoading, createTask } = useTasks(filters);

  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const tasksByCourse = useMemo(() => {
    const map = {};
    for (const task of tasks) {
      if (!task.courseId) continue;
      if (!map[task.courseId]) map[task.courseId] = { total: 0, completed: 0 };
      map[task.courseId].total += 1;
      if (task.status === TASK_STATUS.COMPLETED)
        map[task.courseId].completed += 1;
    }
    for (const key of Object.keys(map)) {
      const { total, completed } = map[key];
      map[key].percent = total ? Math.round((completed / total) * 100) : 0;
    }
    return map;
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === TASK_STATUS.COMPLETED,
  ).length;
  const overdueTasks = tasks.filter(
    (t) => t.status === TASK_STATUS.OVERDUE,
  ).length;
  const overallPercent = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const statCards = [
    { label: "Courses", value: courses.length, icon: "🎓", tint: "from-violet-500 to-fuchsia-500" },
    { label: "Total Tasks", value: totalTasks, icon: "🗂️", tint: "from-sky-500 to-indigo-500" },
    { label: "Completion", value: `${overallPercent}%`, icon: "📈", tint: "from-emerald-500 to-teal-400" },
    { label: "Overdue", value: overdueTasks, icon: "⏰", tint: "from-rose-500 to-pink-500" },
  ];

  const handleDeleteCourse = async (course) => {
    if (
      window.confirm(
        `Delete "${course.title}"? Tasks inside it will remain but lose their course.`,
      )
    ) {
      await deleteCourse(course.$id);
    }
  };

  const firstName = (user?.name || "there").split(" ")[0];
  const loading = coursesLoading || tasksLoading;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Welcome back, <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="text-surface-400 mt-1">
            Here&apos;s what&apos;s happening across your courses.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsTaskFormOpen(true)}
            disabled={courses.length === 0}
            title={
              courses.length === 0 ? "Create a course first" : "Add a new task"
            }
          >
            + New Task
          </Button>
          <Button
            onClick={() => {
              setEditingCourse(null);
              setIsCourseFormOpen(true);
            }}
          >
            + New Course
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="card !p-5 flex items-center gap-4 animate-fade-in-up hover:border-white/20 transition-colors"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.tint} flex items-center justify-center text-xl shadow-glow flex-shrink-0`}
            >
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="font-display text-2xl font-bold text-white leading-none">
                {stat.value}
              </p>
              <p className="text-xs text-surface-400 mt-1 truncate">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          Your Courses
          <span className="badge bg-primary-500/15 text-primary-300 border-primary-400/25">
            {courses.length}
          </span>
        </h2>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="glass rounded-2xl h-56 animate-pulse"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-center py-16 animate-fade-in-up">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">
            No courses yet
          </h3>
          <p className="text-surface-400 mb-6 max-w-md mx-auto">
            Courses group your tasks, track completion percentage and come
            with their own team chat. Create your first one!
          </p>
          <Button
            onClick={() => {
              setEditingCourse(null);
              setIsCourseFormOpen(true);
            }}
          >
            + Create Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, index) => (
            <CourseCard
              key={course.$id}
              course={course}
              stats={tasksByCourse[course.$id]}
              index={index}
              onEdit={(c) => {
                setEditingCourse(c);
                setIsCourseFormOpen(true);
              }}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      )}

      <CourseForm
        isOpen={isCourseFormOpen}
        onClose={() => {
          setIsCourseFormOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={async (data) => {
          if (editingCourse) {
            await updateCourse(editingCourse.$id, data);
          } else {
            await createCourse(data);
          }
        }}
        course={editingCourse}
      />

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={createTask}
      />
    </div>
  );
}

export default Dashboard;
