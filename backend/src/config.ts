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

// /* eslint-disable n/no-process-env */
//
// import fs from "fs";
// import path from "path";
// import dotenv from "dotenv";
// import moduleAlias from "module-alias";
//
// // Check the environment
// const NODE_ENV = process.env.NODE_ENV ?? "development";
//
// // Construct the path to the relevant .env file
// const envPath = path.join(__dirname, `./config/.env.${NODE_ENV}`);
//
// // ✅ Load .env file only if it exists
// if (fs.existsSync(envPath)) {
//   const result = dotenv.config({ path: envPath });
//   if (result.error) {
//     console.error(`❌ Error loading .env file: ${result.error}`);
//   } else {
//     console.log(`✅ Loaded environment variables from ${envPath}`);
//   }
// } else {
//   console.warn(`⚠️ No .env file found for NODE_ENV="${NODE_ENV}", skipping dotenv load`);
// }
//
// // Configure module aliases
// if (__filename.endsWith("js")) {
//   moduleAlias.addAlias("@src", path.join(__dirname, "/dist"));
// }


/* eslint-disable n/no-process-env */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import moduleAlias from "module-alias";

// Determine the environment
const NODE_ENV = process.env.NODE_ENV ?? "development";

// Path to the corresponding .env file
const envPath = path.join(__dirname, `./config/.env.${NODE_ENV}`);

// Load environment variables only if file exists
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`❌ Error loading .env file: ${result.error}`);
  } else {
    console.log(`✅ Loaded environment variables from ${envPath}`);
  }
} else {
  console.warn(`⚠️ No .env file found for NODE_ENV="${NODE_ENV}", skipping dotenv load`);
}

// ✅ Fix module alias after TypeScript build
// When compiled, files live under /dist/src, not /dist
const baseDir = __dirname.includes("/dist") ? path.join(__dirname, "src") : path.join(__dirname, "src");
moduleAlias.addAlias("@src", baseDir);

