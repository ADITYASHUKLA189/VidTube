import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 rounded-[2rem] border border-white/8 bg-white/5 p-8">
      <h1 className="font-display text-4xl font-bold text-white">Page not found</h1>
      <p className="text-sand-100/70">The route you requested does not exist in this frontend scaffold.</p>
      <Link to="/" className="rounded-xl bg-ember-500 px-4 py-2 text-sm font-semibold text-white">
        Back home
      </Link>
    </div>
  );
}