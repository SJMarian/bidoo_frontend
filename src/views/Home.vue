<template>
  <div class="dashboard-page">
    <AppNavbar />

    <main class="dashboard-content">
      <div class="header">
        <h1>Home</h1>
      </div>

      <div class="filter-card">
        <h2>Search & Filter Auctions</h2>

        <div class="filter-grid">
          <input v-model="filters.keyword" placeholder="Search title..." />

          <select v-model="filters.status">
            <option value="">All Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
            <option value="PAID">Paid</option>
          </select>

          <input v-model.number="filters.minPrice" type="number" placeholder="Min price" />
          <input v-model.number="filters.maxPrice" type="number" placeholder="Max price" />

          <select v-model="filters.endingSoon">
            <option value="">Any Ending Time</option>
            <option value="true">Ending Soon</option>
          </select>

          <input v-model.number="filters.minBids" type="number" placeholder="Minimum bids" />

          <select v-model="selectedCurrency">
            <option value="BDT">BDT</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div class="filter-actions">
          <button @click="searchItems">Apply Filters</button>
          <button class="secondary" @click="resetFilters">Reset</button>
        </div>
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
            :currentBid="getDisplayBid(item)"
            :originalBid="item.currentHighestBid"
            :currency="item.currency"
            :status="item.status"
            :isLive="item.status === 'ACTIVE'"
            :bidIncrement="item.minimumBidIncrement"
            @bid="(amount) => handleBid(amount, item.id)"
            @pay="handlePay(item.id)"
          />
        </div>

        <div v-else class="no-items">
          <p>No auction items available.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AuctionItemCard from '../components/AuctionItemCard.vue'
import apiClient from '../api/apiClient'
import { useToast } from '../composables/useToast'

const router = useRouter()
const toast = useToast()

interface AuctionItemResponse {
  id: number
  title: string
  description: string
  image: string
  currentHighestBid: number
  status: string
  timeLeft: number
  minimumBidIncrement: number
  currency?: string
}

const auctionItems = ref<AuctionItemResponse[]>([])
const convertedPrices = ref<Record<number, number>>({})
const selectedCurrency = ref('BDT')

const filters = reactive({
  keyword: '',
  status: '',
  minPrice: null as number | null,
  maxPrice: null as number | null,
  endingSoon: '',
  minBids: null as number | null,
})

const fetchItems = async () => {
  try {
    const response = await apiClient.get('auction/items-others')
    auctionItems.value = response.data?.data || []
    await convertAllPrices()
  } catch (error) {
    console.error('Failed to fetch auction items:', error)
  }
}

const searchItems = async () => {
  try {
    const params: any = {}

    if (filters.status) params.status = filters.status
    if (filters.minPrice !== null) params.minPrice = filters.minPrice
    if (filters.maxPrice !== null) params.maxPrice = filters.maxPrice
    if (filters.endingSoon) params.endingSoon = filters.endingSoon
    if (filters.minBids !== null) params.minBids = filters.minBids

    const response = await apiClient.get('auction/search', { params })
    let items = response.data?.data || []

    if (filters.keyword.trim()) {
      const keyword = filters.keyword.toLowerCase()
      items = items.filter((item: AuctionItemResponse) =>
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      )
    }

    auctionItems.value = items
    await convertAllPrices()
  } catch (error) {
    console.error('Failed to search auctions:', error)
    toast.error('Failed to search auctions')
  }
}

const resetFilters = async () => {
  filters.keyword = ''
  filters.status = ''
  filters.minPrice = null
  filters.maxPrice = null
  filters.endingSoon = ''
  filters.minBids = null
  await fetchItems()
}

const convertAllPrices = async () => {
  convertedPrices.value = {}

  for (const item of auctionItems.value) {
    try {
      const fromCurrency = item.currency || 'BDT'

      if (fromCurrency === selectedCurrency.value) {
        convertedPrices.value[item.id] = item.currentHighestBid
        continue
      }

      const response = await apiClient.get('currency/convert', {
        params: {
          amount: item.currentHighestBid,
          from: fromCurrency,
          to: selectedCurrency.value,
        },
      })

      convertedPrices.value[item.id] = response.data?.data || item.currentHighestBid
    } catch {
      convertedPrices.value[item.id] = item.currentHighestBid
    }
  }
}

watch(selectedCurrency, convertAllPrices)

const getDisplayBid = (item: AuctionItemResponse) => {
  return convertedPrices.value[item.id] ?? item.currentHighestBid
}

onMounted(fetchItems)

const getImageUrl = (image: string | null) => {
  if (!image) return ''
  if (image.startsWith('http')) return image

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1/'
  const host = baseUrl.replace(/\/api\/v1\/?$/, '')
  return `${host}/${image.startsWith('/') ? image.substring(1) : image}`
}

const handleBid = async (amount: number, itemId: number) => {
  try {
    await apiClient.post('bids', {
      auctionItemId: itemId,
      bidAmount: amount,
    })

    toast.success('Bid placed successfully')
    await searchItems()
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to place bid')
  }
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

.filter-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.filter-card h2 {
  margin-bottom: 1rem;
  color: #1e293b;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.filter-grid input,
.filter-grid select {
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.filter-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.filter-actions button {
  background: #197fe6;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.filter-actions .secondary {
  background: #64748b;
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
  color: #64748b;
}
</style>