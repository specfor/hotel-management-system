/**
 * Migration CLI Script
 * Usage: npm run migrate [command]
 * Commands:
 *   - init: Initialize migration manager and database
 *   - run: Run pending migrations
 *   - status: Show migration status
 *   - create <name>: Create a new migration file
 */

import { resolve } from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import MigrationManager from "./migrationManager";
import logger from "jet-logger";

const MIGRATIONS_DIR = resolve(__dirname, "../migrations");

/**
 * Create a new migration file
 */
async function createMigration(name: string): Promise<void> {
  if (!name) {
    logger.err("❌ Migration name is required");
    logger.info("Usage: npm run migrate create <migration_name>");
    process.exit(1);
  }

  // Ensure migrations directory exists
  if (!existsSync(MIGRATIONS_DIR)) {
    await mkdir(MIGRATIONS_DIR, { recursive: true });
    logger.info(`📁 Created migrations directory: ${MIGRATIONS_DIR}`);
  }

  // Generate timestamp and filename
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
  const filename = `${timestamp}_${name.replace(/\s+/g, "_").toLowerCase()}.sql`;
  const filepath = resolve(MIGRATIONS_DIR, filename);

  // Migration template
  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Description: Add description here

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add your SQL statements here
-- Example:
-- CREATE TABLE example_table (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- =====================================================
-- NOTES
-- =====================================================
-- This migration will be executed in a transaction.
-- If any statement fails, the entire migration will be rolled back.
-- 
-- Best practices:
-- 1. Always include CREATE INDEX statements for foreign keys
-- 2. Use TIMESTAMP WITH TIME ZONE for datetime fields
-- 3. Add NOT NULL constraints where appropriate
-- 4. Consider adding default values for new columns
-- 5. Test migrations on a copy of production data first

-- =====================================================
-- ROLLBACK (Manual - for reference only)
-- =====================================================
-- If you need to manually rollback this migration:
-- DROP TABLE IF EXISTS example_table;
`;

  await writeFile(filepath, template);
  logger.info(`✅ Created migration: ${filename}`);
  logger.info(`📝 Edit the file: ${filepath}`);
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  const command = process.argv[2];
  const arg = process.argv[3];

  if (!command) {
    console.log(`
🔧 Migration Manager CLI

Usage: npm run migrate [command]

Commands:
  init                 Initialize migration manager and database
  run                  Run all pending migrations
  status              Show migration status report
  create <name>       Create a new migration file

Examples:
  npm run migrate init
  npm run migrate run
  npm run migrate status
  npm run migrate create "add_users_table"
  npm run migrate create "add_booking_constraints"
    `);
    process.exit(0);
  }

  const migrationManager = new MigrationManager(MIGRATIONS_DIR);

  try {
    switch (command) {
      case "init":
        logger.info("🚀 Initializing migration manager...");
        await migrationManager.initialize();
        logger.info("✅ Migration manager initialized successfully");
        break;

      case "run":
        logger.info("🚀 Running migrations...");
        await migrationManager.initialize();
        await migrationManager.runMigrations();
        break;

      case "status":
        logger.info("📊 Checking migration status...");
        await migrationManager.initialize();
        await migrationManager.getStatus();
        break;

      case "create":
        await createMigration(arg);
        break;

      default:
        logger.err(`❌ Unknown command: ${command}`);
        logger.info("Run 'npm run migrate' to see available commands");
        process.exit(1);
    }
  } catch (error) {
    logger.err("❌ Migration command failed:");
    logger.err(error);
    await migrationManager.close();
    process.exit(1);
  }

  // Close connections after successful completion
  await migrationManager.close();
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("⏹️  Migration interrupted");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("⏹️  Migration terminated");
  process.exit(0);
});

// Run the CLI
main().catch((error) => {
  logger.err("💥 Unhandled error:");
  logger.err(error);
  process.exit(1);
});
