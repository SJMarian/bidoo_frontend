<template>
  <div class="dashboard-page">
    <AppNavbar />
    <main class="dashboard-content">
      <div class="header">
        <h1>Dashboard</h1>
      </div>
      <div class="content-body">
        <p>Protected area. Welcome, <strong>{{ authStore.user?.email || 'User' }}</strong>!</p>
        <button class="logout-btn" @click="logout">Logout</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../auth/authStore'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.dashboard-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
}

.content-body {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.content-body p {
  color: #475569;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
}

.logout-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #dc2626;
}
</style>
