<template>
  <div class="result-page">
    <div class="result-container">
      <div class="icon-circle fail">
        <XCircle class="icon" :size="48" />
      </div>
      <h1>Payment Failed</h1>
      <p>We're sorry, but we couldn't process your payment. Please check your payment details and try again.</p>
      
      <div class="action-buttons">
        <button class="btn-primary" @click="goToDashboard">
          Back to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { XCircle } from 'lucide-vue-next'

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

.icon-circle.fail {
  background-color: #fee2e2;
  color: #ef4444;
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

.btn-primary {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.btn-primary:hover {
  background-color: #dc2626;
}
</style>
