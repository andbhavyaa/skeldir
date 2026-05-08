import chalk from "chalk";
import os from "os";

export const isWindows = os.platform() === "win32";

export function logVerbose(msg, enabled) {
  if (enabled) console.log(chalk.gray(`[VERBOSE] ${msg}`));
}

export function logDebug(msg, enabled) {
  if (enabled) console.log(chalk.magenta(`[DEBUG] ${msg}`));
}

export function isValidProjectName(name) {
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

export function sanitizeName(name) {
  return name.replace(/[\\\/:\*\?"<>\|\r\n]/g, "").trim();
}
