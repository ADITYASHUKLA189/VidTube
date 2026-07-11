export default function Textarea({ label, className = '', ...props }) {
  return (
    <label className={`flex flex-col gap-2 text-sm text-sand-100 ${className}`}>
      {label ? <span className="font-medium text-sand-100/80">{label}</span> : null}
      <textarea
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sand-50 outline-none transition placeholder:text-sand-100/40 focus:border-ember-500/60 focus:bg-white/8"
        {...props}
      />
    </label>
  );
}
