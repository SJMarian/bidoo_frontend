<template>
  <div class="login-layout">
    <Navbar />

    <main class="main-content">
      <div class="login-card">
        <div class="security-badge">
          <LockKeyhole color="#2563eb" :size="16" />
          SECURE ACCESS
        </div>
        <h1 class="page-title">Sign In</h1>
        <p class="page-subtitle">
          Welcome back. Enter your credentials to access your bidding dashboard.
        </p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <Mail color="#9ca3af" class="input-icon" :size="20" />
              <input
                type="email"
                id="email"
                v-model="form.email"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Security Password</label>
            <div class="input-wrapper">
              <Lock color="#9ca3af" class="input-icon" :size="20" />
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="form.password"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                class="btn-toggle-password"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" color="#9ca3af" :size="20" />
                <EyeOff v-else color="#9ca3af" :size="20" />
              </button>
            </div>
          </div>

          <div class="form-options">
            <div class="form-checkbox">
              <input type="checkbox" id="remember" v-model="form.remember" />
              <label for="remember">Remember me</label>
            </div>
            <a href="#forgot" class="forgot-link">Forgot Password?</a>
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading">Signing In...</span>
            <span v-else>Sign In to Account</span>
            <ArrowRight v-if="!loading" color="#ffffff" :size="20" />
          </button>
          <div v-if="error" class="error-message">{{ error }}</div>
        </form>

        <div class="register-link">
          Don't have an account? <router-link to="/register">Create Account</router-link>
        </div>
      </div>
    </main>
    <AuthFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Navbar from '../../components/Navbar.vue'
import { useRouter } from 'vue-router'
import { authService } from '../../auth/authService'
import { useAuthStore } from '../../auth/authStore'
import AuthFooter from '../../components/AuthFooter.vue'

import {
  Mail,
  Lock,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Award,
  BadgeCheck,
  ShieldCheck,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // Call our api service to login
    const response = await authService.login({
      email: form.email,
      password: form.password,
    })

    // Save token and set authentication state
    authStore.setAuth(response.data.token)

    // Redirect to dashboard
    router.push('/dashboard')
  } catch (err: any) {
    console.error('Login failed:', err)
    error.value = err?.response?.data?.message || 'Invalid credentials. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.login-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
  font-family: 'Inter', sans-serif;
  color: #111827;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 1rem;
}

.login-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 3rem;
  width: 100%;
  max-width: 520px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #f3f4f6;
}

.security-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.page-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
  color: #111827;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-wrapper input::placeholder {
  color: #9ca3af;
}

.btn-toggle-password {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-checkbox input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  accent-color: #2563eb;
  cursor: pointer;
}

.form-checkbox label {
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.forgot-link {
  font-size: 0.875rem;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.btn-submit:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
  margin-top: -0.5rem;
}

.register-link {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.95rem;
  color: #6b7280;
}

.register-link a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem;
  }

  .trust-badges {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
}
</style>
