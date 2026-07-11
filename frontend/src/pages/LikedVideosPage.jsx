import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getLikedVideos } from '../api/likeApi';
import { normalizeApiError } from '../api/normalize';
import Spinner from '../components/Spinner';
import VideoCard from '../components/VideoCard';

export default function LikedVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadLikedVideos = async () => {
      setLoading(true);
      try {
        const data = await getLikedVideos();
        // Backend could return list of populated Likes containing video objects: { video: { ... } }
        // or list of videos directly. We handle both.
        const list = Array.isArray(data) ? data : data?.likedVideos || data?.docs || [];
        const resolvedList = list.map((item) => {
          if (item?.video && typeof item.video === 'object') {
            // Populate the owner inside if missing
            return {
              ...item.video,
              // If the like entry has likedBy details, or fallback
              createdAt: item.createdAt || item.video.createdAt,
            };
          }
          return item;
        }).filter(Boolean);

        if (active) {
          setVideos(resolvedList);
        }
      } catch (error) {
        toast.error(normalizeApiError(error).message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadLikedVideos();

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
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-2xl font-bold text-white tracking-tight leading-none">
            Liked Videos
          </h1>
          <p className="text-xs sm:text-sm text-sand-100/60 mt-1">
            Browse all videos you have liked across the platform.
          </p>
        </div>
      </section>

      <div>
        {videos.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-12 text-center text-sand-100/50 text-sm">
            You haven't liked any videos yet. Start exploring and hit like!
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video._id || video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
