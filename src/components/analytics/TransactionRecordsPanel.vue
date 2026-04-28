<template>
  <div class="txn-panel">
    <div class="txn-panel__header">
      <h3 class="txn-panel__title">📄 Transaction Records</h3>
      <button class="refresh-btn" @click="load">↻ Refresh</button>
    </div>

    <div v-if="loading" class="txn-panel__state">Loading transactions…</div>
    <div v-else-if="error" class="txn-panel__state txn-panel__state--error">⚠ {{ error }}</div>
    <div v-else-if="records.length === 0" class="txn-panel__state">No transaction records found.</div>

    <div v-else class="txn-table-wrap">
      <table class="txn-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Auction</th>
            <th>Winner</th>
            <th>Seller</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Gateway TXN</th>
            <th>Date</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rec in records" :key="rec.orderId">
            <td class="td-mono">#{{ rec.orderId }}</td>
            <td class="td-title">{{ rec.auctionTitle }}</td>
            <td>{{ rec.winnerUsername }}</td>
            <td>{{ rec.sellerUsername }}</td>
            <td class="td-amount">${{ fmt(rec.paymentAmount) }} {{ rec.currency }}</td>
            <td>
              <span class="status-pill" :class="statusClass(rec.paymentStatus)">
                {{ rec.paymentStatus }}
              </span>
            </td>
            <td class="td-mono td-trunc">{{ rec.gatewayTrxId }}</td>
            <td class="td-date">{{ formatDate(rec.createdAt) }}</td>
            <td>
              <button
                class="invoice-btn"
                @click="downloadInvoice(rec.orderId)"
                :disabled="invoiceLoading === rec.orderId"
              >
                {{ invoiceLoading === rec.orderId ? '…' : '📥' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Invoice preview modal -->
    <div v-if="invoiceData" class="invoice-modal-backdrop" @click.self="invoiceData = null">
      <div class="invoice-modal">
        <InvoicePrintView :invoice="invoiceData" @close="invoiceData = null" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { analyticsApi } from '../../services/analyticsApi'
import InvoicePrintView from './InvoicePrintView.vue'
import type { TransactionRecord, InvoiceData } from '../../types/analytics'

const records = ref<TransactionRecord[]>([])
const loading = ref(false)
const error = ref('')
const invoiceLoading = ref<number | null>(null)
const invoiceData = ref<InvoiceData | null>(null)

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    records.value = await analyticsApi.getAllTransactions()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function downloadInvoice(orderId: number) {
  invoiceLoading.value = orderId
  try {
    invoiceData.value = await analyticsApi.getInvoice(orderId)
  } catch (e: any) {
    alert('Could not load invoice: ' + e.message)
  } finally {
    invoiceLoading.value = null
  }
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '0.00'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}

function statusClass(status: string): string {
  if (status === 'SUCCESS') return 'status-pill--success'
  if (status === 'FAILED') return 'status-pill--danger'
  return 'status-pill--warning'
}
</script>

<style scoped>
.txn-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.txn-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.txn-panel__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.refresh-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  color: var(--color-text-muted);
  padding: 0.35rem 0.75rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}
.refresh-btn:hover { color: var(--color-accent); border-color: var(--color-accent) }

.txn-panel__state { text-align: center; padding: 2rem; font-size: 0.88rem; color: var(--color-text-muted) }
.txn-panel__state--error { color: var(--color-danger) }

.txn-table-wrap { overflow-x: auto }

.txn-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.txn-table th {
  text-align: left;
  padding: 0.6rem 0.85rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.txn-table td {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  vertical-align: middle;
}

.txn-table tr:hover td { background: rgba(255,255,255,0.02) }

.td-mono { font-family: monospace; font-size: 0.78rem; color: var(--color-text-muted) }
.td-title { font-weight: 600; max-width: 160px }
.td-amount { font-weight: 700; color: #22c55e; white-space: nowrap }
.td-date { white-space: nowrap; color: var(--color-text-muted) }
.td-trunc { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }

.status-pill {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  text-transform: uppercase;
}
.status-pill--success { background: rgba(34,197,94,0.15); color: #22c55e }
.status-pill--danger  { background: rgba(239,68,68,0.15); color: #ef4444 }
.status-pill--warning { background: rgba(245,158,11,0.15); color: #f59e0b }

.invoice-btn {
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.3);
  color: #818cf8;
  border-radius: 6px;
  padding: 0.3rem 0.55rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
}
.invoice-btn:hover:not(:disabled) { background: rgba(99,102,241,0.2) }
.invoice-btn:disabled { opacity: 0.5; cursor: not-allowed }

/* ── Invoice Modal ── */
.invoice-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.invoice-modal {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 1rem;
}
</style>
