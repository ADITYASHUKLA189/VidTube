import axiosInstance from './axiosInstance';
import { endpoints } from './endpoints';
import { extractApiData } from './normalize';

export const getChannelStats = async () => {
  const response = await axiosInstance.get(endpoints.dashboard.stats);
  return extractApiData(response);
};

export const getChannelVideos = async () => {
  const response = await axiosInstance.get(endpoints.dashboard.videos);
  return extractApiData(response);
};