import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import logger from "jet-logger";
import ENV from "@src/common/constants/ENV";

/**
 * Database connection pool for PostgreSQL
 */
class Database {
  private pool: Pool;
  private isConnected = false;

  constructor(connectToDb = false) {
    this.pool = new Pool({
      host: ENV.Db.Host,
      port: ENV.Db.Port,
      database: ENV.Db.Name,
      user: ENV.Db.User,
      password: ENV.Db.Password,
      max: 20, // Maximum number of connections in pool
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
      maxUses: 7500, // Close connections after 7500 uses (optional)
    });

    // Handle pool errors
    this.pool.on("error", (err: Error) => {
      logger.err("Unexpected error on idle client");
      logger.err(err);
      throw new Error("Unexpected error on idle client");
    });

    // Handle pool connection
    this.pool.on("connect", () => {
      logger.info("Database pool connection established");
    });

    // Handle pool removal
    this.pool.on("remove", () => {
      logger.info("Client removed from pool");
    });
  }

  /**
   * Initialize database connection and test connectivity
   */
  public async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();
      this.isConnected = true;
      logger.info("Database connected successfully");
    } catch (error) {
      logger.err("Failed to connect to database:" + error);
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  /**
   * Execute a SQL query with optional parameters
   */
  public async query(text: string, params?: unknown[]): Promise<QueryResult<QueryResultRow>> {
    if (!this.isConnected) {
      throw new Error("Database not connected. Call connect() first.");
    }

    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.info(`Query executed in ${duration}ms`);
      return result;
    } catch (error) {
      logger.err("Database query error:");
      logger.err(error);
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  public async getClient(): Promise<PoolClient> {
    if (!this.isConnected) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return await this.pool.connect();
  }

  /**
   * Execute multiple queries in a transaction
   */
  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.isConnected) {
      throw new Error("Database not connected. Call connect() first.");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      logger.err("Transaction rolled back:" + error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if database is connected
   */
  public isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection pool statistics
   */
  public getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Close all database connections
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info("Database connections closed");
    } catch (error) {
      logger.err("Error closing database connections:" + error);
      throw error;
    }
  }

  /**
   * Health check for database connectivity
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query("SELECT 1 as health");
      return result.rows.length > 0;
    } catch {
      return false;
    }
  }
}

// Create and export singleton instance
const db = new Database();

export default db;
