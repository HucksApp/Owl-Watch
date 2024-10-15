// src/services/api.js

import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // Base URL from environment variables
  withCredentials: true,     
  timeout: 10000, // Set a timeout for requests (10 seconds)
  headers: {
    'Content-Type': 'application/json', // Set the default Content-Type
  },
});


// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle the response data as needed
    return response;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // The request was made, and the server responded with a status code
      console.error('Response error:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      // You can customize your error handling here
      // Optionally, you can handle specific status codes
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized: Please log in again.');
          // Optionally redirect to login page or logout
          break;
        case 403:
          console.error('Forbidden: You do not have access to this resource.');
          break;
        case 404:
          console.error('Not Found: The requested resource could not be found.');
          break;
        case 500:
          console.error('Internal Server Error: Please try again later.');
          break;
        default:
          console.error('An error occurred: ', error.message);
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; // Export the Axios instance
