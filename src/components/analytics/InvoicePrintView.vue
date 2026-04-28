<template>
  <div class="invoice">
    <!-- Action bar (only shown on screen, hidden on print) -->
    <div class="invoice__actions no-print">
      <button class="action-btn action-btn--print" @click="printInvoice">🖨 Print / Save PDF</button>
      <button class="action-btn action-btn--close" @click="$emit('close')">✕ Close</button>
    </div>

    <!-- Printable invoice content -->
    <div class="invoice__body" id="invoice-print-area">
      <!-- Header -->
      <div class="invoice__header">
        <div class="invoice__brand">
          <h1 class="invoice__brand-name">BIDOO</h1>
          <p class="invoice__brand-sub">Online Auction Platform</p>
        </div>
        <div class="invoice__meta">
          <div class="invoice__meta-item">
            <span class="invoice__meta-label">Invoice #</span>
            <span class="invoice__meta-value">{{ invoice.invoiceNumber }}</span>
          </div>
          <div class="invoice__meta-item">
            <span class="invoice__meta-label">Order ID</span>
            <span class="invoice__meta-value">#{{ invoice.orderId }}</span>
          </div>
          <div class="invoice__meta-item">
            <span class="invoice__meta-label">Issued</span>
            <span class="invoice__meta-value">{{ formatDate(invoice.issuedAt) }}</span>
          </div>
          <div class="invoice__meta-item">
            <span class="invoice__meta-label">Paid At</span>
            <span class="invoice__meta-value">{{ invoice.paidAt ? formatDate(invoice.paidAt) : 'Pending' }}</span>
          </div>
        </div>
      </div>

      <hr class="invoice__divider" />

      <!-- Parties -->
      <div class="invoice__parties">
        <div class="invoice__party">
          <span class="invoice__party-label">Billed To (Buyer)</span>
          <span class="invoice__party-name">{{ invoice.buyerName }}</span>
          <span class="invoice__party-email">{{ invoice.buyerEmail }}</span>
        </div>
        <div class="invoice__party">
          <span class="invoice__party-label">Sold By</span>
          <span class="invoice__party-name">{{ invoice.sellerName }}</span>
        </div>
      </div>

      <hr class="invoice__divider" />

      <!-- Item -->
      <table class="invoice__table">
        <thead>
          <tr>
            <th class="th-desc">Description</th>
            <th class="th-auction">Auction ID</th>
            <th class="th-qty">Qty</th>
            <th class="th-price">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-title">{{ invoice.auctionTitle }}</div>
              <div class="item-desc">{{ invoice.auctionDescription }}</div>
            </td>
            <td>#{{ invoice.auctionId }}</td>
            <td>1</td>
            <td class="td-price">
              {{ invoice.currency }} {{ fmt(invoice.amount) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="tf-label">Total</td>
            <td class="tf-total">{{ invoice.currency }} {{ fmt(invoice.amount) }}</td>
          </tr>
        </tfoot>
      </table>

      <hr class="invoice__divider" />

      <!-- Payment details -->
      <div class="invoice__payment">
        <div class="invoice__payment-row">
          <span class="invoice__payment-label">Payment Status</span>
          <span class="invoice__payment-value" :class="statusClass">{{ invoice.paymentStatus }}</span>
        </div>
        <div class="invoice__payment-row">
          <span class="invoice__payment-label">Gateway Transaction ID</span>
          <span class="invoice__payment-value invoice__payment-value--mono">{{ invoice.gatewayTrxId }}</span>
        </div>
        <div class="invoice__payment-row">
          <span class="invoice__payment-label">Payment Method</span>
          <span class="invoice__payment-value">SSLCommerz</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="invoice__footer">
        <p>Thank you for using Bidoo — Real-Time Online Auction Platform</p>
        <p>For support, contact: support@bidoo.com</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceData } from '../../types/analytics'

const props = defineProps<{ invoice: InvoiceData }>()
defineEmits(['close'])

function fmt(n: number | null | undefined): string {
  if (n == null) return '0.00'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso))
}

