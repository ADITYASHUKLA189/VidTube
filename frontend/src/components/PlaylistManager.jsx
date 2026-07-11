import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from './Button';
import Input from './Input';
import Spinner from './Spinner';
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getUserPlaylists, removeVideoFromPlaylist } from '../api/playlistApi';
import { normalizeApiError } from '../api/normalize';

const resolvePlaylists = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.docs || payload?.playlists || payload?.data || [];
};

export default function PlaylistManager({ userId, videoId }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ name: '', description: '' });

  const loadPlaylists = async () => {
    if (!userId) {
      setPlaylists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getUserPlaylists(userId);
      setPlaylists(resolvePlaylists(data));
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlaylists();
  }, [userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      await createPlaylist(formState);
      setFormState({ name: '', description: '' });
      await loadPlaylists();
      toast.success('Playlist created');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleDelete = async (playlistId) => {
    try {
      await deletePlaylist(playlistId);
      await loadPlaylists();
      toast.success('Playlist deleted');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleAddVideo = async (playlistId) => {
    if (!videoId) {
      return;
    }

    try {
      await addVideoToPlaylist(videoId, playlistId);
      toast.success('Added to playlist');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleRemoveVideo = async (playlistId) => {
    if (!videoId) {
      return;
    }

    try {
      await removeVideoFromPlaylist(videoId, playlistId);
      toast.success('Removed from playlist');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  return (
    <div className="space-y-6">
      <form className="grid gap-4 rounded-3xl border border-white/8 bg-white/5 p-4" onSubmit={handleCreate}>
        <Input label="Playlist name" name="name" value={formState.name} onChange={handleChange} required />
        <Input label="Description" name="description" value={formState.description} onChange={handleChange} required />
        <Button type="submit">Create playlist</Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Spinner /></div>
      ) : (
        <div className="space-y-4">
          {playlists.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-sand-100/65">No playlists yet.</div>
          ) : (
            playlists.map((playlist) => (
              <article key={playlist._id} className="rounded-3xl border border-white/8 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link to={`/playlist/${playlist._id}`} className="hover:text-ember-500 transition">
                      <h3 className="font-display text-xl font-semibold text-white">{playlist.name}</h3>
                    </Link>
                    <p className="mt-1 text-sm text-sand-100/70">{playlist.description}</p>
                    <p className="mt-2 text-xs text-sand-100/55">{playlist.videos?.length || 0} videos</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {videoId ? (
                      <>
                        <Button variant="secondary" onClick={() => handleAddVideo(playlist._id)}>Add video</Button>
                        <Button variant="secondary" onClick={() => handleRemoveVideo(playlist._id)}>Remove video</Button>
                      </>
                    ) : null}
                    <Button variant="ghost" onClick={() => handleDelete(playlist._id)}>Delete</Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}