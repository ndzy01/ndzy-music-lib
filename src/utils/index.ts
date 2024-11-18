import axios from 'axios';

export const service = axios.create({
  baseURL: 'https://ndzy-s.vercel.app',
  timeout: 60000,
  withCredentials: false,
});

service.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    Promise.reject(error).then();
  },
);

service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.log(error)
  },
);
