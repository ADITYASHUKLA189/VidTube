import axiosInstance from './axiosInstance';
import { endpoints } from './endpoints';
import { extractApiData } from './normalize';

export const toggleSubscription = async (channelId) => {
  const response = await axiosInstance.post(endpoints.subscriptions.channel(channelId));
  return extractApiData(response);
};

export const getSubscribedChannels = async (channelId) => {
  const response = await axiosInstance.get(endpoints.subscriptions.channel(channelId));
  return extractApiData(response);
};

export const getUserChannelSubscribers = async (subscriberId) => {
  const response = await axiosInstance.get(endpoints.subscriptions.channelSubscribers(subscriberId));
  return extractApiData(response);
};