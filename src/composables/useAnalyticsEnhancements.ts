import { ref, onMounted, onUnmounted } from 'vue';

export function useAutoRefresh(callback: () => Promise<void>, intervalSeconds: number = 30) {
  const isRefreshing = ref(false);
  const lastRefreshTime = ref<Date | null>(null);
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  const startAutoRefresh = () => {
    // Initial refresh
    performRefresh();

    // Set up interval
    refreshInterval = setInterval(() => {
      performRefresh();
    }, intervalSeconds * 1000);
  };

  const performRefresh = async () => {
    if (isRefreshing.value) return;

    isRefreshing.value = true;
    try {
      await callback();
      lastRefreshTime.value = new Date();
    } catch (error) {
      console.error('Auto-refresh error:', error);
    } finally {
      isRefreshing.value = false;
    }
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  const manualRefresh = async () => {
    await performRefresh();
  };

  onMounted(() => {
    startAutoRefresh();
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });

  return {
    isRefreshing,
    lastRefreshTime,
    manualRefresh,
    stopAutoRefresh,
    startAutoRefresh
  };
}

export function useActivityTracking() {
  return {
    // Activity tracking will be implemented in backend interceptor
    // Frontend will track user interactions via HTTP interceptor
    trackActivity: (action: string, details?: any) => {
      // Log to console for now (backend will track via interceptor)
      console.log('Activity tracked:', { action, details, timestamp: new Date() });
    }
  };
}
