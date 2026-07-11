import axiosInstance from './axiosInstance';
import { endpoints } from './endpoints';
import { extractApiData } from './normalize';

export const createPlaylist = async (payload) => {
  const response = await axiosInstance.post(endpoints.playlists.root, payload);
  return extractApiData(response);
};

export const getPlaylistById = async (playlistId) => {
  const response = await axiosInstance.get(endpoints.playlists.detail(playlistId));
  return extractApiData(response);
};

export const updatePlaylist = async (playlistId, payload) => {
  const response = await axiosInstance.patch(endpoints.playlists.detail(playlistId), payload);
  return extractApiData(response);
};

export const deletePlaylist = async (playlistId) => {
  const response = await axiosInstance.delete(endpoints.playlists.detail(playlistId));
  return extractApiData(response);
};

export const addVideoToPlaylist = async (videoId, playlistId) => {
  const response = await axiosInstance.patch(endpoints.playlists.addVideo(videoId, playlistId));
  return extractApiData(response);
};

export const removeVideoFromPlaylist = async (videoId, playlistId) => {
  const response = await axiosInstance.patch(endpoints.playlists.removeVideo(videoId, playlistId));
  return extractApiData(response);
};

export const getUserPlaylists = async (userId) => {
  const response = await axiosInstance.get(endpoints.playlists.byUser(userId));
  return extractApiData(response);
};