const statusClass = computed(() => {
  if (props.invoice.paymentStatus === 'SUCCESS') return 'invoice__payment-value--success'
  if (props.invoice.paymentStatus === 'FAILED') return 'invoice__payment-value--danger'
  return 'invoice__payment-value--warning'
})

function printInvoice() {
  window.print()
}
</script>

<style scoped>
.invoice { font-family: 'Segoe UI', sans-serif; color: #1a1a2e }

/* ── Actions bar (hidden on print) ── */
.invoice__actions {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 12px 12px 0 0;
}

.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 7px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn--print { background: #1a1a2e; color: #fff }
.action-btn--print:hover { background: #2d2d4e }
.action-btn--close { background: #f1f1f1; color: #555 }
.action-btn--close:hover { background: #e0e0e0 }

/* ── Invoice body ── */
.invoice__body { padding: 2rem 2.5rem; background: #fff }

.invoice__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.invoice__brand-name {
  font-size: 2rem;
  font-weight: 900;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.03em;
}
.invoice__brand-sub { font-size: 0.78rem; color: #888; margin: 0 }

.invoice__meta { display: flex; flex-direction: column; gap: 0.35rem; text-align: right }
.invoice__meta-item { display: flex; gap: 0.75rem; justify-content: flex-end }
.invoice__meta-label { font-size: 0.75rem; color: #888; font-weight: 600; text-transform: uppercase }
.invoice__meta-value { font-size: 0.82rem; font-weight: 700; color: #1a1a2e }

.invoice__divider { border: none; border-top: 1px solid #e8e8e8; margin: 1.5rem 0 }

.invoice__parties { display: flex; gap: 3rem; flex-wrap: wrap }
.invoice__party { display: flex; flex-direction: column; gap: 0.2rem }
.invoice__party-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: #888; font-weight: 600 }
.invoice__party-name { font-size: 1rem; font-weight: 700; color: #1a1a2e }
.invoice__party-email { font-size: 0.82rem; color: #555 }

/* ── Table ── */
.invoice__table { width: 100%; border-collapse: collapse; font-size: 0.88rem }

.invoice__table th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  background: #f8f9fa;
  border-bottom: 2px solid #e8e8e8;
}
.th-price { text-align: right }

.invoice__table td { padding: 0.85rem 0.75rem; border-bottom: 1px solid #f0f0f0; color: #1a1a2e; vertical-align: top }
.td-price { text-align: right; font-weight: 700 }

.item-title { font-weight: 700; color: #1a1a2e }
.item-desc { font-size: 0.78rem; color: #888; margin-top: 0.2rem }

.invoice__table tfoot td { padding: 0.75rem; border-top: 2px solid #1a1a2e }
.tf-label { font-weight: 700; text-align: right; color: #1a1a2e }
.tf-total { text-align: right; font-size: 1.2rem; font-weight: 900; color: #1a1a2e }

/* ── Payment details ── */
.invoice__payment { display: flex; flex-direction: column; gap: 0.5rem }
.invoice__payment-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem }
.invoice__payment-label { color: #555; font-weight: 600 }
.invoice__payment-value { font-weight: 700; color: #1a1a2e }
.invoice__payment-value--mono { font-family: monospace; font-size: 0.78rem }
.invoice__payment-value--success { color: #16a34a }
.invoice__payment-value--danger  { color: #dc2626 }
.invoice__payment-value--warning { color: #d97706 }

/* ── Footer ── */
.invoice__footer { text-align: center; margin-top: 2rem; font-size: 0.78rem; color: #aaa }
.invoice__footer p { margin: 0.2rem 0 }

/* ── Print styles ── */
@media print {
  .no-print { display: none !important }
  .invoice__body { padding: 0 }
  .invoice-modal-backdrop { display: none }
}
</style>
