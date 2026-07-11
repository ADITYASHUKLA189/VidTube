import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getVideoById, getVideos } from '../api/videoApi';
import Spinner from '../components/Spinner';
import Avatar from '../components/Avatar';
import VideoActions from '../components/VideoActions';
import CommentSection from '../components/CommentSection';
import VideoCard from '../components/VideoCard';
import SubscribeButton from '../components/SubscribeButton';
import VideoPlayer from '../components/VideoPlayer';

export default function WatchPage() {
  const { videoId } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const videoRef = useRef(null);
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);



  useEffect(() => {
    let active = true;

    const loadVideo = async () => {
      setLoading(true);
      try {
        const data = await getVideoById(videoId);
        if (!active) return;
        const resolvedVideo = data?.docs ? data.docs[0] : data?.video || data;
        setVideo(resolvedVideo);

        // Fetch related videos (limit 8)
        if (resolvedVideo) {
          setRelatedLoading(true);
          const videosData = await getVideos({ page: 1, limit: 9 });
          if (!active) return;
          const list = Array.isArray(videosData?.docs) ? videosData.docs : videosData?.videos || [];
          setRelatedVideos(list.filter((v) => (v._id || v.id) !== videoId));
          setRelatedLoading(false);
        }
      } catch (err) {
        console.error('Failed to load watch video data:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadVideo();

    return () => {
      active = false;
    };
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-yt-bg-light dark:bg-yt-bg-dark">
        <Spinner />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-500 max-w-lg mx-auto mt-10">
        Video not found or has been deleted.
      </div>
    );
  }

  const owner = video.owner || {};
  const ownerUsername = owner.username || '';
  const ownerFullname = owner.fullname || '';
  const ownerAvatar = owner.avatar || '';

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)] max-w-[1720px] mx-auto pb-12">
      {/* 1. Left Column: Player, Video Details, Comments */}
      <div className="space-y-4">
        {/* Player Container */}
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black border border-yt-border-light dark:border-yt-border-dark shadow-lg">
          <VideoPlayer
            src={typeof video.videoFile === 'string' && video.videoFile.includes('commondatastorage.googleapis.com') 
              ? 'https://www.w3schools.com/html/mov_bbb.mp4' 
              : (typeof video.videoFile === 'string' ? video.videoFile : '')}
            poster={video.thumbnail}
            autoplay={true}
          />
        </div>

        {/* Video details row */}
        <div className="space-y-3">
          <h1 className="text-xl md:text-2xl font-bold text-yt-text-light dark:text-white leading-tight line-clamp-2">
            {video.title}
          </h1>

          {/* Channels & Action bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full">
              <Link to={`/channel/${ownerUsername}`} className="shrink-0">
                <Avatar src={ownerAvatar} alt={ownerFullname || ownerUsername} size="md" />
              </Link>
              
              <div className="flex flex-col mr-1 md:mr-2">
                <Link to={`/channel/${ownerUsername}`} className="flex items-center gap-1 text-base font-bold text-yt-text-light dark:text-white hover:text-blue-500 transition truncate">
                  {ownerFullname || ownerUsername}
                  <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM9.8 17.3l-4.2-4.1L7 11.8l2.8 2.7L17 7.4l1.4 1.4-8.6 8.5z"/>
                  </svg>
                </Link>
                <span className="text-xs text-yt-text-secondary-light dark:text-neutral-400 truncate block">
                  {owner.subscribersCount ?? 0} subscribers
                </span>
              </div>
              
              {/* Subscribe button */}
              <div>
                {owner?._id && (
                  <SubscribeButton 
                    channelId={owner._id}
                    initialSubscribed={owner?.isSubscribed || false}
                  />
                )}
              </div>

              {/* Action Buttons (Like, Share, etc.) aligned to the right on desktop */}
              <div className="flex items-center gap-2 select-none md:ml-auto mt-2 md:mt-0 w-full md:w-auto overflow-x-auto pb-1 md:pb-0" style={{ scrollbarWidth: 'none' }}>
                <VideoActions video={video} />
              </div>
            </div>
          </div>

          {/* Expandable Description Container */}
          <div 
            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            className="rounded-xl bg-neutral-200/50 dark:bg-neutral-800 hover:bg-neutral-300/50 dark:hover:bg-neutral-700 transition p-3 mt-4 text-sm cursor-pointer select-none"
          >
            <div className="flex flex-wrap items-center gap-2 font-bold text-yt-text-light dark:text-white mb-1">
              <span>{video.views ?? 0} views</span>
              <span>
                {video.createdAt ? new Date(video.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) : 'Just now'}
              </span>
              {Array.isArray(video?.tags) && video.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 ml-1">
                  {video.tags.map((tag, idx) => (
                    <span key={idx} className="text-blue-600 dark:text-blue-400 font-normal hover:underline">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <p className={`text-yt-text-light dark:text-white whitespace-pre-wrap leading-relaxed ${descriptionExpanded ? '' : 'line-clamp-2'}`}>
              {video.description || 'No description provided.'}
            </p>
            
            {!descriptionExpanded && (
              <div className="font-bold text-yt-text-light dark:text-white mt-1">...more</div>
            )}
            {descriptionExpanded && (
              <div className="font-bold text-yt-text-light dark:text-white mt-4">Show less</div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="pt-4">
          <CommentSection videoId={videoId} />
        </div>
      </div>

      {/* 2. Right Column: Recommended Videos */}
      <aside className="space-y-6">

        {/* Side related list */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-yt-text-light dark:text-yt-text-dark uppercase tracking-wider">
            Up Next
          </h2>
          {relatedLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : relatedVideos.length === 0 ? (
            <p className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark">No other videos found.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {relatedVideos.map((item) => (
                <div key={item._id || item.id} className="border-b border-yt-border-light dark:border-yt-border-dark pb-4 last:border-b-0 last:pb-0">
                  <VideoCard video={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}