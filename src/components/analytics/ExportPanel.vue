<template>
  <div class="export-panel">
    <h3>📥 Export Dashboard Data</h3>
    
    <div class="export-section">
      <h4>CSV Exports</h4>
      <div class="export-buttons">
        <button @click="exportDashboardMetrics" :disabled="isExporting" class="btn btn-primary">
          <span v-if="!isExporting">📊 Export Metrics CSV</span>
          <span v-else>⏳ Exporting...</span>
        </button>
        
        <button @click="exportHighestItems" :disabled="isExporting" class="btn btn-primary">
          <span v-if="!isExporting">🏆 Export Top Items CSV</span>
          <span v-else>⏳ Exporting...</span>
        </button>
        
        <button @click="exportCategoryRevenue" :disabled="isExporting" class="btn btn-primary">
          <span v-if="!isExporting">📈 Export Category Revenue CSV</span>
          <span v-else>⏳ Exporting...</span>
        </button>
        
        <button @click="exportCompleteReport" :disabled="isExporting" class="btn btn-primary">
          <span v-if="!isExporting">📋 Export Complete Report CSV</span>
          <span v-else>⏳ Exporting...</span>
        </button>
      </div>
    </div>

    <div class="export-section">
      <h4>HTML/PDF Exports</h4>
      <div class="export-buttons">
        <button @click="exportAsHTML" :disabled="isExporting" class="btn btn-success">
          <span v-if="!isExporting">🌐 Export as HTML</span>
          <span v-else>⏳ Exporting...</span>
        </button>
        
        <button @click="viewHTML" :disabled="isExporting" class="btn btn-info">
          <span v-if="!isExporting">👁️ View HTML Report</span>
          <span v-else>⏳ Loading...</span>
        </button>
      </div>
      <p class="hint">💡 Use browser print (Ctrl+P) to convert HTML to PDF</p>
    </div>

    <div v-if="exportMessage" :class="['message', exportMessageType]">
      {{ exportMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { exportApi } from '@/services/exportApi';

const isExporting = ref(false);
const exportMessage = ref('');
const exportMessageType = ref<'success' | 'error'>('success');

const showMessage = (message: string, type: 'success' | 'error' = 'success', duration = 3000) => {
  exportMessage.value = message;
  exportMessageType.value = type;
  setTimeout(() => {
    exportMessage.value = '';
  }, duration);
};

const exportDashboardMetrics = async () => {
  isExporting.value = true;
  try {
    await exportApi.exportMetricsCSV();
    showMessage('✅ Dashboard metrics exported successfully!');
  } catch (error) {
    showMessage('❌ Failed to export metrics', 'error');
    console.error(error);
  } finally {
    isExporting.value = false;
  }
};

const exportHighestItems = async () => {
  isExporting.value = true;
  try {
    await exportApi.exportItemsCSV();
    showMessage('✅ Highest-selling items exported successfully!');
  } catch (error) {
    showMessage('❌ Failed to export items', 'error');
    console.error(error);
  } finally {
    isExporting.value = false;
  }
};

const exportCategoryRevenue = async () => {
  isExporting.value = true;
  try {
    await exportApi.exportCategoryCSV();
    showMessage('✅ Category revenue exported successfully!');
  } catch (error) {
    showMessage('❌ Failed to export category data', 'error');
    console.error(error);
  } finally {
    isExporting.value = false;
  }
};

const exportCompleteReport = async () => {
  isExporting.value = true;
  try {
    await exportApi.exportReportCSV();
    showMessage('✅ Complete report exported successfully!');
  } catch (error) {
    showMessage('❌ Failed to export report', 'error');
    console.error(error);
  } finally {
    isExporting.value = false;
  }
};

const exportAsHTML = async () => {
  isExporting.value = true;
  try {
    await exportApi.exportReportHTML();
    showMessage('✅ HTML report exported successfully!');
  } catch (error) {
    showMessage('❌ Failed to export HTML', 'error');
    console.error(error);
  } finally {
    isExporting.value = false;
  }
};

const viewHTML = async () => {
  isExporting.value = true;
  try {
    await exportApi.viewReportHTML();
    showMessage('✅ HTML report opened in new window');
  } catch (error) {
    showMessage('❌ Failed to load HTML report', 'error');
    console.error(error);
  } finally {
    isExporting.value = false;
  }
};
</script>

<style scoped>
.export-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.export-panel h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #6366f1;
  padding-bottom: 10px;
}

.export-section {
  margin: 20px 0;
}

.export-section h4 {
  color: #555;
  margin-bottom: 12px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.export-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
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

.btn-success {
  background-color: #22c55e;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #16a34a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-info {
  background-color: #3b82f6;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.hint {
  font-size: 12px;
  color: #999;
  margin: 10px 0 0 0;
  font-style: italic;
}

.message {
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 14px;
}

.message.success {
  background-color: #dcfce7;
  color: #166534;
  border-left: 4px solid #22c55e;
}

.message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border-left: 4px solid #ef4444;
}
</style>
