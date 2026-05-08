import fs from "fs";
import path from "path";
import os from "os";

const DEFAULT_CONFIG = {
  autoGitInit: false,
  defaultTemplate: null,
  alwaysIncludeReadme: true,
  customTemplatesPath: null,
};

export function getConfigPath() {
  return path.join(os.homedir(), ".skeldir.json");
}

export function loadConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const configContent = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configContent);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    console.warn(`Warning: Failed to load config from ${configPath}`);
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config) {
  const configPath = getConfigPath();
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error(`Error: Failed to save config to ${configPath}`);
    return false;
  }
}

export function getConfigValue(key) {
  const config = loadConfig();
  return config[key];
}
