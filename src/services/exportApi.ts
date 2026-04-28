const API_BASE = 'http://localhost:8080/api/admin';

export interface ExportResponse {
  data: string;
  filename: string;
  timestamp: string;
}

export const exportApi = {
  // CSV Exports
  exportMetricsCSV: async () => {
    const response = await fetch(`${API_BASE}/export/metrics/csv`);
    const blob = await response.blob();
    downloadFile(blob, 'metrics.csv', 'text/csv');
  },

  exportItemsCSV: async () => {
    const response = await fetch(`${API_BASE}/export/items/csv`);
    const blob = await response.blob();
    downloadFile(blob, 'highest_items.csv', 'text/csv');
  },

  exportCategoryCSV: async () => {
    const response = await fetch(`${API_BASE}/export/category/csv`);
    const blob = await response.blob();
    downloadFile(blob, 'revenue_by_category.csv', 'text/csv');
  },

  exportReportCSV: async () => {
    const response = await fetch(`${API_BASE}/export/report/csv`);
    const blob = await response.blob();
    downloadFile(blob, 'analytics_report.csv', 'text/csv');
  },

  // HTML Export (for PDF conversion)
  exportReportHTML: async () => {
    const response = await fetch(`${API_BASE}/export/report/html`);
    const blob = await response.blob();
    downloadFile(blob, 'analytics_report.html', 'text/html');
  },

  // Open HTML report in new window
  viewReportHTML: async () => {
    const response = await fetch(`${API_BASE}/export/report/html`);
    const html = await response.text();
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(html);
    }
  }
};

// Helper function to download files
function downloadFile(data: Blob, filename: string, mimeType: string) {
  const url = window.URL.createObjectURL(new Blob([data], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
