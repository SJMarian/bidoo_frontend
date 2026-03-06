<template>
  <div class="login-layout">
    <Navbar />
    <main class="login-container">
      <div class="login">
        <h1>Login Page</h1>
        <form @submit.prevent="handleLogin">
          <!-- simple mock form -->
          <button type="submit">Mock Login (Set Token)</button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import { useAuthStore } from '../auth/authStore'
import { useRouter } from 'vue-router'

// Make sure to generate a token string that jwtDecode won't fail on if needed
// "header.payload.signature"
const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiZXhwIjoyNTI0NjA4MDAwfQ.signature'

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = () => {
  // In a real app, call authService.login()
  authStore.setAuth(mockToken)
  router.push('/dashboard')
}
</script>
