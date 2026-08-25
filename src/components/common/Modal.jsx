function Modal({ isOpen, onClose, title, children, footer, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        ></div>
        <div
          className={`relative w-full ${maxWidth} rounded-2xl border border-white/10 bg-surface-900/90 backdrop-blur-2xl shadow-glow-lg animate-fade-in-up overflow-hidden`}
        >
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-display font-semibold text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="icon-btn"
              aria-label="Close dialog"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
          {footer && (
            <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
