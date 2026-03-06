<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Protected area. Welcome, {{ authStore.user?.email }}!</p>
    <button @click="logout">Logout</button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../auth/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
