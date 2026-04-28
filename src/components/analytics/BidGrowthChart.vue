<template>
  <div class="chart-panel">
    <div class="chart-panel__header">
      <h3 class="chart-panel__title">📈 Bid Growth Trend</h3>
      <div class="chart-panel__controls">
        <input
          v-model.number="auctionIdInput"
          type="number"
          class="chart-input"
          placeholder="Auction ID"
          min="1"
          @keyup.enter="loadTrend"
        />
        <button class="chart-btn" :disabled="!auctionIdInput || loading" @click="loadTrend">
          {{ loading ? '…' : 'Load' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="chart-error">⚠ {{ error }}</div>

    <div v-if="!trend && !loading" class="chart-empty">
      Enter an auction ID above to view its bid growth trend.
    </div>

    <div v-if="trend">
      <!-- Summary strip -->
      <div class="trend-summary">
        <div class="trend-stat">
          <span class="trend-stat__label">Auction</span>
          <span class="trend-stat__value">{{ trend.auctionTitle }}</span>
        </div>
        <div class="trend-stat">
          <span class="trend-stat__label">Starting Price</span>
          <span class="trend-stat__value">${{ fmt(trend.startingPrice) }}</span>
        </div>
        <div class="trend-stat">
          <span class="trend-stat__label">Current Highest</span>
          <span class="trend-stat__value trend-stat__value--accent">${{ fmt(trend.currentHighestBid) }}</span>
        </div>
        <div class="trend-stat">
          <span class="trend-stat__label">Total Bids</span>
          <span class="trend-stat__value">{{ trend.totalBids }}</span>
        </div>
        <div class="trend-stat">
          <span class="trend-stat__label">Growth</span>
          <span class="trend-stat__value trend-stat__value--growth">+{{ trend.growthPercent }}%</span>
        </div>
      </div>

      <!-- SVG Line Chart -->
      <div v-if="trend.bidProgression.length === 0" class="chart-empty">
        No bids placed yet on this auction.
      </div>

      <div v-else class="chart-container">
        <svg
          :viewBox="`0 0 ${W} ${H}`"
          class="chart-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Grid lines -->
          <g class="grid">
            <line
              v-for="y in yGridLines"
              :key="y.value"
              :x1="PAD_L"
              :y1="y.py"
              :x2="W - PAD_R"
              :y2="y.py"
              class="grid-line"
            />
            <text
              v-for="y in yGridLines"
              :key="'label-' + y.value"
              :x="PAD_L - 6"
              :y="y.py + 4"
              class="axis-label"
              text-anchor="end"
            >${{ fmtShort(y.value) }}</text>
          </g>

          <!-- Area fill -->
          <path :d="areaPath" class="chart-area" />

          <!-- Line -->
          <path :d="linePath" class="chart-line" />

          <!-- Data points -->
          <g v-for="pt in chartPoints" :key="pt.bidNumber">
            <circle
              :cx="pt.px"
              :cy="pt.py"
              r="5"
              class="chart-dot"
              @mouseenter="hovered = pt"
              @mouseleave="hovered = null"
            />
          </g>

          <!-- Tooltip -->
          <g v-if="hovered">
            <rect
              :x="tooltipX(hovered.px)"
              :y="hovered.py - 52"
              width="160"
              height="46"
              rx="6"
              class="tooltip-bg"
            />
            <text :x="tooltipX(hovered.px) + 8" :y="hovered.py - 34" class="tooltip-text tooltip-text--bold">
              {{ hovered.bidderUsername }}
            </text>
            <text :x="tooltipX(hovered.px) + 8" :y="hovered.py - 18" class="tooltip-text">
              ${{ fmt(hovered.amount) }} · Bid #{{ hovered.bidNumber }}
            </text>
          </g>

          <!-- X-axis bid numbers -->
          <g>
            <text
              v-for="pt in chartPoints"
              :key="'x-' + pt.bidNumber"
              :x="pt.px"
              :y="H - PAD_B + 16"
              class="axis-label"
              text-anchor="middle"
            >#{{ pt.bidNumber }}</text>
          </g>

          <!-- Starting price dotted line -->
          <line
            :x1="PAD_L"
            :y1="startingPriceY"
            :x2="W - PAD_R"
            :y2="startingPriceY"
            class="starting-line"
          />
          <text
            :x="W - PAD_R + 4"
            :y="startingPriceY + 4"
            class="starting-label"
          >Start</text>
        </svg>
      </div>

      <!-- Bid table -->
      <div class="bid-table-wrap">
        <table class="bid-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Bidder</th>
              <th>Amount</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pt in [...trend.bidProgression].reverse()" :key="pt.bidNumber"
              :class="{ 'bid-table__row--highest': pt.bidNumber === trend.totalBids }"
            >
              <td>#{{ pt.bidNumber }}</td>
              <td>{{ pt.bidderUsername }}</td>
              <td class="td-amount">${{ fmt(pt.amount) }}</td>
              <td class="td-time">{{ formatTime(pt.placedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { analyticsApi } from '../../services/analyticsApi'
import type { BidGrowthTrend, BidDataPoint } from '../../types/analytics'

const auctionIdInput = ref<number | null>(null)
const trend = ref<BidGrowthTrend | null>(null)
const loading = ref(false)
const error = ref('')
const hovered = ref<(BidDataPoint & { px: number; py: number }) | null>(null)

// Chart dimensions
const W = 700
const H = 320
const PAD_L = 70
const PAD_R = 50
const PAD_T = 20
const PAD_B = 40

async function loadTrend() {
  if (!auctionIdInput.value) return
  loading.value = true
  error.value = ''
  hovered.value = null
  try {
    trend.value = await analyticsApi.getBidGrowthTrend(auctionIdInput.value)
  } catch (e: any) {
    error.value = e.message
    trend.value = null
  } finally {
    loading.value = false
  }
}

// ── Chart computation ─────────────────────────────────────────────────────────

const chartPoints = computed(() => {
  if (!trend.value || trend.value.bidProgression.length === 0) return []
  const pts = trend.value.bidProgression
  const amounts = pts.map((p) => Number(p.amount))
  const minY = Math.min(Number(trend.value.startingPrice), ...amounts) * 0.97
  const maxY = Math.max(...amounts) * 1.03

  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  return pts.map((p, i) => ({
    ...p,
    px: pts.length === 1
      ? PAD_L + chartW / 2
      : PAD_L + (i / (pts.length - 1)) * chartW,
    py: PAD_T + chartH - ((Number(p.amount) - minY) / (maxY - minY)) * chartH,
  }))
})

const linePath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  return chartPoints.value
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px} ${p.py}`)
    .join(' ')
})

const areaPath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  const bottom = H - PAD_B
  const first = chartPoints.value[0]!
  const last = chartPoints.value[chartPoints.value.length - 1]!
  return (
    linePath.value +
    ` L ${last.px} ${bottom} L ${first.px} ${bottom} Z`
  )
})

const yGridLines = computed(() => {
  if (!trend.value) return []
  const pts = trend.value.bidProgression.map((p) => Number(p.amount))
  const minY = Math.min(Number(trend.value.startingPrice), ...pts) * 0.97
  const maxY = Math.max(...pts) * 1.03
  const chartH = H - PAD_T - PAD_B
  const lines = []
  const steps = 5
  for (let i = 0; i <= steps; i++) {
    const value = minY + ((maxY - minY) * i) / steps
    const py = PAD_T + chartH - ((value - minY) / (maxY - minY)) * chartH
    lines.push({ value, py })
  }
  return lines
})

const startingPriceY = computed(() => {
  if (!trend.value || trend.value.bidProgression.length === 0) return PAD_T
  const pts = trend.value.bidProgression.map((p) => Number(p.amount))
  const minY = Math.min(Number(trend.value.startingPrice), ...pts) * 0.97
  const maxY = Math.max(...pts) * 1.03
  const chartH = H - PAD_T - PAD_B
  return PAD_T + chartH - ((Number(trend.value.startingPrice) - minY) / (maxY - minY)) * chartH
})

function tooltipX(px: number): number {
  return px > W - PAD_R - 170 ? px - 168 : px + 8
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '0.00'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtShort(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toFixed(0)
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso),
  )
}
</script>

<style scoped>
.chart-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.chart-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.chart-panel__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.chart-panel__controls { display: flex; gap: 0.5rem }

.chart-input {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  padding: 0.45rem 0.85rem;
  font-size: 0.88rem;
  width: 120px;
}
.chart-input:focus { outline: none; border-color: var(--color-accent) }

.chart-btn {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.chart-btn:hover:not(:disabled) { filter: brightness(1.1) }
.chart-btn:disabled { opacity: 0.5; cursor: not-allowed }

.chart-error { font-size: 0.83rem; color: var(--color-danger); background: rgba(239,68,68,0.1); border-radius: 8px; padding: 0.6rem 0.9rem }
.chart-empty { text-align: center; padding: 2rem; font-size: 0.88rem; color: var(--color-text-muted) }

/* ── Summary strip ── */
.trend-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--color-surface-raised);
  border-radius: 10px;
  padding: 0.85rem 1.1rem;
  border: 1px solid var(--color-border);
}

.trend-stat { display: flex; flex-direction: column; gap: 0.15rem }
.trend-stat__label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); font-weight: 600 }
.trend-stat__value { font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary) }
.trend-stat__value--accent { color: #818cf8 }
.trend-stat__value--growth { color: #22c55e }

/* ── SVG Chart ── */
.chart-container {
  background: var(--color-surface-raised);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.chart-svg { width: 100%; height: auto; display: block }

.grid-line { stroke: rgba(255,255,255,0.05); stroke-width: 1 }
.axis-label { font-size: 11px; fill: #475569; font-family: monospace }

.chart-area { fill: url(#areaGradient); fill: rgba(99,102,241,0.1) }
.chart-line { fill: none; stroke: #6366f1; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round }
.chart-dot { fill: #6366f1; stroke: var(--color-surface-raised); stroke-width: 2; cursor: pointer; transition: r 0.1s }
.chart-dot:hover { r: 7 }

.starting-line { stroke: #f59e0b; stroke-width: 1.5; stroke-dasharray: 5,4 }
.starting-label { font-size: 10px; fill: #f59e0b; font-family: monospace }

.tooltip-bg { fill: #1e293b; rx: 6; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4)) }
.tooltip-text { font-size: 11px; fill: #e2e8f0; font-family: sans-serif }
.tooltip-text--bold { font-weight: 700; fill: #fff }

/* ── Bid table ── */
.bid-table-wrap { overflow-x: auto; max-height: 240px; overflow-y: auto }

.bid-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.bid-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
}

.bid-table td {
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.bid-table__row--highest td { background: rgba(99,102,241,0.07); font-weight: 600 }
.bid-table__row--highest .td-amount { color: #22c55e }

.td-amount { font-weight: 700; color: var(--color-success) }
.td-time { color: var(--color-text-muted); font-size: 0.75rem; white-space: nowrap }
</style>
