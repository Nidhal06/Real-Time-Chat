import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'realtime_chat_token';
export const USER_STORAGE_KEY = 'realtime_chat_user';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const axiosClient = axios.create({
  baseURL: `${baseUrl.replace(/\/$/, '')}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;
