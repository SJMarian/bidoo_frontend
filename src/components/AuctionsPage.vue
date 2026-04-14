<template>
  <div class="auctions-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-top">
        <h2 class="page-title">🎯 Live Auctions</h2>
        <p class="page-subtitle">Track all active auctions and their countdowns</p>
      </div>
      <div class="filter-tabs">
        <button
          v-for="filter in filters"
          :key="filter"
          :class="['filter-btn', { active: activeFilter === filter }]"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <!-- Auctions Grid -->
    <div class="auctions-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading auctions...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button @click="fetchAuctions" class="retry-btn">Retry</button>
      </div>

      <!-- No Auctions -->
      <div v-else-if="filteredAuctions.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>No {{ activeFilter.toLowerCase() }} auctions</p>
      </div>

      <!-- Auctions List -->
      <div v-else class="auctions-grid">
        <div v-for="auction in filteredAuctions" :key="auction.id" class="auction-card">
          <!-- Auction Info -->
          <div class="auction-info">
            <div class="auction-header">
              <h3 class="auction-title">{{ auction.title }}</h3>
              <span :class="['auction-badge', `badge-${auction.state.toLowerCase()}`]">
                {{ auction.state }}
              </span>
            </div>

            <p v-if="auction.description" class="auction-description">
              {{ auction.description }}
            </p>

            <!-- Price Info -->
            <div class="price-section">
              <div class="price-item">
                <span class="price-label">Starting Price</span>
                <span class="price-value">${{ auction.startingPrice.toFixed(2) }}</span>
              </div>
              <div class="price-item">
                <span class="price-label">Current Bid</span>
                <span class="price-value" :class="{ 'has-bid': auction.currentHighestBid > 0 }">
                  {{ auction.currentHighestBid > 0 ? `$${auction.currentHighestBid.toFixed(2)}` : 'No bids' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Countdown Component -->
          <div class="countdown-section">
            <AuctionCountdown
              :auction-id="auction.id"
              @state-change="onAuctionStateChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AuctionCountdown } from '@/components/countdown'
import { auctionApi } from '@/services/auction/auctionApi'

interface AuctionData {
  id: number
  title: string
  description: string
  startingPrice: number
  currentHighestBid: number
  highestBidderId: number | null
  state: 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'PAID'
  startTime: string
  endTime: string
}

const filters = ['All', 'UPCOMING', 'ACTIVE', 'CLOSED']
const activeFilter = ref('All')
const auctions = ref<AuctionData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filteredAuctions = computed(() => {
  if (activeFilter.value === 'All') {
    return auctions.value
  }
  return auctions.value.filter((a) => a.state === activeFilter.value)
})

async function fetchAuctions() {
  loading.value = true
  error.value = null
  try {
    auctions.value = await auctionApi.getAllAuctions()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load auctions'
    console.error('[AuctionsPage] Fetch error:', e)
  } finally {
    loading.value = false
  }
}

function onAuctionStateChange(auctionId: number, newState: string) {
  const auction = auctions.value.find((a) => a.id === auctionId)
  if (auction) {
    auction.state = newState as AuctionData['state']
  }
}

onMounted(() => {
  fetchAuctions()
})
</script>

<style scoped>
.auctions-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}

/* ── Header Section ────────────────────────────────────────────── */
.page-header {
  max-width: 1200px;
  margin: 0 auto 40px;
  color: white;
}

.header-top {
  margin-bottom: 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

/* ── Filter Tabs ────────────────────────────────────────────────── */
.filter-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: white;
  background: rgba(255, 255, 255, 0.1);
}

.filter-btn.active {
  background: white;
  color: #667eea;
  border-color: white;
}

/* ── Auctions Container ────────────────────────────────────────── */
.auctions-container {
  max-width: 1200px;
  margin: 0 auto;
  min-height: 400px;
}

/* ── Loading State ─────────────────────────────────────────────── */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p,
.error-state p,
.empty-state p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #5568d3;
}

/* ── Auctions Grid ─────────────────────────────────────────────── */
.auctions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.auction-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.auction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

/* ── Auction Info Section ──────────────────────────────────────── */
.auction-info {
  padding: 24px;
  flex: 0 0 auto;
  border-bottom: 1px solid #e5e7eb;
}

.auction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.auction-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #111827;
  flex: 1;
}

.auction-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.badge-upcoming {
  background: #dbeafe;
  color: #0c4a6e;
}

.badge-active {
  background: #dcfce7;
  color: #15803d;
}

.badge-closed {
  background: #fee2e2;
  color: #7f1d1d;
}

.badge-paid {
  background: #e9d5ff;
  color: #581c87;
}

.auction-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Price Section ────────────────────────────────────────────── */
.price-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.price-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.price-value.has-bid {
  color: #059669;
}

/* ── Countdown Section ────────────────────────────────────────── */
.countdown-section {
  padding: 24px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* ── Responsive Design ────────────────────────────────────────── */
@media (max-width: 768px) {
  .auctions-page {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .auctions-grid {
    grid-template-columns: 1fr;
  }

  .auction-card {
    border-radius: 12px;
  }

  .filter-tabs {
    gap: 8px;
  }

  .filter-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
