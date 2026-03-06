import apiClient from '../api/apiClient'
import type { User, LoginResponse } from './authTypes'

export const authService = {
  async login(credentials: any): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  async register(userData: any): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  async fetchCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post('/auth/refresh')
    return response.data
  },
}
