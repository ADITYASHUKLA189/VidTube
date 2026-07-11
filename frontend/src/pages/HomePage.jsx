import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getVideos } from '../api/videoApi';
import VideoCard from '../components/VideoCard';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Gaming',
  'Music',
  'Live',
  'Comedy',
  'Technology',
  'Sports',
  'Cooking',
  'News',
  'DIY',
  'Education',
  'Movies',
  'Podcasts',
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const scrollRef = useRef(null);

  const page = Number(searchParams.get('page') || '1');
  const limit = 12;

  useEffect(() => {
    let active = true;

    const loadVideos = async () => {
      setLoading(true);
      try {
        // Query param search filtering by category if not 'All'
        const queryParams = {
          page,
          limit,
          sortBy: 'createdAt',
          sortType: 'desc',
        };
        if (selectedCategory !== 'All') {
          queryParams.query = selectedCategory;
        }

        const data = await getVideos(queryParams);
        const list = Array.isArray(data?.docs) ? data.docs : Array.isArray(data) ? data : data?.videos ?? [];

        if (!active) return;
        setVideos(list);
        setMeta({
          page: data?.page ?? page,
          limit: data?.limit ?? limit,
          totalPages: data?.totalPages ?? data?.pagination?.totalPages ?? 1,
        });
      } catch (err) {
        if (active) {
          toast.error(err?.response?.data?.message || err.message || 'Failed to load feed videos');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadVideos();

    return () => {
      active = false;
    };
  }, [page, selectedCategory]);

  const goToPage = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nextPage));
    setSearchParams(params);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Horizontal scrollable filter chips bar */}
      <div className="relative group/chips flex items-center select-none -mx-4 px-4 py-2 sticky top-14 bg-yt-bg-light dark:bg-yt-bg-dark z-20">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-2 z-10 bg-yt-bg-light dark:bg-yt-bg-dark hover:bg-neutral-200 dark:hover:bg-neutral-800 p-2 rounded-full shadow-md text-yt-text-light dark:text-yt-text-dark transition"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div 
          ref={scrollRef}
          className="flex-1 flex gap-3 overflow-x-auto scrollbar-none py-1.5 px-8 scroll-smooth"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                const params = new URLSearchParams(searchParams);
                params.set('page', '1');
                setSearchParams(params);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-yt-text-light dark:bg-yt-text-dark text-yt-bg-light dark:text-yt-bg-dark'
                  : 'bg-yt-bg-hover-light dark:bg-yt-bg-hover-dark text-yt-text-light dark:text-yt-text-dark hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-2 z-10 bg-yt-bg-light dark:bg-yt-bg-dark hover:bg-neutral-200 dark:hover:bg-neutral-800 p-2 rounded-full shadow-md text-yt-text-light dark:text-yt-text-dark transition"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 2. Responsive Grid */}
      {loading ? (
        <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <VideoCard key={i} loading={true} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <svg className="h-16 w-16 text-yt-text-secondary-light dark:text-yt-text-secondary-dark" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
          <h3 className="font-bold text-lg">No videos found</h3>
          <p className="text-sm text-yt-text-secondary-light dark:text-yt-text-secondary-dark max-w-md">
            There are no videos uploaded under the category "{selectedCategory}". Upload one to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video._id || video.id} video={video} />
            ))}
          </div>

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-yt-border-light dark:border-yt-border-dark pt-6 text-sm text-yt-text-secondary-light dark:text-yt-text-secondary-dark">
              <span>
                Page {meta.page} of {meta.totalPages}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => goToPage(Math.max(1, meta.page - 1))}
                  disabled={meta.page <= 1}
                  className="rounded-full border border-yt-border-light dark:border-yt-border-dark px-4 py-2 font-semibold hover:bg-yt-bg-hover-light dark:hover:bg-yt-bg-hover-dark disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="rounded-full border border-yt-border-light dark:border-yt-border-dark px-4 py-2 font-semibold hover:bg-yt-bg-hover-light dark:hover:bg-yt-bg-hover-dark disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}