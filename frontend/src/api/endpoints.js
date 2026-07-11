export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const endpoints = {
  users: {
    register: '/users/register',
    login: '/users/login',
    googleLogin: '/users/google-login',
    logout: '/users/logout',
    refreshToken: '/users/refresh-token',
    changePassword: '/users/change-password',
    currentUser: '/users/current-user',
    updateAccount: '/users/update-account',
    updateAvatar: '/users/avatar',
    updateCoverImage: '/users/cover-image',
    channelProfile: (username) => `/users/channel/${username}`,
    watchHistory: '/users/history',
  },
  videos: {
    list: '/videos',
    detail: (videoId) => `/videos/${videoId}`,
    publish: '/videos',
    togglePublish: (videoId) => `/videos/toggle/publish/${videoId}`,
  },
  comments: {
    byVideo: (videoId) => `/comments/${videoId}`,
    item: (commentId) => `/comments/c/${commentId}`,
    reply: (commentId) => `/comments/c/${commentId}/reply`,
    replies: (commentId) => `/comments/c/${commentId}/replies`,
  },
  likes: {
    toggleVideo: (videoId) => `/likes/toggle/v/${videoId}`,
    toggleComment: (commentId) => `/likes/toggle/c/${commentId}`,
    toggleTweet: (tweetId) => `/likes/toggle/t/${tweetId}`,
    likedVideos: '/likes/videos',
  },
  playlists: {
    root: '/playlists',
    detail: (playlistId) => `/playlists/${playlistId}`,
    addVideo: (videoId, playlistId) => `/playlists/add/${videoId}/${playlistId}`,
    removeVideo: (videoId, playlistId) => `/playlists/remove/${videoId}/${playlistId}`,
    byUser: (userId) => `/playlists/user/${userId}`,
  },
  subscriptions: {
    channel: (channelId) => `/subscriptions/c/${channelId}`,
    channelSubscribers: (subscriberId) => `/subscriptions/u/${subscriberId}`,
  },
  tweets: {
    root: '/tweets',
    byUser: (userId) => `/tweets/user/${userId}`,
    item: (tweetId) => `/tweets/${tweetId}`,
  },
  dashboard: {
    stats: '/dashboard/stats',
    videos: '/dashboard/videos',
  },
  healthcheck: '/',
};