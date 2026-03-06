export interface User {
  id: string | number
  email: string
  name?: string
  roles?: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginResponse {
  data: { token: string }
}
