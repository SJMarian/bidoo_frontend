<template>
  <div class="create-auction-page">
    <main class="content-wrapper">
      <header class="header">
        <div class="header-icon-wrapper">
          <Gavel class="header-icon" />
        </div>
        <div>
          <h1>Create New Auction</h1>
          <p>List your exclusive items to a global audience of passionate collectors.</p>
        </div>
      </header>

      <form class="auction-form" @submit.prevent="submitForm">
        <!-- Item Images -->
        <section class="form-section">
          <div class="section-header">
            <Image class="section-icon" />
            <h2>Item Images</h2>
          </div>
          <p class="section-subtitle">
            Upload high-quality images. The first image will be your main cover. Max 5 images.
          </p>

          <div class="images-grid">
            <template v-for="(img, idx) in previewUrls" :key="idx">
              <div class="image-box" :class="{ 'primary-image': idx === 0 }">
                <img :src="img" />
                <button type="button" class="btn-remove" @click="removeImage(idx)">
                  <X :size="16" />
                </button>
              </div>
            </template>

            <label class="image-box btn-add" v-if="previewUrls.length < 5">
              <Plus :size="24" class="add-icon" />
              <span>Add {{ previewUrls.length === 0 ? 'Cover' : 'More' }}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                class="sr-only"
                @change="handleFileUpload"
              />
            </label>
          </div>
          <p v-if="error" class="error-text">{{ error }}</p>
        </section>

        <!-- Item Title & Description -->
        <section class="form-section">
          <div class="form-group">
            <label>Item Title *</label>
            <input
              type="text"
              v-model="form.title"
              placeholder="e.g. 1967 Vintage Sports Car"
              required
            />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="form.description"
              rows="5"
              placeholder="Provide a detailed history and condition..."
            ></textarea>
          </div>
        </section>

        <!-- Pricing -->
        <section class="form-section">
          <div class="section-header">
            <Banknote class="section-icon" />
            <h2>Pricing</h2>
          </div>
          <div class="split-group">
            <div class="form-group">
              <label>Currency</label>
              <select v-model="form.currency">
                <option value="USD">BDT - Bangladeshi Taka</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div class="form-group">
              <label>Starting Price</label>
              <input
                type="number"
                v-model="form.startingPrice"
                placeholder="0.00"
                min="0"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label>Minimum Bid Increment</label>
            <input
              type="number"
              v-model="form.bidIncrement"
              placeholder="100.00"
              min="1"
              required
            />
          </div>
        </section>

        <!-- Scheduling -->
        <section class="form-section">
          <div class="section-header">
            <Calendar class="section-icon" />
            <h2>Scheduling</h2>
          </div>
          <div class="split-group">
            <div class="form-group">
              <label>Start At</label>
              <input type="datetime-local" v-model="form.startAt" required />
            </div>
            <div class="form-group">
              <label>End At</label>
              <input type="datetime-local" v-model="form.endAt" required />
            </div>
          </div>
        </section>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="goBack">Cancel</button>
          <button type="submit" class="btn-primary">
            Submit for Approval <Rocket :size="18" />
          </button>
        </div>
      </form>
    </main>

    <LoadingModal :visible="submitting" message="Submitting your auction…" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import LoadingModal from '../components/LoadingModal.vue'
import { Gavel, Image, X, Plus, Banknote, Calendar, Rocket } from 'lucide-vue-next'
import apiClient from '../api/apiClient'
import { useToast } from '../composables/useToast'

const toast = useToast()

const router = useRouter()

const previewUrls = ref<string[]>([])
const selectedFiles = ref<File[]>([])
const error = ref('')
const submitting = ref(false)

const form = reactive({
  title: '',
  description: '',
  currency: 'BDT',
  startingPrice: null as number | null,
  bidIncrement: null as number | null,
  startAt: '',
  endAt: '',
})

const handleFileUpload = (e: Event) => {
  error.value = ''
  const target = e.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)

  if (selectedFiles.value.length + files.length > 5) {
    error.value = 'You can only upload up to 5 images max.'
    return
  }

  for (const file of files) {
    selectedFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) {
        previewUrls.value.push(ev.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = (index: number) => {
  selectedFiles.value.splice(index, 1)
  previewUrls.value.splice(index, 1)
}

const submitForm = async () => {
  if (previewUrls.value.length === 0) {
    error.value = 'Cover image is required.'
    return
  }

  submitting.value = true
  error.value = ''

  try {
    const requestPayload = {
      title: form.title,
      description: form.description,
      currency: form.currency,
      bidStartingPrice: String(form.startingPrice ?? ''),
      minimumBidIncrement: String(form.bidIncrement ?? ''),
      startAt: form.startAt ? form.startAt + ':00' : '',
      endAt: form.endAt ? form.endAt + ':00' : '',
    }

    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }),
    )

    for (const file of selectedFiles.value) {
      formData.append('images', file)
    }

    await apiClient.post('auction/item-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    toast.success('Auction submitted successfully!')
    router.push('/dashboard/my-bids')
  } catch (err: any) {
    console.error('Failed to create auction:', err)
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to create auction. Please try again.'
    toast.error(message)
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.create-auction-page {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Manrope', sans-serif;
  color: #0f172a;
}
.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
.header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.header-icon-wrapper {
  width: 56px;
  height: 56px;
  background-color: rgba(25, 127, 230, 0.1);
  color: #197fe6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-icon {
  width: 32px;
  height: 32px;
}
.header h1 {
  font-size: 1.875rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
}
.header p {
  color: #64748b;
  margin: 0;
}
.form-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}
.section-icon {
  color: #197fe6;
}
.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}
.section-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1rem;
  margin-top: -0.5rem;
}
.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  font-weight: 500;
}
.images-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 640px) {
  .images-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.image-box {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.primary-image {
  grid-column: span 2;
  grid-row: span 2;
}
.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.btn-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-remove:hover {
  background-color: rgba(239, 68, 68, 0.9);
}
.btn-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #cbd5e1;
  background-color: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-add:hover {
  border-color: #197fe6;
  color: #197fe6;
  background-color: #eff6ff;
}
.add-icon {
  margin-bottom: 0.5rem;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #334155;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #197fe6;
}
.split-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 640px) {
  .split-group {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-secondary:hover {
  background: #f8fafc;
}
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 700;
  background: #197fe6;
  border: none;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #1565c0;
}
</style>
