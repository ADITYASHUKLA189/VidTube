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

export const registerUser = async (payload) => {
  const response = await axiosInstance.post(endpoints.users.register, toFormData(payload));
  return extractApiData(response);
};

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post(endpoints.users.login, credentials);
  return extractApiData(response);
};

export const googleLoginUser = async (credential) => {
  const response = await axiosInstance.post(endpoints.users.googleLogin, { credential });
  return extractApiData(response);
};

export const logoutUser = async () => {
  const response = await axiosInstance.post(endpoints.users.logout);
  return extractApiData(response);
};

export const refreshAccessToken = async () => {
  const response = await axiosInstance.post(endpoints.users.refreshToken, {});
  return extractApiData(response);
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get(endpoints.users.currentUser);
  return extractApiData(response);
};

export const changeCurrentPassword = async (payload) => {
  const response = await axiosInstance.post(endpoints.users.changePassword, payload);
  return extractApiData(response);
};

export const updateAccountDetails = async (payload) => {
  const response = await axiosInstance.patch(endpoints.users.updateAccount, payload);
  return extractApiData(response);
};

export const updateUserAvatar = async (avatar) => {
  const response = await axiosInstance.patch(endpoints.users.updateAvatar, toFormData({ avatar }));
  return extractApiData(response);
};

export const updateUserCoverImage = async (coverImage) => {
  const response = await axiosInstance.patch(endpoints.users.updateCoverImage, toFormData({ coverImage }));
  return extractApiData(response);
};

export const getUserChannelProfile = async (username) => {
  const response = await axiosInstance.get(endpoints.users.channelProfile(username));
  return extractApiData(response);
};

export const getWatchHistory = async () => {
  const response = await axiosInstance.get(endpoints.users.watchHistory);
  return extractApiData(response);
};