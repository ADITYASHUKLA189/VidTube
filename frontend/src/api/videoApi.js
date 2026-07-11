import axiosInstance from './axiosInstance';
import { endpoints } from './endpoints';
import { extractApiData } from './normalize';

const toFormData = (fields = {}) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  return formData;
};

export const getVideos = async (params = {}) => {
  const response = await axiosInstance.get(endpoints.videos.list, { params });
  return extractApiData(response);
};

export const getVideoById = async (videoId) => {
  const response = await axiosInstance.get(endpoints.videos.detail(videoId));
  return extractApiData(response);
};

export const publishVideo = async (payload, onProgress) => {
  const { videoFile, thumbnail, title, description, tags, isPublished } = payload;
  
  // Pass title and description as query parameters to bypass backend validation order bug
  const queryParams = new URLSearchParams({ title, description }).toString();
  const url = `${endpoints.videos.publish}?${queryParams}`;

  const response = await axiosInstance.post(
    url,
    toFormData({ videoFile, thumbnail, title, description, tags, isPublished }),
    {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }
  );
  return extractApiData(response);
};

export const updateVideo = async (videoId, payload) => {
  const response = await axiosInstance.patch(endpoints.videos.detail(videoId), toFormData(payload));
  return extractApiData(response);
};

export const deleteVideo = async (videoId) => {
  const response = await axiosInstance.delete(endpoints.videos.detail(videoId));
  return extractApiData(response);
};

export const togglePublishStatus = async (videoId) => {
  const response = await axiosInstance.patch(endpoints.videos.togglePublish(videoId));
  return extractApiData(response);
};