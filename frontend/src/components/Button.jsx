export default function Button({ children, className = '', variant = 'primary', type = 'button', ...props }) {
  const variants = {
    primary: 'bg-ember-500 text-white hover:bg-ember-600 shadow-soft',
    secondary: 'bg-black/5 dark:bg-white/8 text-yt-text-light dark:text-sand-50 hover:bg-black/10 dark:hover:bg-white/12 border border-black/10 dark:border-white/10',
    ghost: 'bg-transparent text-yt-text-light dark:text-sand-50 hover:bg-black/5 dark:hover:bg-white/8',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}