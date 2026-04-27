import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const login = (username, password) =>
  api.post('/api/login', { username, password })

export const signup = (username, password) =>
  api.post('/api/signup', { username, password })

export const logEnergy = (kwh) =>
  api.post('/api/log-energy', { kwh })

export const getEnergyLogs = () =>
  api.get('/api/energy-logs')

export const getAppliances = () =>
  api.get('/api/appliances')

export const logAppliance = (appliance, kwh) =>
  api.post('/api/log-appliance', { appliance, kwh })

export const getApplianceBreakdown = () =>
  api.get('/api/appliance-breakdown')

export const getWeeklySummary = () =>
  api.get('/api/weekly-summary')

export const getMonthlySummary = () =>
  api.get('/api/monthly-summary')

export const getSettings = () =>
  api.get('/api/settings')

export const saveRate = (rate) =>
  api.post('/api/settings/rate', { rate })

export const saveBudget = (budget) =>
  api.post('/api/settings/budget', { budget })

export const getBillingSummary = () =>
  api.get('/api/billing-summary')

export const getCostByAppliance = () =>
  api.get('/api/cost-by-appliance')

export default api
