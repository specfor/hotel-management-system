import fs from "fs-extra";
import logger from "jet-logger";
import childProcess from "child_process";

/**
 * Start
 */
(async () => {
  try {
    // Remove current build
    await remove("./dist/");
    await exec("npm run lint", "./");
    await exec("tsc --build tsconfig.prod.json", "./");
    // Copy optional directories (if they exist)
    await copyIfExists("./src/public", "./dist/public");
    await copyIfExists("./src/views", "./dist/views");
    await copy("./temp/config.js", "./config.js");
    await copy("./temp/src", "./dist");
    await remove("./temp/");
  } catch (err) {
    logger.err(err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
})();

/**
 * Remove file
 */
function remove(loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.remove(loc, (err) => {
      return !!err ? rej(err) : res();
    });
  });
}

/**
 * Copy file.
 */
function copy(src: string, dest: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.copy(src, dest, (err) => {
      return !!err ? rej(err) : res();
    });
  });
}

/**
 * Copy file or directory if it exists.
 */
function copyIfExists(src: string, dest: string): Promise<void> {
  return new Promise((res) => {
    if (fs.existsSync(src)) {
      return fs.copy(src, dest, (err) => {
        if (err) {
          logger.warn(`Warning: Could not copy ${src} to ${dest}`);
        }
        return res();
      });
    }
    return res();
  });
}

/**
 * Do command line command.
 */
function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return childProcess.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
      if (!!stdout) {
        logger.info(stdout);
      }
      if (!!stderr) {
        logger.warn(stderr);
      }
      return !!err ? rej(err) : res();
    });
  });
}
