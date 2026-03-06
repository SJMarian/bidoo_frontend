import { defineStore } from 'pinia'
import { getToken, saveToken, removeToken, decodeToken } from '../utils/jwt'
import type { User, AuthState } from './authTypes'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const token = getToken()
    const user = token ? decodeToken(token) : null
    return {
      user: user || null,
      token: token || null,
      isAuthenticated: !!token,
    }
  },

  actions: {
    setAuth(token: string) {
      this.token = token
      this.isAuthenticated = true
      saveToken(token)
    },

    logout() {
      this.token = null
      this.isAuthenticated = false
      removeToken()
    },

    initializeAuth() {
      const token = getToken()
      if (token) {
        this.token = token
        this.isAuthenticated = true
        this.user = decodeToken(token)
      } else {
        this.logout()
      }
    },
  },
})
