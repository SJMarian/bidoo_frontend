import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from './authStore'
import { isTokenExpired } from '../utils/jwt'

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const authStore = useAuthStore()

  if (requiresAuth) {
    if (!authStore.isAuthenticated || isTokenExpired()) {
      authStore.logout()
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  } else if (to.name === 'Login' && authStore.isAuthenticated && !isTokenExpired()) {
    return next({ name: 'Home' })
  }

  next()
}
