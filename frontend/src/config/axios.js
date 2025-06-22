import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://be4a-103-173-211-148.ngrok-free.app', 
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});
