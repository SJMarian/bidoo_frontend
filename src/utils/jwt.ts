import { storage } from './storage'
import { TOKEN_KEY } from './constants'
import { jwtDecode } from 'jwt-decode'

export const saveToken = (token: string): void => {
  storage.setItem(TOKEN_KEY, token)
}

export const getToken = (): string | null => {
  return storage.getItem(TOKEN_KEY)
}

export const removeToken = (): void => {
  storage.removeItem(TOKEN_KEY)
}

export const decodeToken = (token: string): any => {
  try {
    return jwtDecode(token)
  } catch (error) {
    return null
  }
}

export const isTokenExpired = (token: string | null = getToken()): boolean => {
  if (!token) return true
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true

  const currentTime = Date.now() / 1000
  return decoded.exp < currentTime
}
