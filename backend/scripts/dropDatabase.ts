import { Client } from "pg";
import logger from "jet-logger";
import ENV from "@src/common/constants/ENV";
import { createInterface } from "readline";

async function promptConfirm(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === "y" || normalized === "yes");
    });
  });
}

async function databaseExists(adminClient: Client, dbName: string): Promise<boolean> {
  const result = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  return result.rows.length > 0;
}

async function terminateConnections(adminClient: Client, dbName: string): Promise<void> {
  await adminClient.query(
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity " + "WHERE datname = $1 AND pid <> pg_backend_pid()",
    [dbName]
  );
}

async function dropDatabase(): Promise<void> {
  const args = process.argv.slice(2);
  const force = args.includes("--force") || args.includes("--yes") || args.includes("-y");

  const targetDbNameRaw = ENV.Db.Name;
  const safeDbName = targetDbNameRaw.replace(/[^a-zA-Z0-9_]/g, "");
  if (safeDbName !== targetDbNameRaw) {
    throw new Error("Invalid database name in ENV. " + "Only alphanumeric and underscore are allowed.");
  }

  const adminClient = new Client({
    host: ENV.Db.Host,
    port: ENV.Db.Port,
    database: "postgres",
    user: ENV.Db.User,
    password: ENV.Db.Password,
  });

  await adminClient.connect();
  logger.info("🔌 Connected to PostgreSQL as admin");

  try {
    const exists = await databaseExists(adminClient, safeDbName);
    if (!exists) {
      logger.info(`ℹ️  Database "${safeDbName}" does not exist. Nothing to drop.`);
      return;
    }

    if (!force) {
      const confirmed = await promptConfirm(
        `⚠️  This will DROP the database "${safeDbName}" and all data. Continue? (y/n): `
      );
      if (!confirmed) {
        logger.info("⏭️  Drop cancelled by user");
        return;
      }
    }

    logger.info(`🔧 Terminating active connections to "${safeDbName}"...`);
    await terminateConnections(adminClient, safeDbName);

    logger.info(`🗑️  Dropping database: ${safeDbName}`);
    await adminClient.query(`DROP DATABASE "${safeDbName}"`);
    logger.info(`✅ Database "${safeDbName}" dropped successfully`);
  } finally {
    await adminClient.end();
    logger.info("🔌 Admin connection closed");
  }
}

dropDatabase().catch((error: unknown) => {
  logger.err("❌ Failed to drop database:");
  logger.err(error);
  throw error;
});
