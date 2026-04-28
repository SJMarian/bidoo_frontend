const API_BASE = 'http://localhost:8080/api/admin/analytics';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface ActivityStatistics {
  activeUsers: number;
  totalActivities: number;
  bidsPlaced: number;
  paymentsCompleted: number;
  timeWindowHours: number;
}

export interface AuctionPerformance {
  auctionId: number;
  title: string;
  category: string;
  status: string;
  startingPrice: number;
  finalPrice: number;
  priceGrowthPercent: number;
  bidCount: number;
  engagementScore: number;
}

export interface CategoryPerformance {
  category: string;
  totalAuctions: number;
  totalBids: number;
  averagePriceGrowth: number;
  averageEngagementScore: number;
}

export const analyticsExtendedApi = {
  // Activity Tracking
  getUserActivity: (userId: number) =>
    fetch(`${API_BASE}/activity/user/${userId}`).then(r =>
      handleResponse<any>(r)
    ),

  getRecentActivity: (hoursBack: number = 24) =>
    fetch(`${API_BASE}/activity/recent?hoursBack=${hoursBack}`).then(r =>
      handleResponse<any[]>(r)
    ),

  getActivityStatistics: (hoursBack: number = 24) =>
    fetch(`${API_BASE}/activity/statistics?hoursBack=${hoursBack}`).then(r =>
      handleResponse<ActivityStatistics>(r)
    ),

  getActiveUsersCount: (hoursBack: number = 24) =>
    fetch(`${API_BASE}/activity/active-users?hoursBack=${hoursBack}`).then(r =>
      handleResponse<number>(r)
    ),

  getActivityTypeDistribution: (hoursBack: number = 24) =>
    fetch(`${API_BASE}/activity/type-distribution?hoursBack=${hoursBack}`).then(r =>
      handleResponse<any[]>(r)
    ),

  // Auction Performance Analytics
  getAuctionPerformance: (auctionId: number) =>
    fetch(`${API_BASE}/performance/auction/${auctionId}`).then(r =>
      handleResponse<AuctionPerformance>(r)
    ),

  getAllAuctionsPerformance: () =>
    fetch(`${API_BASE}/performance/all-auctions`).then(r =>
      handleResponse<AuctionPerformance[]>(r)
    ),

  getTopAuctions: (limit: number = 5) =>
    fetch(`${API_BASE}/performance/top-auctions?limit=${limit}`).then(r =>
      handleResponse<AuctionPerformance[]>(r)
    ),

  getPerformanceByCategory: () =>
    fetch(`${API_BASE}/performance/by-category`).then(r =>
      handleResponse<Record<string, CategoryPerformance>>(r)
    )
};
