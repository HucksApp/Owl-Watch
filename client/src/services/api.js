/**
 * API Service using Axios
 *
 * This module sets up an Axios instance for making API calls, including
 * handling authentication tokens, request and response interception.
 * It exports the configured Axios instance for use throughout the application.
 *
 * @module api
 */

import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    withCredentials: true,     
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json', // Set the default Content-Type
    },
  });
  
  
/**
 * Request Interceptor
 *
 * This interceptor attaches a Bearer token to the Authorization header of each request
 * if a token is stored in local storage. This is useful for authenticated requests.
 *
 * @param {Object} config - The Axios request configuration object.
 * @returns {Object} The modified request configuration object.
 * @throws {Promise} Returns a promise rejecting the request with the error if an error occurs.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle the error before the request is sent
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 *
 * This interceptor handles responses from the server. It logs error responses and
 * can perform actions based on the status code of the response, such as logging out
 * a user for unauthorized access.
 *
 * @param {Object} response - The Axios response object.
 * @returns {Object} The response object if successful.
 * @throws {Promise} Returns a promise rejecting the response with the error if an error occurs.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle the response data as needed
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
  
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

export default axiosInstance;
