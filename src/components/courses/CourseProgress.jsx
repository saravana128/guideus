import { COURSE_GRADIENTS } from "../../utils/constants";

function CourseProgress({
  percent = 0,
  color = "violet",
  variant = "bar",
  size = 110,
  strokeWidth = 10,
  className = "",
}) {
  const palette = COURSE_GRADIENTS[color] || COURSE_GRADIENTS.violet;
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  if (variant === "ring") {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;

    return (
      <div
        className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.hex}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.7s ease",
              filter: `drop-shadow(0 0 6px ${palette.hex}88)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-white text-xl leading-none">
            {clamped}%
          </span>
          <span className="text-[10px] uppercase tracking-widest text-surface-400 mt-1">
            done
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="text-surface-400 font-medium">Progress</span>
        <span className="font-display font-semibold text-white">
          {clamped}%
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${palette.gradient} transition-all duration-700 shadow-glow`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default CourseProgress;
