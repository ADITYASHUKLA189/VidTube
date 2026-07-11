import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPlaylistById, updatePlaylist, removeVideoFromPlaylist } from '../api/playlistApi';
import { normalizeApiError } from '../api/normalize';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import VideoCard from '../components/VideoCard';

export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const data = await getPlaylistById(playlistId);
      setPlaylist(data);
      setEditForm({
        name: data?.name || '',
        description: data?.description || '',
      });
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlaylist();
  }, [playlistId]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.description.trim()) return;

    setSavingEdit(true);
    try {
      await updatePlaylist(playlistId, editForm);
      toast.success('Playlist updated successfully!');
      setEditOpen(false);
      await fetchPlaylist();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist(videoId, playlistId);
      toast.success('Video removed from playlist');
      // Local filter to update UI quickly
      if (playlist) {
        setPlaylist({
          ...playlist,
          videos: playlist.videos.filter((v) => (v._id || v.id) !== videoId),
        });
      }
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center text-red-400">
        Playlist not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="space-y-2">
          <Link to="/playlists" className="text-xs text-ember-500 font-semibold flex items-center gap-1 hover:underline">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Playlists
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none mt-1">
            {playlist.name}
          </h1>
          <p className="text-sm text-sand-100/70">{playlist.description}</p>
          <span className="inline-block text-xs font-semibold text-sand-100/40">
            {playlist.videos?.length || 0} videos
          </span>
        </div>

        <Button variant="secondary" onClick={() => setEditOpen(true)} className="shrink-0">
          Edit Details
        </Button>
      </div>

      {/* Videos List */}
      <div>
        {playlist.videos?.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-12 text-center text-sand-100/50 text-sm">
            This playlist has no videos. Search or browse and add videos!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {playlist.videos?.map((video) => {
              if (!video) return null;
              const videoId = video._id || video.id;
              return (
                <div key={videoId} className="relative group">
                  <VideoCard video={video} />
                  <button
                    onClick={() => handleRemoveVideo(videoId)}
                    className="absolute top-2 right-2 bg-red-600/90 text-white rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition shadow-lg text-xs font-semibold flex items-center gap-1 hover:bg-red-700"
                    title="Remove from playlist"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Playlist Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Playlist Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
            disabled={savingEdit}
          />
          <Input
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            required
            disabled={savingEdit}
          />
          <div className="flex gap-2 justify-end border-t border-white/5 pt-4">
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button type="submit" disabled={savingEdit}>
              {savingEdit ? <Spinner className="h-4 w-4" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
