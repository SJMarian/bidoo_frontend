<template>
  <div class="register-layout">
    <Navbar />

    <main class="main-content">
      <div class="register-card">
        <div class="security-badge">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L5 12.0001L6.41 10.5901L10 14.1701L17.59 6.58008L19 8.00008L10 17Z"
              fill="#2563eb"
            />
          </svg>
          BANK-GRADE SECURITY
        </div>
        <h1 class="page-title">Create Account</h1>
        <p class="page-subtitle">
          Join our exclusive community of high-end collectors and start bidding on premium assets.
        </p>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="name">Full Legal Name </label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                  fill="#9ca3af"
                />
              </svg>
              <input
                type="text"
                id="name"
                v-model="form.name"
                placeholder="Johnathan Doe"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z"
                  fill="#9ca3af"
                />
              </svg>
              <input
                type="email"
                id="email"
                v-model="form.email"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="phone">Phone Number</label>
              <div class="input-wrapper">
                <svg
                  class="input-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
                    fill="#9ca3af"
                  />
                </svg>
                <input
                  type="tel"
                  id="phone"
                  v-model="form.phone"
                  placeholder="+880 000-0000"
                  required
                />
              </div>
            </div>
            <div class="form-group flex-1">
              <label for="country">Country</label>
              <div class="input-wrapper select-wrapper">
                <select id="country" v-model="form.country">
                  <option value="BANGLADESH">BANGLADESH</option>
                </select>
                <svg
                  class="select-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 10L12 15L17 10H7Z" fill="#6b7280" />
                </svg>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Security Password</label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17Z"
                  fill="#9ca3af"
                />
              </svg>
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
                <svg
                  v-if="!showPassword"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                    fill="#9ca3af"
                  />
                </svg>
                <svg
                  v-else
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 7C9.24 7 7 9.24 7 12C7 12.63 7.12 13.23 7.33 13.79L15.79 5.33C15.23 5.12 14.63 5 14 5C13.61 5 13.25 5.07 12.89 5.14L14.71 3.32C13.84 3.11 12.94 3 12 3C7 3 2.73 6.11 1 10.5C1.84 12.64 3.12 14.52 4.74 15.97L6.64 14.07C5.46 13.1 4.47 11.9 3.73 10.5C5.07 7.74 7.93 6 12 6C12.35 6 12.69 6.03 13.04 6.09L11.53 7.6C11.68 7.54 11.84 7.5 12 7.5C12.63 7.5 13.23 7.62 13.79 7.83L15.79 9.83C15.93 10.29 16 10.78 16 11.29C16 12.95 14.66 14.29 13 14.29C12.49 14.29 12 14.22 11.54 14.08L9.08 16.54C10.03 16.84 11 17 12 17C17 17 21.27 13.89 23 9.5C22.16 7.36 20.88 5.48 19.26 4.03L17.36 5.93C18.54 6.9 19.53 8.1 20.27 9.5C18.93 12.26 16.07 14 12 14C11.65 14 11.31 13.97 10.96 13.91L12.47 12.4C12.32 12.46 12.16 12.5 12 12.5C11.37 12.5 10.77 12.38 10.21 12.17L8.21 10.17C8.07 9.71 8 9.22 8 8.71C8 7.05 9.34 5.71 11 5.71C11.51 5.71 12 5.78 12.46 5.92L14.92 3.46C13.97 3.16 13 3 12 3Z"
                    fill="#9ca3af"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="form-checkbox">
            <input type="checkbox" id="terms" v-model="form.terms" required />
            <label for="terms">
              I agree to the <a href="#terms">Terms of Service</a> and confirm that I am at least 18
              years of age.
            </label>
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading">Creating Account...</span>
            <span v-else>Create Secure Account</span>
            <svg
              v-if="!loading"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <div v-if="error" class="error-message">{{ error }}</div>
        </form>

        <div class="login-link">
          Already have an account? <router-link to="/login">Sign In</router-link>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="trust-badges">
        <div class="badge">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 10.99V6L10.5 7.5L9 6V10.99H12ZM14.5 16C15.88 16 17 14.88 17 13.5C17 12.12 15.88 11 14.5 11C13.12 11 12 12.12 12 13.5V16H14.5Z"
              fill="#6b7280"
            />
          </svg>
          <span>AES-256 BIT<br />Encryption</span>
        </div>
        <div class="badge">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
              fill="#6b7280"
            />
          </svg>
          <span>KYC VERIFIED<br />Bidders Only</span>
        </div>
        <div class="badge">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 16C10.34 16 9 14.66 9 13C9 11.34 10.34 10 12 10C13.66 10 15 11.34 15 13C15 14.66 13.66 16 12 16ZM12 11.5C11.17 11.5 10.5 12.17 10.5 13C10.5 13.83 11.17 14.5 12 14.5C12.83 14.5 13.5 13.83 13.5 13C13.5 12.17 12.83 11.5 12 11.5Z"
              fill="#6b7280"
            />
          </svg>
          <span>SECURE<br />Privacy Policy</span>
        </div>
      </div>
      <p class="copyright">
        © 2024 Elite Auction Group, LLC. All rights reserved. Licensed and Bonded Auctioneer.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Navbar from '../../components/Navbar.vue'
import { useRouter } from 'vue-router'
import { authService } from '../../auth/authService'
import { useAuthStore } from '../../auth/authStore'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  country: 'USA',
  password: '',
  terms: false,
})

const handleRegister = async () => {
  if (!form.terms) {
    error.value = 'You must agree to the Terms of Service'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Call our api service to register
    const response = await authService.register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      country: form.country,
      password: form.password,
    })

    // Save token and set authentication state
    authStore.setAuth(response.data.token)

    // Redirect to dashboard
    router.push('/dashboard')
  } catch (err: any) {
    console.error('Registration failed:', err)
    error.value = err?.response?.data?.message || 'Failed to create account. Please try again.'
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

.register-layout {
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

.register-card {
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
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

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #d1d5db;
  color: white;
  font-size: 0.6rem;
  font-weight: bold;
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

.input-wrapper input,
.input-wrapper select {
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

.input-wrapper input:focus,
.input-wrapper select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-wrapper input::placeholder {
  color: #9ca3af;
}

.select-wrapper select {
  padding-left: 1rem;
  appearance: none;
  cursor: pointer;
}

.select-icon {
  position: absolute;
  right: 0.875rem;
  pointer-events: none;
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

.password-strength {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  flex: 1;
  background-color: #e5e7eb;
}

.strength-bar.full {
  background-color: #2563eb;
}

.strength-bar.partial {
  background-color: #dbeafe;
}

.strength-text {
  font-size: 0.65rem;
  font-weight: 700;
  color: #2563eb;
  margin-left: 0.5rem;
}

.form-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.form-checkbox input[type='checkbox'] {
  margin-top: 0.25rem;
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
  line-height: 1.5;
  cursor: pointer;
}

.form-checkbox a {
  color: #2563eb;
  text-decoration: none;
}

.form-checkbox a:hover {
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

.login-link {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.95rem;
  color: #6b7280;
}

.login-link a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.footer {
  padding: 3rem 1rem;
  text-align: center;
}

.trust-badges {
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-bottom: 2rem;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
  font-weight: 500;
}

.copyright {
  font-size: 0.8rem;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .register-card {
    padding: 2rem;
  }

  .form-row {
    flex-direction: column;
  }

  .trust-badges {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
}
</style>
