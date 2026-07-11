import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getVideos } from '../api/videoApi';
import Spinner from '../components/Spinner';
import VideoCard from '../components/VideoCard';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('query') || '';
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 12, totalPages: 1 });
  
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortType, setSortType] = useState('desc');
  
  const [page, setPage] = useState(1);
  const observerTarget = useRef(null);
  
  // Reset page when search params change
  useEffect(() => {
    setPage(1);
    setVideos([]);
  }, [searchQuery, sortBy, sortType]);

  useEffect(() => {
    let active = true;

    const performSearch = async () => {
      if (!searchQuery.trim()) {
        return;
      }

      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const data = await getVideos({ query: searchQuery, page, limit: 12, sortBy, sortType });
        const list = Array.isArray(data?.docs) ? data.docs : data?.videos || [];

        if (!active) return;
        
        setVideos(prev => page === 1 ? list : [...prev, ...list]);
        setMeta({
          page: data?.page ?? page,
          limit: data?.limit ?? 12,
          totalPages: data?.totalPages ?? data?.pagination?.totalPages ?? 1,
        });
      } catch (err) {
        toast.error('Search failed: ' + (err.message || 'Request failed'));
      } finally {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    void performSearch();

    return () => {
      active = false;
    };
  }, [searchQuery, page, sortBy, sortType]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && meta.page < meta.totalPages) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loading, loadingMore, meta.page, meta.totalPages]);

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'latest') {
      setSortBy('createdAt');
      setSortType('desc');
    } else if (val === 'oldest') {
      setSortBy('createdAt');
      setSortType('asc');
    } else if (val === 'views') {
      setSortBy('views');
      setSortType('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter and control bar */}
      {searchQuery && (
        <div className="flex items-center justify-between gap-4 glass-panel rounded-2xl px-4 py-3">
          <span className="text-xs text-sand-100/60 font-medium">
            Search results for "{searchQuery}"
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-sand-100/50">Sort:</span>
            <select
              onChange={handleSortChange}
              className="bg-ink-800 text-xs text-white border border-white/10 rounded-xl px-2.5 py-1.5 focus:border-ember-500 outline-none cursor-pointer"
            >
              <option value="latest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="views">Most Popular</option>
            </select>
          </div>
        </div>
      )}

      {/* Results grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <VideoCard key={i} loading={true} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        searchQuery ? (
          <div className="glass-panel rounded-[2rem] p-12 text-center text-sand-100/50 text-sm">
            No videos matching your search query were found. Try other keywords!
          </div>
        ) : (
          <div className="glass-panel rounded-[2rem] p-12 text-center text-sand-100/50 text-sm">
            Enter a search term above to start exploring.
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video._id || video.id} video={video} />
            ))}
          </div>

          {/* Loading More Spinner & Observer Target */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}
          <div ref={observerTarget} className="h-10" />
        </div>
      )}
    </div>
  );
}