<template>
  <header class="navbar">
    <div class="logo">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.41 4 20 7.59 20 12H12V4Z"
          fill="#1d4ed8"
        />
      </svg>
      <span class="logo-text">Elite Auction</span>
    </div>
    <nav class="nav-links">
      <a href="#how-it-works">How it Works</a>
      <a href="#live-auctions">Live Auctions</a>
      <a href="#support">Support</a>
    </nav>
    <div class="nav-actions">
      <router-link v-if="!isLoginRoute" to="/login" class="btn-nav-signin">Sign In</router-link>
      <router-link v-if="!isRegisterRoute" to="/register" class="btn-nav-register"
        >Register</router-link
      >
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isLoginRoute = computed(() => route.path === '/login')
const isRegisterRoute = computed(() => route.path === '/register')
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 4rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: #111827;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  transition: color 0.2s;
  font-size: 0.95rem;
}

.nav-links a:hover {
  color: #111827;
}

.btn-nav-signin {
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 0.95rem;
}

.btn-nav-signin:hover {
  background-color: #dbeafe;
}

.btn-nav-register {
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  background-color: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 0.95rem;
}

.btn-nav-register:hover {
  background-color: #dbeafe;
}

@media (max-width: 768px) {
  .navbar {
    padding: 1.25rem 1.5rem;
  }

  .nav-links {
    display: none;
  }
}
</style>
