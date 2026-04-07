import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard } from '../auth/authGuard'

// Views
const Home = () => import('../views/Home.vue')
const Dashboard = () => import('../views/Dashboard.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/my-bids',
    name: 'MyBids',
    component: () => import('../views/MyBids.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/create-auction',
    name: 'CreateAuction',
    component: () => import('../views/CreateAuction.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
})

// Register the global auth guard
router.beforeEach(authGuard)

export default router
