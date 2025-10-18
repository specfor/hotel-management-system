import { Pool, Client } from "pg";
import { readdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import { createInterface } from "readline";
import logger from "jet-logger";
import ENV from "@src/common/constants/ENV";

/**
 * Migration status enum
 */
export enum MigrationStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

/**
 * Migration record interface
 */
export interface MigrationRecord {
  id: number;
  filename: string;
  checksum: string;
  executedAt: Date;
  status: MigrationStatus;
  errorMessage?: string;
  executionTimeMs: number;
}

/**
 * Migration file interface
 */
export interface MigrationFile {
  filename: string;
  filepath: string;
  checksum: string;
  content: string;
}

/**
 * PostgreSQL Migration Manager
 * Handles database creation, migration tracking, and execution
 */
export class MigrationManager {
  private pool: Pool | null = null;
  private adminClient: Client | null = null;
  private migrationsDir: string;
  private migrationsTable = "schema_migrations";

  public constructor(migrationsDir = "./migrations") {
    this.migrationsDir = resolve(migrationsDir);
  }

  /**
   * Initialize the migration manager
   */
  public async initialize(): Promise<void> {
    logger.info("🚀 Initializing Migration Manager...");

    try {
      // First connect to postgres database to check if target DB exists
      await this.connectAsAdmin();

      // Check if target database exists
      const dbExists = await this.checkDatabaseExists();

      if (!dbExists) {
        const shouldCreate = await this.promptCreateDatabase();
        if (shouldCreate) {
          await this.createDatabase();
        } else {
          throw new Error("Cannot proceed without target database");
        }
      }

      // Connect to target database
      await this.connectToTargetDatabase();

      // Setup migrations table
      await this.setupMigrationsTable();

      logger.info("✅ Migration Manager initialized successfully");
    } catch (error) {
      logger.err("❌ Failed to initialize Migration Manager:");
      logger.err(error);
      throw error;
    }
  }

  /**
   * Connect to postgres database as admin to manage databases
   */
  private async connectAsAdmin(): Promise<void> {
    this.adminClient = new Client({
      host: ENV.Db.Host,
      port: ENV.Db.Port,
      database: "postgres", // Connect to default postgres DB
      user: ENV.Db.User,
      password: ENV.Db.Password,
    });

    await this.adminClient.connect();
    logger.info("🔌 Connected to PostgreSQL as admin");
  }

  /**
   * Connect to the target database
   */
  private async connectToTargetDatabase(): Promise<void> {
    this.pool = new Pool({
      host: ENV.Db.Host,
      port: ENV.Db.Port,
      database: ENV.Db.Name,
      user: ENV.Db.User,
      password: ENV.Db.Password,
      max: 5,
    });

    // Test connection
    const client = await this.pool.connect();
    await client.query("SELECT NOW()");
    client.release();

    logger.info(`🔌 Connected to target database: ${ENV.Db.Name}`);
  }

  /**
   * Check if the target database exists
   */
  private async checkDatabaseExists(): Promise<boolean> {
    if (!this.adminClient) {
      throw new Error("Admin client not connected");
    }

    const result = await this.adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [ENV.Db.Name],
    );

    return result.rows.length > 0;
  }

  /**
   * Prompt user to create database
   */
  private async promptCreateDatabase(): Promise<boolean> {
    return new Promise((resolve) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        `📊 Database "${ENV.Db.Name}" does not exist. Create it? (y/n): `,
        (answer) => {
          rl.close();
          const normalized = answer.toLowerCase().trim();
          resolve(normalized === "y" || normalized === "yes");
        },
      );
    });
  }

  /**
   * Create the target database
   */
  private async createDatabase(): Promise<void> {
    if (!this.adminClient) {
      throw new Error("Admin client not connected");
    }

    logger.info(`🏗️  Creating database: ${ENV.Db.Name}`);

    // Note: Database names cannot be parameterized, so we need to validate it
    const dbName = ENV.Db.Name.replace(/[^a-zA-Z0-9_]/g, "");
    if (dbName !== ENV.Db.Name) {
      throw new Error("Invalid database name. Only alphanumeric characters and underscores are allowed.");
    }

    await this.adminClient.query(`CREATE DATABASE "${dbName}"`);
    logger.info(`✅ Database "${ENV.Db.Name}" created successfully`);
  }

  /**
   * Check if the migrations table exists
   */
  private async checkMigrationsTableExists(): Promise<boolean> {
    if (!this.pool) {
      throw new Error("Database pool not connected");
    }

    try {
      const result = await this.pool.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `,
        [this.migrationsTable],
      );

      return Boolean((result.rows[0] as { exists: boolean } | undefined)?.exists);
    } catch {
      // If any error occurs, assume table doesn't exist
      return false;
    }
  }

  /**
   * Setup the migrations tracking table
   */
  private async setupMigrationsTable(): Promise<void> {
    if (!this.pool) {
      throw new Error("Database pool not connected");
    }

    // Check if migrations table already exists
    const tableExists = await this.checkMigrationsTableExists();

    if (tableExists) {
      logger.info("✅ Migrations table already exists");
      return;
    }

    const shouldCreate = await this.promptCreateMigrationsTable();
    if (!shouldCreate) {
      logger.info("⏭️  Skipping migrations table creation");
      return;
    }

    logger.info("🔧 Setting up migrations table...");

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        checksum VARCHAR(64) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        error_message TEXT,
        execution_time_ms INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_migrations_filename ON ${this.migrationsTable}(filename);
      CREATE INDEX IF NOT EXISTS idx_migrations_status ON ${this.migrationsTable}(status);
      CREATE INDEX IF NOT EXISTS idx_migrations_executed_at ON ${this.migrationsTable}(executed_at);
    `;

    await this.pool.query(createTableSQL);
    logger.info("✅ Migrations table setup completed");
  }

  /**
   * Prompt user to create migrations table
   */
  private async promptCreateMigrationsTable(): Promise<boolean> {
    return new Promise((resolve) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(`📋 Create migrations tracking table "${this.migrationsTable}"? (y/n): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase().trim() === "y" || answer.toLowerCase().trim() === "yes");
      });
    });
  }

  /**
   * Generate checksum for migration content
   */
  private generateChecksum(content: string): string {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require("crypto") as typeof import("crypto");
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Read all migration files from directory
   */
  public async getMigrationFiles(): Promise<MigrationFile[]> {
    try {
      const files = await readdir(this.migrationsDir);
      const migrationFiles: MigrationFile[] = [];

      for (const filename of files.filter((f) => f.endsWith(".sql")).sort()) {
        const filepath = join(this.migrationsDir, filename);
        const content = await readFile(filepath, "utf-8");
        const checksum = this.generateChecksum(content);

        migrationFiles.push({
          filename,
          filepath,
          content,
          checksum,
        });
      }

      return migrationFiles;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        logger.warn(`⚠️  Migrations directory not found: ${this.migrationsDir}`);
        return [];
      }
      throw error;
    }
  }

  /**
   * Get executed migrations from database
   */
  public async getExecutedMigrations(): Promise<MigrationRecord[]> {
    if (!this.pool) {
      throw new Error("Database pool not connected");
    }

    try {
      const result = await this.pool.query(`
        SELECT id, filename, checksum, executed_at, status, 
               error_message, execution_time_ms
        FROM ${this.migrationsTable}
        ORDER BY executed_at ASC
      `);

      interface DbRow {
        id: number;
        filename: string;
        checksum: string;
        executed_at: Date;
        status: string;
        error_message?: string;
        execution_time_ms: number;
      }

      return result.rows.map((row: DbRow) => ({
        id: row.id,
        filename: row.filename,
        checksum: row.checksum,
        executedAt: row.executed_at,
        status: row.status as MigrationStatus,
        errorMessage: row.error_message,
        executionTimeMs: row.execution_time_ms,
      }));
    } catch (error: unknown) {
      // If table doesn't exist, return empty array
      if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "42P01") {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get pending migrations that need to be executed
   */
  public async getPendingMigrations(): Promise<MigrationFile[]> {
    const allMigrations = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();

    const successfulMigrations = executedMigrations.filter((m) => m.status === MigrationStatus.SUCCESS);
    const executedMap = new Map(successfulMigrations.map((m) => [m.filename, m]));

    return allMigrations.filter((migration) => {
      const executed = executedMap.get(migration.filename);

      // If not executed, it's pending
      if (!executed) return true;

      // If checksum changed, warn and skip (don't re-run)
      if (executed.checksum !== migration.checksum) {
        logger.warn(`⚠️  Migration ${migration.filename} has changed checksum.` + " Skipping re-execution.");
        return false;
      }

      return false;
    });
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(migration: MigrationFile): Promise<void> {
    if (!this.pool) {
      throw new Error("Database pool not connected");
    }

    const client = await this.pool.connect();
    const startTime = Date.now();

    try {
      // Start transaction
      await client.query("BEGIN");

      // Record migration start
      await client.query(
        `
        INSERT INTO ${this.migrationsTable} (filename, checksum, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (filename) DO UPDATE SET
          checksum = EXCLUDED.checksum,
          status = EXCLUDED.status,
          executed_at = NOW()
      `,
        [migration.filename, migration.checksum, MigrationStatus.PENDING],
      );

      logger.info(`🔄 Executing migration: ${migration.filename}`);

      // Execute migration SQL
      await client.query(migration.content);

      const executionTime = Date.now() - startTime;

      // Update migration as successful
      await client.query(
        `
        UPDATE ${this.migrationsTable}
        SET status = $1, execution_time_ms = $2, executed_at = NOW()
        WHERE filename = $3
      `,
        [MigrationStatus.SUCCESS, executionTime, migration.filename],
      );

      // Commit transaction
      await client.query("COMMIT");

      logger.info(`✅ Migration ${migration.filename} executed successfully (${executionTime}ms)`);
    } catch (error) {
      // Rollback transaction
      await client.query("ROLLBACK");

      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Record migration failure
      await client.query(
        `
        UPDATE ${this.migrationsTable}
        SET status = $1, error_message = $2, execution_time_ms = $3, executed_at = NOW()
        WHERE filename = $4
      `,
        [MigrationStatus.FAILED, errorMessage, executionTime, migration.filename],
      );

      logger.err(`❌ Migration ${migration.filename} failed: ${errorMessage}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Run all pending migrations
   */
  public async runMigrations(): Promise<void> {
    logger.info("🚀 Starting migration execution...");

    // Check if database pool is connected
    if (!this.pool) {
      throw new Error("Database pool not connected. Make sure to call initialize() first.");
    }

    const pendingMigrations = await this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      logger.info("✅ No pending migrations to run");
      return;
    }

    logger.info(`📋 Found ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      await this.executeMigration(migration);
    }

    logger.info("🎉 All migrations completed successfully");
  }

  /**
   * Get migration status report
   */
  public async getStatus(): Promise<void> {
    const allMigrations = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();
    const pendingMigrations = await this.getPendingMigrations();
    const failedMigrations = executedMigrations.filter((m) => m.status === MigrationStatus.FAILED);

    logger.info("\n📊 Migration Status Report");
    logger.info("=".repeat(50));
    logger.info(`Total migrations: ${allMigrations.length}`);
    logger.info(`Executed: ${executedMigrations.length}`);
    logger.info(`Pending: ${pendingMigrations.length}`);
    logger.info(`Failed: ${failedMigrations.length}`);

    if (pendingMigrations.length > 0) {
      logger.info("\n📋 Pending Migrations:");
      pendingMigrations.forEach((m, i) => {
        logger.info(`  ${i + 1}. ${m.filename}`);
      });
    }

    if (failedMigrations.length > 0) {
      logger.info("\n❌ Failed Migrations:");
      failedMigrations.forEach((m, i) => {
        logger.info(`  ${i + 1}. ${m.filename} - ${m.errorMessage}`);
      });
    }
  }

  /**
   * Close all connections
   */
  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
    if (this.adminClient) {
      await this.adminClient.end();
    }
    logger.info("🔌 Migration Manager connections closed");
  }
}

export default MigrationManager;
