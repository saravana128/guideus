import { Link } from "react-router-dom";
import CourseProgress from "./CourseProgress";
import { COURSE_GRADIENTS } from "../../utils/constants";

function CourseCard({ course, stats, index = 0, onEdit, onDelete }) {
  const palette = COURSE_GRADIENTS[course.color] || COURSE_GRADIENTS.violet;
  const { total = 0, completed = 0, percent = 0 } = stats || {};

  return (
    <Link
      to={`/courses/${course.$id}`}
      className="group card relative overflow-hidden hover:border-white/20 hover:-translate-y-1 hover:shadow-glow-lg transition-all duration-300 animate-fade-in-up flex flex-col"
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${palette.gradient}`}
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${palette.gradient} flex items-center justify-center text-xl font-display font-bold text-white shadow-glow group-hover:scale-105 transition-transform`}
        >
          {course.title?.charAt(0)?.toUpperCase() || "📚"}
        </div>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit(course);
            }}
            className="icon-btn"
            title="Edit course"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(course);
            }}
            className="p-2 rounded-lg text-surface-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            title="Delete course"
          >
            🗑️
          </button>
        </div>
      </div>

      <h3 className="font-display text-lg font-semibold text-white group-hover:text-primary-200 transition-colors line-clamp-1">
        {course.title}
      </h3>
      <p className="mt-1 text-sm text-surface-400 line-clamp-2 min-h-[2.5rem]">
        {course.description || "No description yet."}
      </p>

      <CourseProgress
        percent={percent}
        color={course.color}
        className="mt-4"
      />

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-surface-400">
        <span>
          <span className="text-emerald-300 font-semibold">{completed}</span>
          {" / "}
          {total} task{total !== 1 ? "s" : ""} done
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-primary-300 group-hover:gap-2 transition-all">
          Open →
        </span>
      </div>
    </Link>
  );
}

export default CourseCard;
