function Input({ label, error, className = "", ...props }) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`input ${error ? "!border-rose-500/60 focus:!border-rose-500 focus:!ring-rose-500/60" : ""}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-rose-400">{error}</p>}
    </div>
  );
}

export default Input;
