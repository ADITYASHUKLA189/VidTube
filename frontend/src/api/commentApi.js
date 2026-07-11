import axiosInstance from './axiosInstance';
import { endpoints } from './endpoints';
import { extractApiData } from './normalize';

export const getVideoComments = async (videoId) => {
  const response = await axiosInstance.get(endpoints.comments.byVideo(videoId));
  return extractApiData(response);
};

export const addComment = async (videoId, payload) => {
  const response = await axiosInstance.post(endpoints.comments.byVideo(videoId), payload);
  return extractApiData(response);
};

export const updateComment = async (commentId, payload) => {
  const response = await axiosInstance.patch(endpoints.comments.item(commentId), payload);
  return extractApiData(response);
};

export const deleteComment = async (commentId) => {
  const response = await axiosInstance.delete(endpoints.comments.item(commentId));
  return extractApiData(response);
};

export const getCommentReplies = async (commentId) => {
  const response = await axiosInstance.get(endpoints.comments.replies(commentId));
  return extractApiData(response);
};

export const addReply = async (commentId, payload) => {
  const response = await axiosInstance.post(endpoints.comments.reply(commentId), payload);
  return extractApiData(response);
};