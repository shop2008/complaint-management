import axios from "axios";
import { ApiResponse, ErrorCode } from "../types/api.types";

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
});

// Add request interceptor to add JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = "Something went wrong. Please try again later.";
    let errorCode = ErrorCode.INTERNAL_ERROR;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const apiResponse = error.response.data as ApiResponse;

      if (apiResponse && apiResponse.error) {
        errorMessage = apiResponse.error.message;
        errorCode = apiResponse.error.code as ErrorCode;
      }

      switch (error.response.status) {
        case 400:
          if (!errorMessage) errorMessage = "Invalid request";
          break;
        case 401:
          errorMessage = "Please login to continue";
          // Clear token and redirect to login if needed
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          if (!errorMessage)
            errorMessage = "You don't have permission to perform this action";
          break;
        case 404:
          if (!errorMessage)
            errorMessage = "The requested resource was not found";
          break;
        case 429:
          if (!errorMessage)
            errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          if (!errorMessage)
            errorMessage = "Server error. Please try again later.";
          break;
        default:
          if (!errorMessage) errorMessage = "An error occurred";
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage =
        "No response from server. Please check your internet connection.";
    }

    // Create a custom error object with the message
    const customError = new Error(errorMessage);
    customError.message = errorMessage;
    // @ts-ignore
    customError.code = errorCode;
    // @ts-ignore
    customError.response = error.response;
    return Promise.reject(customError);
  }
);

export default axiosInstance;
