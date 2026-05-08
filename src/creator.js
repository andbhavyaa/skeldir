import fs from "fs";
import path from "path";
import { logVerbose, logDebug } from "./utils.js";

export function createCustomWithContent(
  basePath,
  structure,
  verbose = false,
  debug = false
) {
  for (const key in structure) {
    const fullPath = path.join(basePath, key);
    const value = structure[key];
    try {
      if (value === null) {
        fs.writeFileSync(fullPath, `// ${key} created by skeldir\n`);
        logVerbose(`Created file: ${fullPath}`, verbose);
      } else if (typeof value === "string") {
        fs.writeFileSync(fullPath, value);
        logVerbose(`Created file with content: ${fullPath}`, verbose);
      } else {
        fs.mkdirSync(fullPath, { recursive: true });
        logVerbose(`Created folder: ${fullPath}`, verbose);
        createCustomWithContent(fullPath, value, verbose, debug);
      }
    } catch (err) {
      console.error(`❌ Error creating ${fullPath}: ${err.message}`);
      if (debug) console.error(err.stack);
      throw err;
    }
  }
}

export function writeFile(targetDir, filename, content, verbose = false) {
  const filePath = path.join(targetDir, filename);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  if (verbose) console.log(`Created file: ${filePath}`);
}

export function createReadme(targetDir, projectName, verbose = false) {
  writeFile(
    targetDir,
    "README.md",
    `# ${projectName}\n\nCreated by skeldir CLI`,
    verbose
  );
}
