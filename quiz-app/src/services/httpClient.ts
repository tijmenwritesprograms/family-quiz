import axios, { type AxiosInstance, type AxiosError } from 'axios'

/**
 * Get the API base URL from environment variables
 * In Aspire, this will be set to the quiz-server endpoint
 * In local dev, falls back to localhost
 */
const getApiBaseUrl = () => {
  const aspireUrl = import.meta.env.VITE_API_BASE_URL
  if (aspireUrl) {
    // Ensure the URL ends with /api
    return aspireUrl.endsWith('/api') ? aspireUrl : `${aspireUrl}/api`
  }
  return 'http://localhost:5000/api'
}

/**
 * Create a configured Axios instance for API communication
 */
const httpClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Request interceptor - runs before every request
 * Useful for adding auth tokens, logging, etc.
 */
httpClient.interceptors.request.use(
  (config) => {
    // Example: Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - runs after every response
 * Useful for centralized error handling, token refresh, etc.
 */
httpClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`)
    return response
  },
  (error: AxiosError) => {
    // Centralized error handling
    if (error.response) {
      // Server responded with error status
      console.error(`[API Error] ${error.response.status}:`, error.response.data)
      
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.error('Unauthorized access')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('[API Error] No response received:', error.request)
    } else {
      // Error in request setup
      console.error('[API Error] Request setup error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default httpClient
