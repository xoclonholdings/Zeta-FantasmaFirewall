import { db } from "./db";
import { cache } from "./cache";

/**
 * Read-only operational diagnostics. ZENA never schedules destructive cleanup
 * or database maintenance: evidence retention remains an explicit operator
 * policy and every mutation must pass the execution-security boundary.
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async getPerformanceStats(): Promise<Record<string, unknown>> {
    const cacheStats = cache.getStats();
    const database = await db.execute(`
      SELECT
        count(*) AS connections,
        count(*) FILTER (WHERE state = 'active') AS active_queries
      FROM pg_stat_activity
      WHERE datname = current_database();
    `);
    const tables = await db.execute(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) AS size,
        pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) AS size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY size_bytes DESC;
    `);

    return {
      cache: cacheStats,
      database,
      tables,
      observedAt: new Date().toISOString(),
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
