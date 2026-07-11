const sizeMap = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

export default function Avatar({ src, alt = '', size = 'md', className = '' }) {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const initials = alt
    ? alt
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return src ? (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white/10 ${className}`}
    />
  ) : (
    <span
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full bg-ink-700 font-semibold text-sand-100 ring-2 ring-white/10 ${className}`}
      aria-label={alt}
    >
      {initials}
    </span>
  );
}
