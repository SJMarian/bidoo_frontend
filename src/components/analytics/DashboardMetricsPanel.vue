<template>
  <div class="metrics-panel">
    <!-- ── Stat Cards ── -->
    <div class="stat-cards">
      <div class="stat-card stat-card--revenue">
        <span class="stat-card__icon">💰</span>
        <div class="stat-card__body">
          <span class="stat-card__label">Total Revenue</span>
          <span class="stat-card__value">${{ fmt(metrics.totalRevenue) }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--completed">
        <span class="stat-card__icon">✅</span>
        <div class="stat-card__body">
          <span class="stat-card__label">Completed Auctions</span>
          <span class="stat-card__value">{{ metrics.completedAuctions }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--unpaid">
        <span class="stat-card__icon">⏳</span>
        <div class="stat-card__body">
          <span class="stat-card__label">Unpaid Auctions</span>
          <span class="stat-card__value">{{ metrics.unpaidAuctions }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--active">
        <span class="stat-card__icon">🔥</span>
        <div class="stat-card__body">
          <span class="stat-card__label">Active Auctions</span>
          <span class="stat-card__value">{{ metrics.activeAuctions }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--bids">
        <span class="stat-card__icon">🔨</span>
        <div class="stat-card__body">
          <span class="stat-card__label">Total Bids</span>
          <span class="stat-card__value">{{ metrics.totalBids }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--total">
        <span class="stat-card__icon">📦</span>
        <div class="stat-card__body">
          <span class="stat-card__label">Total Auctions</span>
          <span class="stat-card__value">{{ metrics.totalAuctions }}</span>
        </div>
      </div>
    </div>

    <div class="metrics-panel__lower">
      <!-- ── Top Selling Items ── -->
      <div class="card">
        <h3 class="card__title">🏆 Highest-Selling Items</h3>
        <div v-if="metrics.highestSellingItems.length === 0" class="card__empty">
          No completed sales yet.
        </div>
        <ul v-else class="top-list">
          <li v-for="(item, i) in metrics.highestSellingItems" :key="item.auctionId" class="top-list__item">
            <span class="top-list__rank">#{{ i + 1 }}</span>
            <div class="top-list__info">
              <span class="top-list__title">{{ item.title }}</span>
              <span class="top-list__meta">{{ item.category }} · Won by {{ item.winnerUsername }}</span>
            </div>
            <span class="top-list__price">${{ fmt(item.finalPrice) }}</span>
          </li>
        </ul>
      </div>

      <!-- ── Revenue by Category Chart ── -->
      <div class="card">
        <h3 class="card__title">📊 Revenue by Category</h3>
        <div v-if="metrics.revenueByCategory.length === 0" class="card__empty">
          No revenue data yet.
        </div>
        <div v-else class="category-chart">
          <div
            v-for="cat in metrics.revenueByCategory"
            :key="cat.category"
            class="cat-bar"
          >
            <div class="cat-bar__label">
              <span class="cat-bar__name">{{ cat.category }}</span>
              <span class="cat-bar__rev">${{ fmt(cat.revenue) }}</span>
            </div>
            <div class="cat-bar__track">
              <div
                class="cat-bar__fill"
                :style="{ width: barWidth(cat.revenue) + '%' }"
              />
            </div>
            <span class="cat-bar__count">{{ cat.auctionCount }} auction{{ cat.auctionCount !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardMetrics } from '../../types/analytics'

const props = defineProps<{ metrics: DashboardMetrics }>()

function fmt(n: number | null | undefined): string {
  if (n == null) return '0.00'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const maxRevenue = computed(() => {
  if (!props.metrics.revenueByCategory.length) return 1
  return Math.max(...props.metrics.revenueByCategory.map((c) => Number(c.revenue)))
})

function barWidth(revenue: number): number {
  if (maxRevenue.value === 0) return 0
  return Math.max(4, (Number(revenue) / maxRevenue.value) * 100)
}
</script>

<style scoped>
.metrics-panel { display: flex; flex-direction: column; gap: 1.5rem }

/* ── Stat Cards ── */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition: transform 0.15s, box-shadow 0.15s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.2) }

.stat-card__icon { font-size: 1.6rem; flex-shrink: 0 }
.stat-card__body { display: flex; flex-direction: column; gap: 0.15rem }
.stat-card__label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); font-weight: 600 }
.stat-card__value { font-size: 1.3rem; font-weight: 800; color: var(--color-text-primary) }

.stat-card--revenue   { border-left: 3px solid #22c55e }
.stat-card--completed { border-left: 3px solid #818cf8 }
.stat-card--unpaid    { border-left: 3px solid #f59e0b }
.stat-card--active    { border-left: 3px solid #ef4444 }
.stat-card--bids      { border-left: 3px solid #06b6d4 }
.stat-card--total     { border-left: 3px solid #94a3b8 }

/* ── Lower panels ── */
.metrics-panel__lower {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
@media (max-width: 700px) { .metrics-panel__lower { grid-template-columns: 1fr } }

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.card__title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.card__empty { font-size: 0.85rem; color: var(--color-text-muted); text-align: center; padding: 1rem 0 }

/* ── Top List ── */
.top-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem }

.top-list__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  background: var(--color-surface-raised);
  border-radius: 9px;
  border: 1px solid var(--color-border);
}

.top-list__rank { font-size: 0.78rem; font-weight: 800; color: #818cf8; width: 22px; flex-shrink: 0 }
.top-list__info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem }
.top-list__title { font-size: 0.88rem; font-weight: 600; color: var(--color-text-primary) }
.top-list__meta { font-size: 0.73rem; color: var(--color-text-muted) }
.top-list__price { font-size: 0.9rem; font-weight: 800; color: #22c55e; white-space: nowrap }

/* ── Category Chart ── */
.category-chart { display: flex; flex-direction: column; gap: 0.7rem }

.cat-bar { display: flex; flex-direction: column; gap: 0.2rem }

.cat-bar__label { display: flex; justify-content: space-between; align-items: center }
.cat-bar__name { font-size: 0.82rem; font-weight: 600; color: var(--color-text-primary) }
.cat-bar__rev { font-size: 0.8rem; font-weight: 700; color: #22c55e }

.cat-bar__track {
  height: 8px;
  background: var(--color-surface-raised);
  border-radius: 4px;
  overflow: hidden;
}

.cat-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #818cf8);
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.cat-bar__count { font-size: 0.7rem; color: var(--color-text-muted) }
</style>
