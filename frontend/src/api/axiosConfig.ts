import axios from "axios";

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
  (response) => response,
  (error) => {
    let errorMessage = "Something went wrong. Please try again later.";

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data.error || "Invalid request";
          break;
        case 401:
          errorMessage = "Please login to continue";
          // Clear token and redirect to login if needed
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          errorMessage = "You don't have permission to perform this action";
          break;
        case 404:
          errorMessage = "The requested resource was not found";
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = error.response.data.error || "An error occurred";
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage =
        "No response from server. Please check your internet connection.";
    }

    // Create a custom error object with the message
    const customError = new Error(errorMessage);
    customError.message = error.response;
    return Promise.reject(customError);
  }
);

export default axiosInstance;
