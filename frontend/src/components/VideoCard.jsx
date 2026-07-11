import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

function formatDuration(duration) {
  if (!duration) return '0:00';
  const mins = Math.floor(duration / 60);
  const secs = Math.floor(duration % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatViews(views) {
  if (views === undefined || views === null) return '0 views';
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1).replace(/\.0$/, '')}M views`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1).replace(/\.0$/, '')}K views`;
  }
  return `${views} views`;
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}

export default function VideoCard({ video, loading = false }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {/* Shimmer thumbnail */}
        <div className="aspect-video w-full rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="flex gap-3 px-1">
          <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) return null;

  const videoId = video._id || video.id;
  const owner = video.owner || {};
  const ownerUsername = owner.username || '';
  const ownerAvatar = owner.avatar || '';
  const ownerFullname = owner.fullname || '';

  return (
    <div className="group flex flex-col gap-3 relative select-none">
      {/* 1. Thumbnail container */}
      <Link to={`/watch/${videoId}`} className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/10 dark:border-neutral-800/20">
        <img
          src={video.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80'}
          alt={video.title}
          className="h-full w-full object-cover transition duration-200 group-hover:rounded-none"
          loading="lazy"
        />
        {video.duration ? (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white tracking-wide">
            {formatDuration(video.duration)}
          </span>
        ) : null}
      </Link>

      {/* 2. Metadata details row */}
      <div className="flex gap-3 px-1 relative">
        {ownerUsername && (
          <Link to={`/channel/${ownerUsername}`} className="shrink-0 mt-0.5">
            <Avatar src={ownerAvatar} alt={ownerFullname || ownerUsername} size="sm" />
          </Link>
        )}
        
        <div className="flex-1 min-w-0 pr-6">
          <Link to={`/watch/${videoId}`}>
            <h3 className="line-clamp-2 text-sm font-bold text-yt-text-light dark:text-yt-text-dark leading-snug hover:text-blue-500 transition">
              {video.title}
            </h3>
          </Link>
          
          <div className="mt-1 flex flex-col text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark">
            {ownerUsername && (
              <Link to={`/channel/${ownerUsername}`} className="hover:text-yt-text-light dark:hover:text-yt-text-dark transition">
                {ownerFullname || ownerUsername}
              </Link>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <span>{formatViews(video.views)}</span>
              <span>•</span>
              <span>{formatRelativeTime(video.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* 3. Action dots menu on hover */}
        <div className="absolute right-0 top-0.5">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            className="opacity-0 group-hover:opacity-100 rounded-full p-1.5 hover:bg-yt-bg-hover-light dark:hover:bg-yt-bg-hover-dark text-yt-text-light dark:text-yt-text-dark transition focus:opacity-100"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
          
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 z-50 w-44 rounded-xl border border-yt-border-light dark:border-yt-border-dark bg-yt-bg-light dark:bg-yt-dark py-1.5 shadow-xl text-xs animate-fade-in">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    navigate(`/watch/${videoId}`);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-yt-bg-hover-light dark:hover:bg-yt-bg-hover-dark transition"
                >
                  Save to Playlist
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-yt-bg-hover-light dark:hover:bg-yt-bg-hover-dark transition text-red-500"
                >
                  Not Interested
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
