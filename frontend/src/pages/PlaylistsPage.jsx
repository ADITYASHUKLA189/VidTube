import { useSelector } from 'react-redux';
import PlaylistManager from '../components/PlaylistManager';

export default function PlaylistsPage() {
  const currentUser = useSelector((state) => state.auth.user);

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-white">Playlists</h1>
        <p className="mt-2 text-sm text-sand-100/65">Create, edit, delete, and manage playlist membership using the exact `/playlists` routes.</p>
      </section>

      <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-white">My playlists</h2>
        <p className="mt-2 text-sm text-sand-100/65">
          {currentUser?._id
            ? 'This view uses the authenticated user id against the `/playlists/user/:userId` route.'
            : 'Login to create and manage playlists.'}
        </p>
        <div className="mt-6">
          <PlaylistManager userId={currentUser?._id} />
        </div>
      </div>
    </div>
  );
}