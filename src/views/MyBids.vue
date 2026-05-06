<template>
  <div class="my-bids-page">
    <AppNavbar />
    <main class="my-bids-content">
      <header class="page-header">
        <div class="header-text">
          <h1>Active Bids Dashboard</h1>
          <p>Real-time updates for your active auctions and recent activity.</p>
        </div>
        <button class="btn-primary" @click="router.push('/home/create-auction')">
          <PlusCircle class="btn-icon" :size="20" /> Create New Auction
        </button>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">Total items</span>
          </div>
          <div class="stat-value">{{ totalBids }}</div>
          <div class="stat-desc">Past 30 days</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">Active Winning</span>
          </div>
          <div class="stat-value">{{ winningBids }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-title">Outbid</span>
          </div>
          <div class="stat-value">{{ outbidBids }}</div>
          <div class="stat-desc">Action required</div>
        </div>
      </div>

      <div class="table-container">
        <div class="table-header">
          <h2>Items Summary</h2>
        </div>
        <div class="table-responsive">
          <table class="bids-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Current Bid</th>
                <th>Status</th>
                <th>Time Left</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <BidSummaryRow
                v-for="bid in activeBids"
                :key="bid.id"
                :image-url="getImageUrl(bid.image)"
                :item-name="bid.title"
                :current-bid="formatCurrency(bid.currentHighestBid)"
                :status="mapStatus(bid.status)"
                :time-left="formatTimeLeft(bid.timeLeft)"
                :action-type="getActionType(bid.status)"
                @action-click="handleActionClick(bid)"
              />
            </tbody>
          </table>
        </div>
      </div>

      <div class="table-container">
        <div class="table-header">
          <h2>Items Won</h2>
        </div>
        <div class="table-responsive">
          <table class="bids-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in wonItems" :key="item.id">
                <td>
                  <div class="item-info">
                    <div class="item-img" :style="{ backgroundImage: `url(${getImageUrl(item.image)})` }"></div>
                  </div>
                </td>
                <td>
                  <span class="item-name">{{ item.title }}</span>
                </td>
                <td>
                  <span class="status-pill badge-green">
                    <span class="dot" style="background-color: #22c55e;"></span>
                    {{ item.status }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="item.status === 'CLOSED'"
                    class="btn-action-primary"
                    @click="handlePay(item)"
                  >
                    Pay
                  </button>
                  <button
                    v-else
                    class="btn-action-primary"
                    style="background-color: #94a3b8; cursor: not-allowed;"
                    disabled
                  >
                    No action
                  </button>
                </td>
              </tr>
              <tr v-if="wonItems.length === 0">
                <td colspan="4" style="text-align: center; color: #64748b;">No won items yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import BidSummaryRow from '../components/BidSummaryRow.vue'
import { PlusCircle } from 'lucide-vue-next'
import apiClient from '../api/apiClient'

const router = useRouter()

interface AuctionItemResponse {
  id: number
  title: string
  description: string
  image: string
  currentHighestBid: number
  status: string
  timeLeft: number
  minimumBidIncrement?: number
  totalBids?: number
  currency?: string
}

const activeBids = ref<AuctionItemResponse[]>([])
const wonItems = ref<AuctionItemResponse[]>([])

const fetchBids = async () => {
  try {
    const response = await apiClient.get('auction/items-mine')
    if (response.data && Array.isArray(response.data.data)) {
      activeBids.value = response.data.data
    } else if (Array.isArray(response.data)) {
      activeBids.value = response.data
    } else if (response.data && Array.isArray(response.data.content)) {
      activeBids.value = response.data.content
    } else {
      console.log('No items founds')
      activeBids.value = []
    }
  } catch (error) {
    console.error('Failed to fetch user bids:', error)
  }
}

const fetchWonItems = async () => {
  try {
    const response = await apiClient.get('auction/items-won')
    if (response.data && Array.isArray(response.data.data)) {
      wonItems.value = response.data.data
    } else if (Array.isArray(response.data)) {
      wonItems.value = response.data
    } else if (response.data && Array.isArray(response.data.content)) {
      wonItems.value = response.data.content
    } else {
      console.log('No won items found')
      wonItems.value = []
    }
  } catch (error) {
    console.error('Failed to fetch won items:', error)
  }
}

onMounted(() => {
  fetchBids()
  fetchWonItems()
})

const handlePay = (item: AuctionItemResponse) => {
  router.push(`/checkout/${item.id}`)
}

const getImageUrl = (image: string | null) => {
  if (!image) return ''
  if (image.startsWith('http')) return image

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1/'
  const host = baseUrl.replace(/\/api\/v1\/?$/, '')
  return `${host}/${image.startsWith('/') ? image.substring(1) : image}`
}

const formatCurrency = (amount: number) => {
  if (amount == null) return '$0.00'
  return `$${amount.toFixed(2)}`
}

const formatTimeLeft = (milliseconds: number) => {
  if (milliseconds == null) return 'N/A'
  if (milliseconds <= 0) return 'Ended'

  const totalSeconds = Math.floor(milliseconds / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`
}

const mapStatus = (status: string) => {
  // BidSummaryRow expects 'winning' or 'outbid'.
  return status === 'ACTIVE' ? 'winning' : 'outbid'
}

const getActionType = (status: string) => {
  return 'view'
}

const handleActionClick = (bid: AuctionItemResponse) => {
  router.push(`/home/auction/${bid.id}`)
}

const totalBids = computed(() => activeBids.value.length)
const winningBids = computed(
  () => activeBids.value.filter((b) => mapStatus(b.status) === 'winning').length,
)
const outbidBids = computed(
  () => activeBids.value.filter((b) => mapStatus(b.status) === 'outbid').length,
)
</script>

<style scoped>
.my-bids-page {
  min-height: 100vh;
  background-color: #f6f7f8;
  font-family: 'Manrope', sans-serif;
  color: #0f172a;
}
.my-bids-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}
.header-text h1 {
  font-size: 1.875rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 0.25rem;
}
.header-text p {
  color: #64748b;
}
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #197fe6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.2s,
    transform 0.1s;
}
.btn-primary:hover {
  background-color: #1565c0;
}
.btn-primary:active {
  transform: scale(0.95);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.stat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}
.badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 0.5rem;
}
.badge-green {
  background-color: #dcfce7;
  color: #15803d;
}
.badge-blue {
  background-color: rgba(25, 127, 230, 0.1);
  color: #197fe6;
}
.badge-red {
  background-color: #fee2e2;
  color: #b91c1c;
}
.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
}
.stat-desc {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
}
.table-container {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
}
.table-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.table-header h2 {
  font-size: 1.125rem;
  font-weight: 700;
}
.btn-link {
  background: transparent;
  border: none;
  color: #197fe6;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-link:hover {
  text-decoration: underline;
}
.table-responsive {
  overflow-x: auto;
}
.bids-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.bids-table th {
  padding: 0.75rem 1.5rem;
  background-color: #f8fafc;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.bids-table td {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
}
.item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.item-img {
  width: 40px;
  height: 40px;
  border-radius: 0.25rem;
  background-color: #f1f5f9;
  background-size: cover;
  background-position: center;
}
.item-name {
  font-size: 0.875rem;
  font-weight: 600;
}
.bid-amount {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}
.status-winning {
  background-color: #dcfce7;
  color: #166534;
}
.status-winning .dot {
  width: 6px;
  height: 6px;
  background-color: #22c55e;
  border-radius: 50%;
}
.status-outbid {
  background-color: #fee2e2;
  color: #991b1b;
}
.status-outbid .dot {
  width: 6px;
  height: 6px;
  background-color: #ef4444;
  border-radius: 50%;
}
.time-left {
  font-size: 0.875rem;
  color: #64748b;
}
.btn-action-link {
  background: transparent;
  border: none;
  color: #197fe6;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
}
.btn-action-link:hover {
  color: #1e3a8a;
}
.btn-action-primary {
  background-color: #197fe6;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
}
</style>
