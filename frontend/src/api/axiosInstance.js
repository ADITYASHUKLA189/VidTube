import axios from 'axios';
import { API_BASE_URL, endpoints } from './endpoints';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let refreshPromise = null;

const refreshSession = () => {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refreshToken');
    refreshPromise = axios
      .post(`${API_BASE_URL}${endpoints.users.refreshToken}`, { refreshToken }, { withCredentials: true })
      .then((res) => {
        const data = res.data?.data || res.data;
        if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        return res;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[Axios Response] SUCCESS ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status, response.data);
    
    // Save tokens if they exist in the response
    const data = response.data?.data || response.data;
    if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken);
    if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

    // Clear tokens on logout
    if (response.config.url.includes(endpoints.users.logout)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }

    return response;
  },
  async (error) => {
    console.error(`[Axios Response] ERROR ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.status, error.response?.data || error.message);
    const originalRequest = error.config;
    const status = error?.response?.status;
    const skippedPaths = [endpoints.users.login, endpoints.users.register, endpoints.users.refreshToken];

    if (status !== 401 || originalRequest?._retry || skippedPaths.some((path) => originalRequest?.url?.includes(path))) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      // Retry original request with new token
      const newToken = localStorage.getItem('accessToken');
      if (newToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
      }
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Dynamic imports to break circular dependency
      const { store } = await import('../app/store');
      const { clearSession } = await import('../features/auth/authSlice');
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      store.dispatch(clearSession());
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;