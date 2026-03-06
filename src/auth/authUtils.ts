import { decodeToken } from '../utils/jwt'

export const getUserRoles = (token: string): string[] => {
  const decoded = decodeToken(token)
  return decoded?.roles || []
}
