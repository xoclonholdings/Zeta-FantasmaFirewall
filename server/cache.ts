import { LRUCache } from 'lru-cache';

// In-memory cache for frequently accessed data
export class PerformanceCache {
  private static instance: PerformanceCache;
  private dashboardCache: LRUCache<string, any>;
  private userCache: LRUCache<string, any>;
  private metricsCache: LRUCache<string, any>;

  private constructor() {
    // Dashboard data cache - short TTL for real-time data
    this.dashboardCache = new LRUCache({
      max: 100,
      ttl: 1000 * 30, // 30 seconds
    });

    // User data cache - longer TTL for relatively static data
    this.userCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 15, // 15 minutes
    });

    // Metrics cache - medium TTL for performance data
    this.metricsCache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 5, // 5 minutes
    });
  }

  static getInstance(): PerformanceCache {
    if (!PerformanceCache.instance) {
      PerformanceCache.instance = new PerformanceCache();
    }
    return PerformanceCache.instance;
  }

  // Dashboard caching
  getDashboardData(key: string): any {
    return this.dashboardCache.get(key);
  }

  setDashboardData(key: string, data: any): void {
    this.dashboardCache.set(key, data);
  }

  // User caching
  getUser(key: string): any {
    return this.userCache.get(key);
  }

  setUser(key: string, user: any): void {
    this.userCache.set(key, user);
  }

  // Metrics caching
  getMetrics(key: string): any {
    return this.metricsCache.get(key);
  }

  setMetrics(key: string, metrics: any): void {
    this.metricsCache.set(key, metrics);
  }

  // Cache invalidation
  invalidateDashboard(): void {
    this.dashboardCache.clear();
  }

  invalidateUser(userId?: string): void {
    if (userId) {
      this.userCache.delete(`user:${userId}`);
    } else {
      this.userCache.clear();
    }
  }

  invalidateMetrics(): void {
    this.metricsCache.clear();
  }

  // Cache statistics
  getStats() {
    return {
      dashboard: {
        size: this.dashboardCache.size,
        max: this.dashboardCache.max,
      },
      users: {
        size: this.userCache.size,
        max: this.userCache.max,
      },
      metrics: {
        size: this.metricsCache.size,
        max: this.metricsCache.max,
      }
    };
  }
}

export const cache = PerformanceCache.getInstance();