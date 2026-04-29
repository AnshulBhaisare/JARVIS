import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 })

export const processCommand = async (command, context = null) => {
  const { data } = await api.post('/api/voice/process', { command, context })
  return data
}

export const getHistory = async (limit = 50) => {
  const { data } = await api.get(`/api/history/?limit=${limit}`)
  return data
}

export const clearHistory = async () => {
  const { data } = await api.delete('/api/history/clear')
  return data
}

export const createNote = async (title, content = '') => {
  const { data } = await api.post('/api/notes/', { title, content })
  return data
}

export const getNotes = async () => {
  const { data } = await api.get('/api/notes/')
  return data
}

export const healthCheck = async () => {
  const { data } = await api.get('/health')
  return data
}
