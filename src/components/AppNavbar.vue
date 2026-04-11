<template>
  <header class="app-navbar">
    <div class="navbar-left">
      <router-link to="/" class="logo">
        <div class="logo-icon-wrapper">
          <Gavel class="logo-icon" :size="20" />
        </div>
        <span class="logo-text">Elite Auction</span>
      </router-link>
      <div class="search-bar">
        <Search class="search-icon" :size="18" />
        <input type="text" placeholder="Search luxury assets..." class="search-input" />
      </div>
    </div>

    <div class="navbar-right">
      <nav class="nav-links">
        <a href="#" class="active">Live</a>
        <a href="#">Upcoming</a>
        <a href="#">Past</a>
        <router-link to="/home/my-bids" active-class="active">My Bids</router-link>
      </nav>

      <div class="nav-actions">
        <button class="btn-notification">
          <Bell class="notification-icon" :size="20" />
        </button>
        <router-link to="/profile" class="btn-profile">Profile</router-link>

        <button class="btn-notification">
          <LogOut class="" @click="logout" :size="20" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Gavel, Search, Bell, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '../auth/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

@media (min-width: 1024px) {
  .app-navbar {
    padding: 0.75rem 2rem;
  }
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo-icon-wrapper {
  background-color: rgba(25, 127, 230, 0.1);
  color: #197fe6;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.logo-text {
  font-weight: 800;
  font-size: 1.25rem;
  color: #0f172a;
  letter-spacing: -0.015em;
  white-space: nowrap;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border-radius: 8px;
  height: 40px;
  padding: 0 1rem;
  width: 250px;
}

.search-icon {
  color: #64748b;
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  width: 100%;
}

.search-input::placeholder {
  color: #64748b;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
  padding-bottom: 4px;
}

.nav-links a:hover {
  color: #197fe6;
}

.nav-links a.active {
  color: #197fe6;
  font-weight: 700;
  border-bottom: 2px solid #197fe6;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-notification {
  background: #f8fafc;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-notification:hover {
  background: #e2e8f0;
}

.btn-profile {
  background-color: #197fe6;
  color: white;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0 1rem;
  height: 40px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: opacity 0.2s;
}

.btn-profile:hover {
  opacity: 0.9;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 2px solid #f1f5f9;
}

@media (max-width: 768px) {
  .search-bar,
  .nav-links {
    display: none;
  }
}
</style>
