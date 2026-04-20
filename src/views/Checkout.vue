<template>
  <AppNavbar />
  <div class="checkout-page">
    <div class="checkout-container">
      <header class="checkout-header">
        <button class="back-link" @click="goBack">
          <ArrowLeft class="icon" :size="16" /> Back to Dashboard
        </button>
        <h1>Checkout</h1>
        <p>Complete your transaction securely via SSLCommerz</p>
      </header>

      <div class="checkout-grid" v-if="summaryData">
        <div class="left-column">
          <!-- Payment Method Card -->
          <div class="card payment-method-card">
            <div class="card-header">
              <h2>Payment Method</h2>
              <span class="secure-badge"
                ><Lock class="icon" :size="14" /> Secure SSL Encryption</span
              >
            </div>

            <div class="payment-option selected">
              <div class="recommended-badge">RECOMMENDED</div>
              <div class="option-content">
                <div class="option-icon">
                  <Landmark class="icon" :size="24" color="#197fe6" />
                </div>
                <div class="option-details">
                  <h3>SSLCommerz Gateway</h3>
                  <p>Pay via Cards, Net Banking, or Mobile Wallets (bKash, Nagad, etc.)</p>
                </div>
                <div class="radio-selected"></div>
              </div>
              <div class="payment-logos">
                <img
                  src="https://download.logo.wine/logo/Visa_Inc./Visa_Inc.-Logo.wine.png"
                  alt="Logo"
                  width="100"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/330px-Mastercard-logo.svg.png"
                  alt="Logo"
                  width="70 "
                />
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/068/706/001/small_2x/bkash-logo-horizontal-bangla-mobile-banking-app-icon-free-png.png"
                  alt="Logo"
                  width="100"
                />
              </div>
            </div>

            <button class="proceed-btn" @click="proceedPayment" :disabled="isProcessing">
              <ShieldCheck class="icon" :size="20" />
              <span v-if="isProcessing">Processing...</span>
              <span v-else>Proceed to Secure Payment</span>
            </button>
            <p class="disclaimer">
              By clicking 'Proceed', you will be redirected to the SSLCommerz hosted payment page to
              complete your transaction safely.
            </p>
          </div>
        </div>

        <div class="right-column">
          <!-- Order Summary Card -->
          <div class="card summary-card">
            <h2>Order Summary</h2>

            <div class="summary-line">
              <span>Winning Bid</span>
              <span>{{ formatCurrency(summaryData.soldPrice) }}</span>
            </div>
            <div class="summary-line">
              <span>Buyer's Premium</span>
              <span>{{ formatCurrency(summaryData.platfromFee) }}</span>
            </div>
            <div class="summary-line">
              <span>VAT / Taxes</span>
              <span>{{ formatCurrency(summaryData.vat) }}</span>
            </div>
            <div class="summary-line">
              <span>Insured Shipping</span>
              <span>{{ formatCurrency(summaryData.shippingCost) }}</span>
            </div>

            <div class="summary-total">
              <div class="total-label">Total Amount</div>
              <div class="total-value">
                <div class="amount">{{ formatCurrency(totalAmount) }}</div>
              </div>
            </div>

            <div class="buyer-protection">
              <ShieldCheck class="icon" :size="20" />
              <div class="protection-text">
                <h4>Buyer Protection</h4>
                <p>
                  Your purchase is protected by Bidoo Auctions. We hold funds in escrow until
                  delivery is confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="loading-state">
        <p>Loading checkout summary...</p>
      </div>
      <div v-else class="error-state">
        <p>Failed to load checkout details.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../api/apiClient'
import { ArrowLeft, Lock, Landmark, ShieldCheck, CheckCircle, Shield } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auctionItemId = route.params.id

interface CheckoutSummary {
  soldPrice: number
  vat: number
  platfromFee: number
  shippingCost: number
}

const summaryData = ref<CheckoutSummary | null>(null)
const loading = ref(true)
const isProcessing = ref(false)

