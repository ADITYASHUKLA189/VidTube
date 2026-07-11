import axiosInstance from './axiosInstance';
import { endpoints } from './endpoints';
import { extractApiData } from './normalize';

export const createTweet = async (payload) => {
  const response = await axiosInstance.post(endpoints.tweets.root, payload);
  return extractApiData(response);
};

export const getUserTweets = async (userId) => {
  const response = await axiosInstance.get(endpoints.tweets.byUser(userId));
  return extractApiData(response);
};

export const updateTweet = async (tweetId, payload) => {
  const response = await axiosInstance.patch(endpoints.tweets.item(tweetId), payload);
  return extractApiData(response);
};

export const deleteTweet = async (tweetId) => {
  const response = await axiosInstance.delete(endpoints.tweets.item(tweetId));
  return extractApiData(response);
};