// /* eslint-disable n/no-process-env */
//
// import path from "path";
// import dotenv from "dotenv";
// import moduleAlias from "module-alias";
//
//
// // Check the env
// const NODE_ENV = (process.env.NODE_ENV ?? "development");
//
// // Configure "dotenv"
// const result2 = dotenv.config({
//   path: path.join(__dirname, `./config/.env.${NODE_ENV}`),
// });
// if (result2.error) {
//   throw result2.error;
// }
//
// // Configure moduleAlias
// if (__filename.endsWith("js")) {
//   moduleAlias.addAlias("@src", __dirname + "/dist");
// }

import dotenv from "dotenv";
import path from "path";

// Determine which .env file to load
const envFile = process.env.NODE_ENV === "production"
  ? ".env.production"
  : ".env.development";

dotenv.config({ path: path.resolve(__dirname, "config", envFile) });

// Optional: Debug print
console.log(`[CONFIG] Loaded environment file: ${envFile}`);