const fetchSummary = async () => {
  try {
    const response = await apiClient.post('/orders/checkout/summary', {
      auctionItemId: Number(auctionItemId),
    })
    if (response.data && response.data.data) {
      summaryData.value = response.data.data
    } else {
      summaryData.value = { soldPrice: 0, vat: 0, platfromFee: 0, shippingCost: 0 }
    }
  } catch (error) {
    console.error('Failed to fetch checkout summary:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (auctionItemId) {
    fetchSummary()
  } else {
    loading.value = false
  }
})

const goBack = () => {
  router.push('/')
}

const proceedPayment = async () => {
  if (!auctionItemId) return
  isProcessing.value = true
  try {
    const response = await apiClient.post('/orders', {
      auctionItemId: Number(auctionItemId)
    })
    
    if (response.data && response.data.data) {
      // Redirect to the SSLCommerz payment page
      window.location.href = response.data.data
    } else {
      console.error('Invalid response format:', response.data)
      alert('Failed to get payment link. Please try again later.')
    }
  } catch (error) {
    console.error('Failed to initiate payment:', error)
    alert('An error occurred while initiating payment.')
  } finally {
    isProcessing.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const totalAmount = computed(() => {
  if (!summaryData.value) return 0
  return (
    summaryData.value.soldPrice +
    summaryData.value.vat +
    summaryData.value.platfromFee +
    summaryData.value.shippingCost
  )
})
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 3rem 1rem;
  font-family: 'Manrope', 'Inter', sans-serif;
  color: #0f172a;
}

.checkout-container {
  max-width: 1000px;
  margin: 0 auto;
}

.checkout-header {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;
}

.back-link:hover {
  color: #0f172a;
}

.checkout-header h1 {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0 0 0.5rem 0;
}

.checkout-header p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 860px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  margin-bottom: 1.5rem;
}

.card h2 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

/* Payment Method Styles */
.payment-method-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.payment-method-card .card-header h2 {
  margin: 0;
}

.secure-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: #16a34a;
  background-color: #dcfce7;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.payment-option {
  position: relative;
  border: 2px solid #197fe6;
  border-radius: 0.75rem;
  padding: 1.5rem;
  background-color: #f8fafc;
  margin-bottom: 1.5rem;
}

.recommended-badge {
  position: absolute;
  top: -10px;
  left: 1rem;
  background-color: #197fe6;
  color: white;
  font-size: 0.625rem;
  font-weight: 800;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.option-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.option-icon {
  background: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-details {
  flex: 1;
}

.option-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 700;
}

.option-details p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.4;
}

.radio-selected {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 6px solid #197fe6;
  background: white;
}

.payment-logos {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.logo {
  font-weight: 800;
  font-size: 1.25rem;
  font-style: italic;
  letter-spacing: -0.05em;
}
.logo-visa {
  color: #1a1f71;
}
.logo-mastercard {
  color: #eb001b;
  font-style: normal;
}
.logo-bkash {
  color: #e2136e;
  font-style: normal;
  font-weight: 700;
}

.proceed-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #197fe6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 1rem;
}

.proceed-btn:hover {
  background-color: #1565c0;
}

.disclaimer {
  text-align: center;
  color: #94a3b8;
  font-size: 0.75rem;
  margin: 0;
  padding: 0 1rem;
  line-height: 1.5;
}

/* Item Details */
.item-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f1f5f9;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 700;
}

.item-text p {
  margin: 0 0 0.5rem 0;
  color: #64748b;
  font-size: 0.875rem;
}

.auth-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #197fe6;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Order Summary Styles */
.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #475569;
}

.summary-line span:last-child {
  font-weight: 600;
  color: #0f172a;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.total-label {
  font-size: 1.125rem;
  font-weight: 800;
}

.total-value {
  text-align: right;
}

.total-value .amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #197fe6;
}

.total-value .approx {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.buyer-protection {
  display: flex;
  gap: 1rem;
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
}

.protection-text h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 700;
}

.protection-text p {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.5;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 1rem;
  color: #64748b;
  font-weight: 500;
}
</style>
