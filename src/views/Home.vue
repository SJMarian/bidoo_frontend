<template>
  <div class="dashboard-page">
    <AppNavbar />
    <main class="dashboard-content">
      <div class="header">
        <h1>Home</h1>
      </div>
      <div class="demo-auctions">
        <h2>Auction Items</h2>
        <div class="auction-grid" v-if="auctionItems.length > 0">
          <AuctionItemCard
            v-for="item in auctionItems"
            :key="item.id"
            :id="item.id"
            :title="item.title"
            :description="item.description"
            :imageUrl="getImageUrl(item.image)"
            :currentBid="item.currentHighestBid"
            :isLive="item.status === 'LIVE'"
            @bid="(amount) => handleBid(amount, item.id)"
            @pay="handlePay(item.id)"
            :bidIncrement="item.minimumBidIncrement"
          />
        </div>
        <div v-else class="no-items">
          <p>No auction items available at the moment.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AuctionItemCard from '../components/AuctionItemCard.vue'
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
  minimumBidIncrement: number
}

const auctionItems = ref<AuctionItemResponse[]>([])

const fetchItems = async () => {
  try {
    const response = await apiClient.get('auction/items-others')
    if (response.data && Array.isArray(response.data.data)) {
      auctionItems.value = response.data.data
    } else if (Array.isArray(response.data)) {
      auctionItems.value = response.data
    } else if (response.data && Array.isArray(response.data.content)) {
      auctionItems.value = response.data.content
    } else {
      auctionItems.value = []
    }
  } catch (error) {
    console.error('Failed to fetch auction items:', error)
  }
}

onMounted(() => {
  fetchItems()
})

const getImageUrl = (image: string | null) => {
  if (!image) return ''
  if (image.startsWith('http')) return image

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1/'
  const host = baseUrl.replace(/\/api\/v1\/?$/, '')
  return `${host}/${image.startsWith('/') ? image.substring(1) : image}`
}

const handleBid = (amount: number, itemId: number) => {
  alert(`Bid of $${amount} placed on item ${itemId}!`)
}

const handlePay = (itemId: number) => {
  router.push(`/checkout/${itemId}`)
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

.demo-auctions {
  margin-top: 3rem;
}

.demo-auctions h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.auction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.no-items {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #64748b;
  font-size: 1.125rem;
}
</style>
