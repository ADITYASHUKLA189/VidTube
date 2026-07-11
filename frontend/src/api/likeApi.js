import axiosInstance from './axiosInstance';
import { endpoints } from './endpoints';
import { extractApiData } from './normalize';

export const toggleVideoLike = async (videoId) => {
  const response = await axiosInstance.post(endpoints.likes.toggleVideo(videoId));
  return extractApiData(response);
};

export const toggleCommentLike = async (commentId) => {
  const response = await axiosInstance.post(endpoints.likes.toggleComment(commentId));
  return extractApiData(response);
};

export const toggleTweetLike = async (tweetId) => {
  const response = await axiosInstance.post(endpoints.likes.toggleTweet(tweetId));
  return extractApiData(response);
};

export const getLikedVideos = async () => {
  const response = await axiosInstance.get(endpoints.likes.likedVideos);
  return extractApiData(response);
};