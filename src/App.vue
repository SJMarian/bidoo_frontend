<script setup lang="ts">
import { NotificationBell, NotificationToast } from '@/components/notification'
import AuctionsPage from '@/components/AuctionsPage.vue'
import { ref } from 'vue'

const currentUserId = 1
const currentPage = ref<'dashboard' | 'auctions'>('dashboard')
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header>
      <div class="header-content">
        <div class="logo-section" @click="currentPage = 'dashboard'" style="cursor: pointer">
          <div class="logo">🏆</div>
          <div>
            <h1 class="app-title">Bidoo Auction</h1>
            <p class="app-subtitle">Your bidding dashboard</p>
          </div>
        </div>
        <nav class="nav-buttons">
          <button
            :class="['nav-btn', { active: currentPage === 'dashboard' }]"
            @click="currentPage = 'dashboard'"
          >
            Dashboard
          </button>
          <button
            :class="['nav-btn', { active: currentPage === 'auctions' }]"
            @click="currentPage = 'auctions'"
          >
            Live Auctions
          </button>
        </nav>
        <NotificationBell :user-id="currentUserId" />
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <!-- Dashboard View -->
      <div v-if="currentPage === 'dashboard'" class="dashboard-container">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-content">
            <h2 class="hero-title">Welcome to Bidoo Auction</h2>
            <p class="hero-subtitle">Your complete bidding experience in one platform</p>
          </div>
        </section>

        <!-- Features Grid -->
        <section class="features-grid">
          <!-- Feature Card 1 -->
          <div class="feature-card">
            <div class="card-icon">🏆</div>
            <h3>Track Auctions</h3>
            <p>Monitor your active bids and auction status in real-time</p>
            <div class="card-accent"></div>
          </div>

          <!-- Feature Card 2 -->
          <div class="feature-card">
            <div class="card-icon">📬</div>
            <h3>Smart Notifications</h3>
            <p>Never miss important updates about your bids and payments</p>
            <div class="card-accent"></div>
          </div>

          <!-- Feature Card 3 -->
          <div class="feature-card">
            <div class="card-icon">💳</div>
            <h3>Easy Payment</h3>
            <p>Complete payments securely with multiple payment methods</p>
            <div class="card-accent"></div>
          </div>

          <!-- Feature Card 4 -->
          <div class="feature-card">
            <div class="card-icon">⚡</div>
            <h3>Real-Time Updates</h3>
            <p>Get instant notifications when you win auctions</p>
            <div class="card-accent"></div>
          </div>
        </section>

        <!-- Info Section -->
        <section class="info-section">
          <div class="info-card">
            <div class="info-header">
              <span class="info-icon">🔔</span>
              <h3>Check Your Notifications</h3>
            </div>
            <p class="info-text">Click the bell icon in the top-right corner to view all your auction events, winning bids, and payment reminders.</p>
            <div class="info-highlight">
              <span class="highlight-icon">✨</span>
              <p><strong>Pro Tip:</strong> When you win an auction, you'll see your payment options directly in the notification!</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Auctions View -->
      <AuctionsPage v-else />
    </main>

    <!-- Toast Notifications -->
    <NotificationToast :user-id="currentUserId" />
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

/* Header */
header {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  font-size: 2.5rem;
  line-height: 1;
}

.app-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #667eea;
  letter-spacing: -0.5px;
}

.app-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #999;
  font-weight: 500;
}

/* Navigation Buttons */
.nav-buttons {
  display: flex;
  gap: 8px;
}

.nav-btn {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.nav-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Main Content */
main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.dashboard-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 3.5rem;
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.8rem 0;
  letter-spacing: -0.8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 300;
  letter-spacing: 0.3px;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  transition: transform 0.3s ease;
}

.feature-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-card h3 {
  font-size: 1.3rem;
  margin: 0 0 0.8rem 0;
  color: #111827;
  font-weight: 700;
}

.feature-card p {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  position: relative;
  z-index: 1;
}

.card-accent {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 50%;
  margin: 30px -30px -30px 0;
  transition: all 0.3s ease;
}

.feature-card:hover .card-accent {
  width: 120px;
  height: 120px;
}

/* Info Section */
.info-section {
  margin-top: 2rem;
  animation: fadeInUp 0.6s ease-out 0.5s backwards;
}

.info-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-icon {
  font-size: 2rem;
  display: block;
}

.info-card h3 {
  font-size: 1.5rem;
  margin: 0;
  color: #111827;
  font-weight: 700;
}

.info-text {
  font-size: 1rem;
  color: #4b5563;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.info-highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 1.5rem;
}

.highlight-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-highlight p {
  margin: 0;
  color: white;
  font-size: 0.95rem;
  line-height: 1.5;
}

.info-highlight strong {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .logo-section {
    flex-direction: column;
    gap: 0.5rem;
  }

  main {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.05rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .info-card {
    padding: 1.5rem;
  }

  .info-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-highlight {
    flex-direction: column;
    align-items: center;
  }

  .highlight-icon {
    text-align: center;
  }

  .dashboard-container {
    padding: 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.6rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .feature-card h3 {
    font-size: 1.1rem;
  }

  .feature-card p {
    font-size: 0.9rem;
  }

  .card-icon {
    font-size: 2.5rem;
    margin-bottom: 0.8rem;
  }

  .info-card h3 {
    font-size: 1.2rem;
  }

  .info-text {
    font-size: 0.9rem;
  }

  .info-highlight p {
    font-size: 0.85rem;
  }
}
</style>