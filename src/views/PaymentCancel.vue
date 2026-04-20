<template>
  <div class="result-page">
    <div class="result-container">
      <div class="icon-circle cancel">
        <AlertTriangle class="icon" :size="48" />
      </div>
      <h1>Payment Cancelled</h1>
      <p>Your payment transaction was cancelled. No charges were made to your account.</p>
      
      <div class="action-buttons">
        <button class="btn-outline" @click="goToDashboard">
          Back to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AlertTriangle } from 'lucide-vue-next'

const router = useRouter()

const goToDashboard = () => {
  router.push('/')
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Manrope', 'Inter', sans-serif;
  color: #0f172a;
  padding: 1rem;
}

.result-container {
  background: #ffffff;
  border-radius: 1rem;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  max-width: 480px;
  width: 100%;
  text-align: center;
}

.icon-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
}

.icon-circle.cancel {
  background-color: #fef08a;
  color: #ca8a04;
}

h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  color: #0f172a;
}

p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 2rem 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-outline {
  background-color: transparent;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-outline:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}
</style>
