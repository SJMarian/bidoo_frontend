<template>
  <div class="activity-tracking-panel">
    <h3>📊 Activity Analytics</h3>

    <div class="controls">
      <select v-model="selectedTimeRange" @change="loadActivityData" class="time-select">
        <option value="1">Last 1 Hour</option>
        <option value="6">Last 6 Hours</option>
        <option value="24">Last 24 Hours</option>
        <option value="168">Last 7 Days</option>
      </select>
      <button @click="loadActivityData" :disabled="loading" class="btn btn-primary">
        <span v-if="!loading">🔄 Refresh</span>
        <span v-else>⏳ Loading...</span>
      </button>
    </div>

    <div v-if="loading" class="loading">
      Loading activity data...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else>
      <!-- Activity Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-label">Active Users</div>
            <div class="stat-value">{{ statistics?.activeUsers || 0 }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-label">Total Activities</div>
            <div class="stat-value">{{ statistics?.totalActivities || 0 }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🔨</div>
          <div class="stat-content">
            <div class="stat-label">Bids Placed</div>
            <div class="stat-value">{{ statistics?.bidsPlaced || 0 }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-label">Payments Completed</div>
            <div class="stat-value">{{ statistics?.paymentsCompleted || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- Activity Type Distribution -->
      <div class="activity-section">
        <h4>Activity Type Distribution</h4>
        <div class="activity-types">
          <div v-for="[activityType, count] in activityDistribution" :key="activityType" class="activity-type-item">
            <div class="activity-type-header">
              <span class="activity-type-name">{{ activityType }}</span>
              <span class="activity-type-count">{{ count }}</span>
            </div>
            <div class="activity-type-bar">
              <div class="activity-type-fill" :style="{ width: getPercentage(count) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="activity-section">
        <h4>Recent Activities</h4>
        <div v-if="recentActivities.length === 0" class="no-data">
          No activities recorded in this time period.
        </div>
        <table v-else class="activity-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Activity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in recentActivities.slice(0, 50)" :key="activity.id">
              <td class="time">{{ formatTime(activity.timestamp) }}</td>
              <td class="user">{{ activity.username }}</td>
              <td class="activity">
                <span class="activity-badge" :class="getActivityBadgeClass(activity.activityType)">
                  {{ formatActivityType(activity.activityType) }}
                </span>
              </td>
              <td class="description">{{ activity.description || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { analyticsExtendedApi } from '@/services/analyticsExtendedApi';
import type { ActivityStatistics } from '@/services/analyticsExtendedApi';

const loading = ref(false);
const error = ref('');
const selectedTimeRange = ref('24');
const statistics = ref<ActivityStatistics | null>(null);
const recentActivities = ref<any[]>([]);
const activityDistribution = ref<Map<string, number>>(new Map());

const maxActivityCount = computed(() => {
  return Math.max(...activityDistribution.value.values(), 1);
});

const loadActivityData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const hoursBack = parseInt(selectedTimeRange.value);
    
    const [statsRes, activitiesRes, distRes] = await Promise.all([
      analyticsExtendedApi.getActivityStatistics(hoursBack),
      analyticsExtendedApi.getRecentActivity(hoursBack),
      analyticsExtendedApi.getActivityTypeDistribution(hoursBack)
    ]);

    statistics.value = statsRes;
    recentActivities.value = activitiesRes;

    // Process distribution
    const dist = new Map();
    distRes.forEach((item: any) => {
      dist.set(item[0], item[1]);
    });
    activityDistribution.value = dist;
  } catch (err) {
    error.value = 'Failed to load activity data';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const getPercentage = (count: number) => {
  return (count / maxActivityCount.value) * 100;
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

const formatActivityType = (type: string) => {
  return type.replace(/_/g, ' ');
};

const getActivityBadgeClass = (type: string) => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('bid')) return 'badge-bid';
  if (typeLower.includes('payment')) return 'badge-payment';
  if (typeLower.includes('auction')) return 'badge-auction';
  if (typeLower.includes('login')) return 'badge-login';
  if (typeLower.includes('error')) return 'badge-error';
  return 'badge-default';
};

onMounted(() => {
  loadActivityData();
});
</script>

<style scoped>
.activity-tracking-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.activity-tracking-panel h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #6366f1;
  padding-bottom: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  margin: 15px 0;
  flex-wrap: wrap;
}

.time-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  background-color: #6366f1;
  color: white;
}

.btn:hover:not(:disabled) {
  background-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  background-color: #fee2e2;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 4px solid #ef4444;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.stat-icon {
  font-size: 28px;
  min-width: 40px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.activity-section {
  margin: 25px 0;
}

.activity-section h4 {
  color: #555;
  margin-bottom: 15px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-type-item {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.activity-type-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.activity-type-name {
  font-weight: 500;
  color: #333;
  text-transform: capitalize;
}

.activity-type-count {
  background-color: #6366f1;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.activity-type-bar {
  width: 100%;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.activity-type-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 0.3s ease;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  max-height: 400px;
  overflow-y: auto;
}

.activity-table th {
  background-color: #f3f4f6;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #d1d5db;
  position: sticky;
  top: 0;
}

.activity-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.activity-table tbody tr:hover {
  background-color: #f9fafb;
}

.time {
  color: #666;
  font-family: monospace;
  font-size: 12px;
}

.user {
  font-weight: 500;
  color: #333;
}

.activity-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-bid {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-payment {
  background-color: #dcfce7;
  color: #166534;
}

.badge-auction {
  background-color: #dbeafe;
  color: #0c4a6e;
}

.badge-login {
  background-color: #f0e7fe;
  color: #6b21a8;
}

.badge-error {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-default {
  background-color: #e5e7eb;
  color: #374151;
}

.description {
  color: #666;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
