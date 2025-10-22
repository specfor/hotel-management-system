/* eslint-disable n/no-process-env */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import moduleAlias from "module-alias";

// Check the environment
const NODE_ENV = process.env.NODE_ENV ?? "development";

// Construct the path to the relevant .env file
const envPath = path.join(__dirname, `./config/.env.${NODE_ENV}`);

// Load .env file only if it exists
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    // eslint-disable-next-line no-console
    console.error(`❌ Error loading .env file: ${result.error}`);
  } else if (NODE_ENV === "development") {
    // Only log in development mode
    // eslint-disable-next-line no-console
    console.log(`✅ Loaded environment variables from ${envPath}`);
  }
} else if (NODE_ENV === "development") {
  // Only warn in development mode - production gets env vars from Kubernetes
  // eslint-disable-next-line no-console
  console.warn(`⚠️ No .env file found for NODE_ENV="${NODE_ENV}", using environment variables`);
}

// Configure module aliases
if (__filename.endsWith("js")) {
  // In production/compiled mode, @src maps to the dist directory root
  // because TypeScript doesn't resolve path aliases during compilation
  moduleAlias.addAlias("@src", __dirname);
} else {
  // In development with ts-node, @src points to src directory
  moduleAlias.addAlias("@src", path.join(__dirname, "src"));
}
