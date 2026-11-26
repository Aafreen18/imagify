import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('imagify-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
export const messageFrom = (error: unknown) => {
  if (axios.isAxiosError(error)) return error.response?.data?.message || 'Could not reach Imagify. Make sure the server is running.'
  return 'Something went wrong. Please try again.'
}
