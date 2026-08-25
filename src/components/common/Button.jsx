const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-ghost",
  outline: "btn-secondary",
};

const sizes = {
  sm: "!px-3 !py-1.5 text-xs",
  md: "",
  lg: "!px-6 !py-3 text-base",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  className = "",
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${variants[variant] || variants.primary} ${sizes[size] || ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
