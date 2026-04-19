import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard } from '../auth/authGuard'

// Views
const Home = () => import('../views/Home.vue')
const Login = () => import('../views/auth/Login.vue')
const Register = () => import('../views/auth/Register.vue')
const MyBids = () => import('../views/MyBids.vue')
const CreateAuction = () => import('../views/CreateAuction.vue')
const Checkout = () => import('../views/Checkout.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/home/my-bids',
    name: 'MyBids',
    component: MyBids,
    meta: { requiresAuth: true },
  },
  {
    path: '/home/create-auction',
    name: 'CreateAuction',
    component: CreateAuction,
    meta: { requiresAuth: true },
  },
  {
    path: '/checkout/:id',
    name: 'Checkout',
    component: Checkout,
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
