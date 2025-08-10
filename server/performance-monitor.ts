import { db } from "./db";
import { cache } from "./cache";

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private analyticsInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  start(): void {
    // Run database cleanup every 24 hours
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.performCleanup();
        console.log('[Performance] Database cleanup completed');
      } catch (error) {
        console.error('[Performance] Cleanup failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Run analytics every 6 hours
    this.analyticsInterval = setInterval(async () => {
      try {
        await this.analyzePerformance();
        console.log('[Performance] Analytics completed');
      } catch (error) {
        console.error('[Performance] Analytics failed:', error);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours

    console.log('[Performance] Monitor started');
  }

  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
      this.analyticsInterval = null;
    }
    console.log('[Performance] Monitor stopped');
  }

  private async performCleanup(): Promise<void> {
    // Call database cleanup function
    await db.execute(`SELECT cleanup_old_security_events();`);
    
    // Clear all caches to ensure fresh data
    cache.invalidateDashboard();
    cache.invalidateMetrics();
    cache.invalidateUser();
  }

  private async analyzePerformance(): Promise<void> {
    // Update table statistics for query optimization
    await db.execute(`SELECT analyze_performance_tables();`);
  }

  async getPerformanceStats(): Promise<any> {
    try {
      // Get cache statistics
      const cacheStats = cache.getStats();

      // Get database connection info
      const dbStats = await db.execute(`
        SELECT 
          count(*) as active_connections,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_queries
        FROM pg_stat_activity 
        WHERE datname = current_database();
      `);

      // Get table sizes
      const tableSizes = await db.execute(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
      `);

      return {
        cache: cacheStats,
        database: dbStats,
        tables: tableSizes,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[Performance] Failed to get stats:', error);
      return {
        error: 'Failed to retrieve performance statistics',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();