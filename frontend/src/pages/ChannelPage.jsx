import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { getUserChannelProfile, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../api/userApi';
import { getChannelStats } from '../api/dashboardApi';
import { getVideos, deleteVideo } from '../api/videoApi';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Input from '../components/Input';
import Avatar from '../components/Avatar';
import VideoCard from '../components/VideoCard';
import TweetSection from '../components/TweetSection';
import SubscribeButton from '../components/SubscribeButton';
import { bootstrapAuth } from '../features/auth/authSlice';
import { normalizeApiError } from '../api/normalize';

export default function ChannelPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  
  const [channel, setChannel] = useState(null);
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'tweets' | 'about' | 'edit' | 'stats'
  
  // Profile edit forms
  const [profileForm, setProfileForm] = useState({ fullname: '', email: '', avatar: null, coverImage: null });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOwnChannel = useMemo(() => {
    return Boolean(
      currentUser?.username && 
      username && 
      currentUser.username.toLowerCase() === username.toLowerCase()
    );
  }, [currentUser?.username, username]);

  const loadChannelData = async () => {
    setLoading(true);
    try {
      const profile = await getUserChannelProfile(username);
      setChannel(profile);

      // Initialize edit form details
      setProfileForm({
        fullname: profile?.fullname || '',
        email: profile?.email || '',
        avatar: null,
        coverImage: null,
      });
      setAvatarPreview(profile?.avatar || null);
      setCoverPreview(profile?.coverImage || null);

      // Load channel videos
      if (profile?._id) {
        setVideosLoading(true);
        const vData = await getVideos({ userId: profile._id });
        const list = Array.isArray(vData?.docs) ? vData.docs : vData?.videos || [];
        setVideos(list);
        setVideosLoading(false);
      }

      // Fetch dashboard stats if own channel
      if (isOwnChannel) {
        try {
          const channelStats = await getChannelStats();
          setStats(channelStats);
        } catch (e) {
          console.error('Failed to load dashboard stats:', e);
        }
      }
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await deleteVideo(videoId);
      toast.success('Video deleted successfully');
      setVideos((prev) => prev.filter((v) => (v._id || v.id) !== videoId));
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  useEffect(() => {
    void loadChannelData();
  }, [username, isOwnChannel]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    setProfileForm((prev) => ({ ...prev, [name]: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'avatar') setAvatarPreview(reader.result);
        if (name === 'coverImage') setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (profileForm.fullname !== channel.fullname || profileForm.email !== channel.email) {
        await updateAccountDetails({ fullname: profileForm.fullname, email: profileForm.email });
      }

      if (profileForm.avatar) {
        await updateUserAvatar(profileForm.avatar);
      }

      if (profileForm.coverImage) {
        await updateUserCoverImage(profileForm.coverImage);
      }

      await dispatch(bootstrapAuth()).unwrap();
      toast.success('Profile updated successfully');
      await loadChannelData();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-500 max-w-lg mx-auto mt-10">
        Channel profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-12 select-none">
      
      {/* 1. Full-width Banner Cover Image */}
      <section className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-yt-border-light dark:border-yt-border-dark">
        <div className="h-32 sm:h-48 md:h-60 w-full relative">
          {channel.coverImage ? (
            <img 
              src={channel.coverImage} 
              alt="Channel Cover" 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-red-500/20 via-neutral-200/10 dark:via-neutral-800/10 to-transparent" />
          )}
        </div>

        {/* 2. Overlapping profile metadata header layout */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 -mt-10 sm:-mt-14 relative z-10 text-center sm:text-left">
          <div className="relative shrink-0">
            <Avatar 
              src={channel.avatar} 
              alt={channel.fullname || channel.username} 
              size="xl" 
              className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-yt-bg-light dark:border-yt-bg-dark shadow-md"
            />
          </div>
          
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-yt-text-light dark:text-yt-text-dark leading-none">
              {channel.fullname || channel.username}
            </h1>
            <p className="text-xs sm:text-sm text-yt-text-secondary-light dark:text-yt-text-secondary-dark font-semibold mt-1">
              @{channel.username} • {channel.subscribersCount ?? 0} subscribers • {videos.length} videos
            </p>
          </div>

          <div className="shrink-0 pb-1">
            {isOwnChannel ? (
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => navigate('/upload')} 
                  className="rounded-full bg-yt-red hover:bg-yt-red/90 text-white px-5 py-2 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Upload Video
                </Button>
                <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 border border-yt-border-light dark:border-yt-border-dark px-5 py-2 text-xs font-bold text-yt-text-light dark:text-yt-text-dark">
                  Your Channel
                </span>
              </div>
            ) : (
              <SubscribeButton 
                channelId={channel._id} 
                initialSubscribed={channel.isSubscribed}
                onToggle={(nextState) => {
                  setChannel(prev => ({
                    ...prev,
                    subscribersCount: (prev.subscribersCount ?? 0) + (nextState ? 1 : -1)
                  }));
                }}
                className="rounded-full px-6 py-2 text-xs font-bold"
              />
            )}
          </div>
        </div>
      </section>

      {/* 3. Horizontal Active underlines Tab Bar */}
      <div className="flex items-center border-b border-yt-border-light dark:border-yt-border-dark overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'videos' ? 'border-yt-text-light dark:border-yt-text-dark text-yt-text-light dark:text-yt-text-dark' : 'border-transparent text-yt-text-secondary-light dark:text-yt-text-secondary-dark hover:text-yt-text-light dark:hover:text-yt-text-dark'
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab('tweets')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'tweets' ? 'border-yt-text-light dark:border-yt-text-dark text-yt-text-light dark:text-yt-text-dark' : 'border-transparent text-yt-text-secondary-light dark:text-yt-text-secondary-dark hover:text-yt-text-light dark:hover:text-yt-text-dark'
          }`}
        >
          Community
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'about' ? 'border-yt-text-light dark:border-yt-text-dark text-yt-text-light dark:text-yt-text-dark' : 'border-transparent text-yt-text-secondary-light dark:text-yt-text-secondary-dark hover:text-yt-text-light dark:hover:text-yt-text-dark'
          }`}
        >
          About
        </button>
        {isOwnChannel && (
          <>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === 'edit' ? 'border-yt-text-light dark:border-yt-text-dark text-yt-text-light dark:text-yt-text-dark' : 'border-transparent text-yt-text-secondary-light dark:text-yt-text-secondary-dark hover:text-yt-text-light dark:hover:text-yt-text-dark'
              }`}
            >
              Customize
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === 'stats' ? 'border-yt-text-light dark:border-yt-text-dark text-yt-text-light dark:text-yt-text-dark' : 'border-transparent text-yt-text-secondary-light dark:text-yt-text-secondary-dark hover:text-yt-text-light dark:hover:text-yt-text-dark'
              }`}
            >
              Dashboard
            </button>
          </>
        )}
      </div>

      {/* Tab content rendering */}
      <div className="pt-2">
        {activeTab === 'videos' && (
          <div>
            {videosLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : videos.length === 0 ? (
              <div className="rounded-xl border border-yt-border-light dark:border-yt-border-dark p-12 text-center text-yt-text-secondary-light dark:text-yt-text-secondary-dark text-xs font-bold">
                No videos uploaded yet.
              </div>
            ) : (
              <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {videos.map((v) => (
                  <div key={v._id || v.id} className="relative group/vidcard">
                    <VideoCard video={{ ...v, owner: channel }} />
                    {isOwnChannel && (
                      <button
                        onClick={() => handleDeleteVideo(v._id || v.id)}
                        className="absolute top-2 right-2 z-10 rounded-full bg-red-600/90 p-2 text-white opacity-0 group-hover/vidcard:opacity-100 hover:bg-red-700 hover:scale-105 transition shadow-lg duration-150"
                        title="Delete Video"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tweets' && (
          <div className="max-w-3xl">
            <TweetSection userId={channel._id} isOwnChannel={isOwnChannel} />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="rounded-xl border border-yt-border-light dark:border-yt-border-dark bg-yt-bg-light dark:bg-yt-bg-dark p-6 space-y-6 max-w-2xl">
            <h2 className="text-base font-bold text-yt-text-light dark:text-yt-text-dark">Description</h2>
            <div className="space-y-4 text-xs sm:text-sm text-yt-text-light/85 dark:text-yt-text-dark/85">
              <div className="flex items-center gap-4">
                <span className="w-24 text-yt-text-secondary-light dark:text-yt-text-secondary-dark">Full name:</span>
                <span className="font-bold">{channel.fullname}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-24 text-yt-text-secondary-light dark:text-yt-text-secondary-dark">Username:</span>
                <span className="font-bold">@{channel.username}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-24 text-yt-text-secondary-light dark:text-yt-text-secondary-dark">Email:</span>
                <span className="font-bold">{channel.email}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-24 text-yt-text-secondary-light dark:text-yt-text-secondary-dark">Subscribers:</span>
                <span className="font-bold">{channel.subscribersCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-24 text-yt-text-secondary-light dark:text-yt-text-secondary-dark">Subscribed:</span>
                <span className="font-bold">{channel.subscribedToCount ?? 0} channels</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit' && isOwnChannel && (
          <form onSubmit={handleSaveProfile} className="rounded-xl border border-yt-border-light dark:border-yt-border-dark bg-yt-bg-light dark:bg-yt-bg-dark p-6 space-y-6 max-w-2xl">
            <h2 className="text-base font-bold text-yt-text-light dark:text-yt-text-dark">Customize Channel</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Input 
                label="Full name" 
                name="fullname" 
                value={profileForm.fullname} 
                onChange={handleTextChange} 
                required 
                disabled={saving}
              />
              <Input 
                label="Email" 
                type="email" 
                name="email" 
                value={profileForm.email} 
                onChange={handleTextChange} 
                required 
                disabled={saving}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 border-t border-yt-border-light dark:border-yt-border-dark pt-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-yt-text-secondary-light dark:text-yt-text-secondary-dark block">Avatar Image</span>
                <div className="flex items-center gap-3">
                  <Avatar src={avatarPreview} size="lg" />
                  <label className="text-xs text-blue-500 font-bold cursor-pointer border border-blue-500/30 hover:border-blue-500 px-3 py-2 rounded-xl bg-blue-500/5 transition">
                    Upload Avatar
                    <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-yt-text-secondary-light dark:text-yt-text-secondary-dark block">Cover Banner Image</span>
                <div className="flex items-center gap-3">
                  {coverPreview ? (
                    <img src={coverPreview} alt="cover preview" className="h-10 w-20 object-cover rounded-md border border-yt-border-light dark:border-yt-border-dark" />
                  ) : (
                    <div className="h-10 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-md border border-yt-border-light dark:border-yt-border-dark" />
                  )}
                  <label className="text-xs text-blue-500 font-bold cursor-pointer border border-blue-500/30 hover:border-blue-500 px-3 py-2 rounded-xl bg-blue-500/5 transition">
                    Upload Cover
                    <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full py-2.5">
              {saving ? <Spinner className="h-4 w-4" /> : 'Save Changes'}
            </Button>
          </form>
        )}

        {activeTab === 'stats' && isOwnChannel && (
          <div className="rounded-xl border border-yt-border-light dark:border-yt-border-dark bg-yt-bg-light dark:bg-yt-bg-dark p-6 space-y-6">
            <h2 className="text-base font-bold text-yt-text-light dark:text-yt-text-dark">Analytics Dashboard</h2>
            {stats ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="rounded-xl border border-yt-border-light dark:border-yt-border-dark bg-neutral-50 dark:bg-neutral-800 p-5">
                  <span className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark block uppercase font-bold">Total Views</span>
                  <span className="text-2xl font-black text-yt-text-light dark:text-yt-text-dark mt-1 block">{stats.totalViews ?? 0}</span>
                </div>
                <div className="rounded-xl border border-yt-border-light dark:border-yt-border-dark bg-neutral-50 dark:bg-neutral-800 p-5">
                  <span className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark block uppercase font-bold">Total Subscribers</span>
                  <span className="text-2xl font-black text-yt-text-light dark:text-yt-text-dark mt-1 block">{stats.totalSubscribers ?? 0}</span>
                </div>
                <div className="rounded-xl border border-yt-border-light dark:border-yt-border-dark bg-neutral-50 dark:bg-neutral-800 p-5">
                  <span className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark block uppercase font-bold">Total Videos</span>
                  <span className="text-2xl font-black text-yt-text-light dark:text-yt-text-dark mt-1 block">{stats.totalVideos ?? 0}</span>
                </div>
                <div className="rounded-xl border border-yt-border-light dark:border-yt-border-dark bg-neutral-50 dark:bg-neutral-800 p-5">
                  <span className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark block uppercase font-bold">Total Likes</span>
                  <span className="text-2xl font-black text-yt-text-light dark:text-yt-text-dark mt-1 block">{stats.totalLikes ?? 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-yt-text-secondary-light dark:text-yt-text-secondary-dark">Dashboard stats payload unavailable.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}