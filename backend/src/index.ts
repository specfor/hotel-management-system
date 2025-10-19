import logger from "jet-logger";
import "../config";
import ENV from "@src/common/constants/ENV";
import server from "./server";
import db from "@src/common/util/db";

/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MSG = `Express server started on http://${ENV.Host}:${ENV.Port}`;

/******************************************************************************
                            Initialize Database
******************************************************************************/

async function initializeDatabase(): Promise<void> {
  try {
    logger.info("Connecting to database...");
    await db.connect();
    logger.info("Database initialized successfully");
  } catch (error) {
    logger.err("Failed to initialize database:");
    logger.err(error);
    throw new Error("Failed to initialize database");
  }
}

/******************************************************************************
                                  Run
******************************************************************************/

// Initialize database and start the server
async function startServer(): Promise<void> {
  try {
    // Connect to database first
    await initializeDatabase();

    // Start the server
    server.listen(ENV.Port, ENV.Host, (err?: Error) => {
      if (!!err) {
        logger.err(err.message);
      } else {
        logger.info(SERVER_START_MSG);
      }
    });
  } catch (error) {
    logger.err("Failed to start server:");
    logger.err(error);
    throw new Error("Failed to start server");
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await db.close();
  throw new Error("Process terminated");
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await db.close();
  throw new Error("Process terminated");
});

// Start the application
startServer().catch((error: unknown) => {
  logger.err("Unhandled error during startup:");
  logger.err(error);
  throw new Error("Failed to start server");
});
