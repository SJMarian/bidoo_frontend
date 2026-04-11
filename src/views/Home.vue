<template>
  <div class="dashboard-page">
    <AppNavbar />
    <main class="dashboard-content">
      <div class="header">
        <h1>Home</h1>
      </div>
      <div class="demo-auctions">
        <h2>Auction Items</h2>
        <div class="auction-grid">
          <AuctionItemCard
            title="Vintage Rolex Submariner"
            description="Rare 1980s Rolex Submariner in excellent condition with original box and papers."
            imageUrl="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            :currentBid="12500"
            :bidsCount="14"
            :isLive="true"
            @bid="handleBid"
            :bidIncrement="500"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '../components/AppNavbar.vue'
import AuctionItemCard from '../components/AuctionItemCard.vue'

const handleBid = (amount: number) => {
  alert(`Bid of $${amount} placed!`)
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
</style>
