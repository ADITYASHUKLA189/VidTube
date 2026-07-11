export default function Spinner({ className = '' }) {
  return <div className={`h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-ember-500 ${className}`} />;
}