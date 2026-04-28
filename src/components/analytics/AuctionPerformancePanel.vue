<template>
  <div class="auction-performance-panel">
    <h3>🎯 Auction Performance Analytics</h3>
    
    <div class="controls">
      <button @click="loadData" :disabled="loading" class="btn btn-primary">
        <span v-if="!loading">🔄 Refresh Data</span>
        <span v-else>⏳ Loading...</span>
      </button>
      <span v-if="lastUpdated" class="last-updated">
        Last updated: {{ formatTime(lastUpdated) }}
      </span>
    </div>

    <div v-if="loading" class="loading">
      Loading performance data...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else>
      <!-- Top Performing Auctions -->
      <div class="performance-section">
        <h4>🏆 Top Performing Auctions</h4>
        <div class="performance-grid">
          <div v-for="auction in topAuctions" :key="auction.auctionId" class="performance-card">
            <div class="card-header">
              <h5>{{ auction.title }}</h5>
              <span class="engagement-score">Score: {{ auction.engagementScore.toFixed(1) }}</span>
            </div>
            <div class="card-body">
              <div class="metric-row">
                <span class="label">Category:</span>
                <span class="value">{{ auction.category }}</span>
              </div>
              <div class="metric-row">
                <span class="label">Starting Price:</span>
                <span class="value">${{ auction.startingPrice.toFixed(2) }}</span>
              </div>
              <div class="metric-row">
                <span class="label">Final Price:</span>
                <span class="value">${{ auction.finalPrice.toFixed(2) }}</span>
              </div>
              <div class="metric-row">
                <span class="label">Price Growth:</span>
                <span class="value" :style="{ color: auction.priceGrowthPercent > 0 ? '#22c55e' : '#ef4444' }">
                  {{ auction.priceGrowthPercent.toFixed(1) }}%
                </span>
              </div>
              <div class="metric-row">
                <span class="label">Bids:</span>
                <span class="value">{{ auction.bidCount }}</span>
              </div>
              <div class="metric-row">
                <span class="label">Status:</span>
                <span class="badge" :class="getBadgeClass(auction.status)">
                  {{ auction.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance by Category -->
      <div class="performance-section">
        <h4>📊 Performance by Category</h4>
        <div class="category-grid">
          <div v-for="(category, categoryName) in categoryPerformance" :key="categoryName" class="category-card">
            <h5>{{ categoryName }}</h5>
            <div class="stat">
              <span class="stat-label">Total Auctions:</span>
              <span class="stat-value">{{ category.totalAuctions }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Total Bids:</span>
              <span class="stat-value">{{ category.totalBids }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Avg Price Growth:</span>
              <span class="stat-value" :style="{ color: category.averagePriceGrowth > 0 ? '#22c55e' : '#ef4444' }">
                {{ category.averagePriceGrowth.toFixed(1) }}%
              </span>
            </div>
            <div class="stat">
              <span class="stat-label">Avg Engagement:</span>
              <span class="stat-value">{{ category.averageEngagementScore.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- All Auctions Table -->
      <div class="performance-section">
        <h4>📋 All Auctions Performance</h4>
        <table class="performance-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Starting</th>
              <th>Final</th>
              <th>Growth %</th>
              <th>Bids</th>
              <th>Engagement</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="auction in allAuctions" :key="auction.auctionId">
              <td>{{ auction.title }}</td>
              <td>{{ auction.category }}</td>
              <td>${{ auction.startingPrice.toFixed(2) }}</td>
              <td>${{ auction.finalPrice.toFixed(2) }}</td>
              <td :style="{ color: auction.priceGrowthPercent > 0 ? '#22c55e' : '#ef4444' }">
                {{ auction.priceGrowthPercent.toFixed(1) }}%
              </td>
              <td>{{ auction.bidCount }}</td>
              <td>{{ auction.engagementScore.toFixed(1) }}</td>
              <td>
                <span class="badge" :class="getBadgeClass(auction.status)">
                  {{ auction.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { analyticsExtendedApi } from '@/services/analyticsExtendedApi';
import type { AuctionPerformance, CategoryPerformance } from '@/services/analyticsExtendedApi';

const loading = ref(false);
const error = ref('');
const lastUpdated = ref<Date | null>(null);
const topAuctions = ref<AuctionPerformance[]>([]);
const allAuctions = ref<AuctionPerformance[]>([]);
const categoryPerformance = ref<Record<string, CategoryPerformance>>({});

const loadData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const [topRes, allRes, categoryRes] = await Promise.all([
      analyticsExtendedApi.getTopAuctions(5),
      analyticsExtendedApi.getAllAuctionsPerformance(),
      analyticsExtendedApi.getPerformanceByCategory()
    ]);

    topAuctions.value = topRes;
    allAuctions.value = allRes;
    categoryPerformance.value = categoryRes;
    lastUpdated.value = new Date();
  } catch (err) {
    error.value = 'Failed to load auction performance data';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const getBadgeClass = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'active') return 'badge-active';
  if (statusLower === 'completed' || statusLower === 'paid') return 'badge-success';
  if (statusLower === 'pending') return 'badge-warning';
  return 'badge-default';
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.auction-performance-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.auction-performance-panel h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #6366f1;
  padding-bottom: 10px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
  gap: 15px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.last-updated {
  font-size: 12px;
  color: #999;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  background-color: #fee2e2;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 4px solid #ef4444;
}

.performance-section {
  margin: 20px 0;
}

.performance-section h4 {
  color: #555;
  margin-bottom: 15px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.performance-card {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.performance-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #f3f4f6;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: start;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h5 {
  margin: 0;
  font-size: 14px;
  color: #333;
  flex: 1;
}

.engagement-score {
  background-color: #6366f1;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.card-body {
  padding: 12px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid #f3f4f6;
}

.metric-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-active {
  background-color: #fef08a;
  color: #854d0e;
}

.badge-success {
  background-color: #dcfce7;
  color: #166534;
}

.badge-warning {
  background-color: #fed7aa;
  color: #92400e;
}

.badge-default {
  background-color: #e5e7eb;
  color: #374151;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.category-card {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 15px;
  background-color: #f9fafb;
}

.category-card h5 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid #e5e7eb;
}

.stat:last-child {
  border-bottom: none;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

.performance-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.performance-table th {
  background-color: #f3f4f6;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #d1d5db;
}

.performance-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.performance-table tbody tr:hover {
  background-color: #f9fafb;
}
</style>
