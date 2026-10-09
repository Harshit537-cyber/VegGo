import axios from 'axios'

const getBaseUrl = () => {
  if (
    typeof process !== 'undefined' &&
    process.env?.REACT_APP_API_URL
  ) {
    return process.env.REACT_APP_API_URL
  }

  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_API_URL
  ) {
    return import.meta.env.VITE_API_URL
  }

  return 'https://api.veggofresh.in'
}

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (
      token &&
      token !== 'undefined' &&
      token !== 'null'
    ) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api