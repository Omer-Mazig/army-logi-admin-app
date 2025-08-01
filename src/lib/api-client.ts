import axios from "axios";

/**
 * API client
 * @description API client for the application
 * @returns {AxiosInstance} API client
 */
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

console.log("baseURL", baseURL);

export const apiClient = axios.create({
  baseURL: baseURL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});
