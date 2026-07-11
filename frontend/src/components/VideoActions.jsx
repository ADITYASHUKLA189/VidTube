import { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { toggleVideoLike } from '../api/likeApi';
import { normalizeApiError } from '../api/normalize';
import PlaylistManager from './PlaylistManager';

export default function VideoActions({ video }) {
  const currentUser = useSelector((state) => state.auth.user);
  
  // Likes toggle states
  const [liked, setLiked] = useState(video?.isLiked || false);
  const [likesCount, setLikesCount] = useState(video?.likesCount || 0);
  const [disliked, setDisliked] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  useEffect(() => {
    setLiked(video?.isLiked || false);
    setLikesCount(video?.likesCount || 0);
  }, [video]);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please log in to like videos');
      return;
    }
    try {
      await toggleVideoLike(video?._id);
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikesCount((prev) => prev + (nextLiked ? 1 : -1));
      if (disliked) setDisliked(false);
      toast.success(nextLiked ? 'Added to Liked videos' : 'Removed from Liked videos');
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  const handleDislike = () => {
    setDisliked((prevdis) => !prevdis);
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
      // Call toggle like to remove it from database if it was liked
      void toggleVideoLike(video?._id).catch(() => {});
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Video link copied to clipboard!');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 select-none">
      
      {/* 1. Joined Like / Dislike Pill */}
      <div className="flex items-center rounded-full bg-neutral-200/50 dark:bg-neutral-800 transition">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-1.5 pl-4 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-l-full hover:bg-neutral-300/50 dark:hover:bg-neutral-700 transition shrink-0 ${
            liked ? 'text-yt-text-light dark:text-white' : 'text-yt-text-light dark:text-yt-text-dark'
          }`}
          title="I like this"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
          </svg>
          <span>{likesCount > 0 ? likesCount : 'Like'}</span>
        </button>
        
        <div className="w-px h-5 bg-neutral-400 dark:bg-neutral-600"></div>
        
        <button
          onClick={handleDislike}
          className={`flex items-center justify-center pl-3 pr-4 py-2 text-xs sm:text-sm font-semibold rounded-r-full hover:bg-neutral-300/50 dark:hover:bg-neutral-700 transition shrink-0 ${
            disliked ? 'text-yt-text-light dark:text-white' : 'text-yt-text-light dark:text-yt-text-dark'
          }`}
          title="I dislike this"
        >
          <svg className="w-5 h-5 flex-shrink-0" style={{ transform: 'scaleY(-1)' }} fill={disliked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
          </svg>
        </button>
      </div>

      {/* 2. Share Button */}
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-1.5 rounded-full bg-neutral-200/50 dark:bg-neutral-800 hover:bg-neutral-300/50 dark:hover:bg-neutral-700 px-4 py-2 text-xs sm:text-sm font-semibold text-yt-text-light dark:text-yt-text-dark transition shrink-0"
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
        Share
      </button>

      {/* 3. Save Button */}
      <button 
        onClick={() => {
          if (!currentUser) return toast.error('Please log in to save videos');
          setShowPlaylistModal(true);
        }}
        className="hidden sm:flex items-center justify-center gap-1.5 rounded-full bg-neutral-200/50 dark:bg-neutral-800 hover:bg-neutral-300/50 dark:hover:bg-neutral-700 px-4 py-2 text-xs sm:text-sm font-semibold text-yt-text-light dark:text-yt-text-dark transition shrink-0"
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        Save
      </button>

      {/* 4. More Options (...) */}
      <button 
        onClick={() => toast('More options coming soon!', { icon: '⚙️' })}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-200/50 dark:bg-neutral-800 hover:bg-neutral-300/50 dark:hover:bg-neutral-700 text-yt-text-light dark:text-yt-text-dark transition shrink-0"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      </button>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-yt-bg-light dark:bg-yt-bg-dark border border-yt-border-light dark:border-yt-border-dark rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-yt-border-light dark:border-yt-border-dark shrink-0">
              <h2 className="text-lg font-bold text-yt-text-light dark:text-white">Save to playlist</h2>
              <button 
                onClick={() => setShowPlaylistModal(false)}
                className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition text-yt-text-light dark:text-yt-text-dark"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <PlaylistManager userId={currentUser?._id} videoId={video?._id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}