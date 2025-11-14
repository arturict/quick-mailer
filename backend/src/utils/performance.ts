import { db } from '../db';

/**
 * Analyzes query performance using SQLite's QUERY PLAN.
 * Useful for debugging slow queries and ensuring indexes are being used.
 * 
 * @param query - The SQL query to analyze (without EXPLAIN)
 * @param params - The parameters for the query
 * @returns Query plan as a string for logging
 */
export function explainQuery(query: string, params: any[] = []): string {
  try {
    const explainQuery = `EXPLAIN QUERY PLAN ${query}`;
    const stmt = db.prepare(explainQuery);
    const plan = stmt.all(...params);
    
    return JSON.stringify(plan, null, 2);
  } catch (error) {
    console.error('Error explaining query:', error);
    return 'Failed to explain query';
  }
}

/**
 * Logs the query plan for a given query.
 * Only logs in development mode to avoid performance overhead in production.
 * 
 * @param query - The SQL query to analyze
 * @param params - The parameters for the query
 */
export function logQueryPlan(query: string, params: any[] = []): void {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_QUERIES === 'true') {
    console.log('🔍 Query Plan:');
    console.log(query);
    console.log('Parameters:', params);
    console.log(explainQuery(query, params));
  }
}
