import { cn } from '../../lib/utils.js';

const variants = {
  primary:  'bg-[var(--black)] text-white hover:bg-[var(--black-hover)]',
  outline:  'bg-white text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-muted)] hover:border-[var(--border-strong)]',
  ghost:    'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text)]',
  danger:   'bg-white text-red-600 border border-red-200 hover:bg-red-50',
};

const sizes = {
  sm:   'h-8 w-30 text-xs gap-1.5 rounded-[var(--radius-sm)] shrink-0',
  md:   'h-9 w-30 text-sm gap-2 rounded-[var(--radius-md)]',
  lg:   'h-10 w-30 text-sm gap-2 rounded-[var(--radius-md)]',
  icon: 'h-8 w-8 rounded-[var(--radius-sm)] p-0',
};

export default function Button({
  children, variant = 'primary', size = 'md',
  className, disabled, loading, type = 'button', onClick, style,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 shadow-sm',
        'cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--black)]',
        variants[variant], sizes[size], className
      )}
    >
      {loading && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  );
}