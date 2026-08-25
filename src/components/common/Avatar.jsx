import { getInitials, avatarGradient } from "../../utils/helpers";

const sizes = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function Avatar({ name = "", size = "md", className = "" }) {
  return (
    <div
      title={name}
      className={`${sizes[size] || sizes.md} rounded-full bg-gradient-to-br ${avatarGradient(name)} flex items-center justify-center font-bold text-white ring-2 ring-white/10 flex-shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
