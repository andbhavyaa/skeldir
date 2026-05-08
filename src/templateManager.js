import fs from "fs";
import path from "path";
import os from "os";
import { parseTree } from "./parser.js";

export function getTemplatesDir() {
  const configDir = path.join(os.homedir(), ".skeldir");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  const templatesDir = path.join(configDir, "templates");
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  return templatesDir;
}

export function saveTemplate(name, structure) {
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, `${name}.json`);

  try {
    fs.writeFileSync(templatePath, JSON.stringify(structure, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving template: ${error.message}`);
    return false;
  }
}

export function loadTemplate(name) {
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, `${name}.json`);

  if (!fs.existsSync(templatePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(templatePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading template: ${error.message}`);
    return null;
  }
}

export function listTemplates() {
  const templatesDir = getTemplatesDir();
  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  try {
    const files = fs.readdirSync(templatesDir);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch (error) {
    return [];
  }
}

export function deleteTemplate(name) {
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, `${name}.json`);

  if (!fs.existsSync(templatePath)) {
    return false;
  }

  try {
    fs.unlinkSync(templatePath);
    return true;
  } catch (error) {
    console.error(`Error deleting template: ${error.message}`);
    return false;
  }
}

export async function saveTemplateFromInput(name, rl) {
  console.log(
    `\n📋 Paste your directory structure for template '${name}' (end with an empty line):`
  );

  const lines = [];
  for await (const line of rl) {
    if (!line.trim()) break;
    lines.push(line);
  }

  if (lines.length === 0) {
    console.log("No input provided. Template not saved.");
    return false;
  }

  const structure = parseTree(lines);
  return saveTemplate(name, structure);
}
