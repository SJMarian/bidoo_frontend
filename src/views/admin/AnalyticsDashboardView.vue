<template>
  <div class="analytics-page">
    <!-- ── Header ── -->
    <header class="analytics-page__header">
      <div>
        <h1 class="analytics-page__title">Analytics Dashboard</h1>
        <p class="analytics-page__subtitle">Revenue, winners, transactions and bid trends</p>
      </div>
      <div class="analytics-page__header-actions">
        <NotificationBadge :userId="userId" />
        <button class="refresh-btn" :class="{ spinning: metricsLoading }" @click="loadMetrics" title="Refresh">↻</button>
      </div>
    </header>

    <!-- ── Tab Navigation ── -->
    <nav class="analytics-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="analytics-tab"
        :class="{ 'analytics-tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </nav>

    <!-- ── Tab Content ── -->

    <!-- Dashboard Metrics -->
    <div v-if="activeTab === 'dashboard'">
      <div v-if="metricsLoading" class="loading-state">
        <div class="spinner" />
        <p>Loading metrics…</p>
      </div>
      <div v-else-if="metricsError" class="error-banner">⚠ {{ metricsError }}</div>
      <DashboardMetricsPanel v-else-if="metrics" :metrics="metrics" />
    </div>

    <!-- Winner Determination -->
    <div v-if="activeTab === 'winners'">
      <WinnerDeterminationPanel />
    </div>

    <!-- Transaction Records -->
    <div v-if="activeTab === 'transactions'">
      <TransactionRecordsPanel />
    </div>

    <!-- Bid Growth Trend -->
    <div v-if="activeTab === 'trends'">
      <BidGrowthChart />
    </div>

    <!-- Auction Performance Analytics -->
    <div v-if="activeTab === 'performance'">
      <AuctionPerformancePanel />
    </div>

    <!-- Auto-Refresh Status -->
    <div v-if="showAutoRefreshStatus" class="auto-refresh-status">
      <span>🔄 Auto-refresh enabled</span>
      <span v-if="lastAutoRefresh" class="refresh-time">Last: {{ formatRefreshTime(lastAutoRefresh) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DashboardMetricsPanel from '../../components/analytics/DashboardMetricsPanel.vue'
import WinnerDeterminationPanel from '../../components/analytics/WinnerDeterminationPanel.vue'
import TransactionRecordsPanel from '../../components/analytics/TransactionRecordsPanel.vue'
import BidGrowthChart from '../../components/analytics/BidGrowthChart.vue'
import NotificationBadge from '../../components/notifications/NotificationBadge.vue'
import ExportPanel from '../../components/analytics/ExportPanel.vue'
import AuctionPerformancePanel from '../../components/analytics/AuctionPerformancePanel.vue'
import { analyticsApi } from '../../services/analyticsApi'
import { useAutoRefresh } from '../../composables/useAnalyticsEnhancements'
import type { DashboardMetrics } from '../../types/analytics'

type TabId = 'dashboard' | 'winners' | 'transactions' | 'trends' | 'performance'

// Hardcoded userId - in a real app, this would come from auth context
const userId = ref(8) // Admin user ID

const activeTab = ref<TabId>('dashboard')

const tabs = [
  { id: 'dashboard' as TabId,    icon: '📊', label: 'Dashboard' },
  { id: 'winners' as TabId,      icon: '🏆', label: 'Winner Determination' },
  { id: 'transactions' as TabId, icon: '📄', label: 'Transaction Records' },
  { id: 'trends' as TabId,       icon: '📈', label: 'Bid Growth Trends' },
  { id: 'performance' as TabId,  icon: '🎯', label: 'Auction Performance' },
]

const metrics = ref<DashboardMetrics | null>(null)
const metricsLoading = ref(false)
const metricsError = ref('')
const showAutoRefreshStatus = ref(true)
const lastAutoRefresh = ref<Date | null>(null)
let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

async function loadMetrics() {
  metricsLoading.value = true
  metricsError.value = ''
  try {
    metrics.value = await analyticsApi.getDashboard()
    lastAutoRefresh.value = new Date()
  } catch (e: any) {
    metricsError.value = e.message
  } finally {
    metricsLoading.value = false
  }
}

const startAutoRefresh = () => {
  // Initial load
  loadMetrics()

  // Auto-refresh every 45 seconds for dashboard tab
  autoRefreshInterval = setInterval(() => {
    if (activeTab.value === 'dashboard') {
      loadMetrics()
    }
  }, 45000)
}

const stopAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = null
  }
}

const formatRefreshTime = (date: Date) => {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return date.toLocaleTimeString()
}

onMounted(() => {
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text-primary);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ── */
.analytics-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.analytics-page__header-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.analytics-page__title {
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  margin: 0;
}

.analytics-page__subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin: 0.3rem 0 0;
}

.refresh-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  width: 38px;
  height: 38px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.refresh-btn:hover { border-color: var(--color-accent); color: var(--color-accent) }
.refresh-btn.spinning { animation: spin 0.8s linear infinite }
@keyframes spin { to { transform: rotate(360deg) } }

/* ── Tab Navigation ── */
.analytics-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0;
}

.analytics-tab {
  padding: 0.6rem 1.1rem;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
  border-radius: 6px 6px 0 0;
}
.analytics-tab:hover { color: var(--color-text-primary); background: rgba(255,255,255,0.03) }
.analytics-tab--active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  background: rgba(99,102,241,0.05);
}

/* ── Loading / Error ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  color: var(--color-text-muted);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-banner {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #ef4444;
  font-size: 0.88rem;
}

/* ── Auto-Refresh Status ── */
.auto-refresh-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #22c55e;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: slideInUp 0.3s ease-out;
}

.refresh-time {
  font-size: 0.75rem;
  color: rgba(34, 197, 94, 0.7);
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
