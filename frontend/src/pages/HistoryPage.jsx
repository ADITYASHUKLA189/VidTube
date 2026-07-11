import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getWatchHistory } from '../api/userApi';
import { normalizeApiError } from '../api/normalize';
import Spinner from '../components/Spinner';
import VideoCard from '../components/VideoCard';

export default function HistoryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await getWatchHistory();
        const list = Array.isArray(data) ? data : data?.watchHistory || [];
        
        if (active) {
          setVideos(list);
        }
      } catch (error) {
        toast.error(normalizeApiError(error).message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ember-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="rounded-full bg-ember-500/10 border border-ember-500/30 p-3 text-ember-500 relative z-10">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-2xl font-bold text-yt-text-light dark:text-white tracking-tight leading-none">
            Watch History
          </h1>
          <p className="text-xs sm:text-sm text-yt-text-secondary-light dark:text-sand-100/60 mt-1">
            Track and watch videos you have recently played on your channel.
          </p>
        </div>
      </section>

      <div>
        {videos.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-12 text-center text-yt-text-secondary-light dark:text-sand-100/50 text-sm">
            Your watch history is currently empty. Start playing videos!
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video, idx) => (
              // Use index in key just in case same video was watched multiple times
              <VideoCard key={video._id ? `${video._id}-${idx}` : idx} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
