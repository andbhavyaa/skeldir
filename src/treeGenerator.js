import fs from "fs";
import path from "path";

const DEFAULT_IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  "target",
  "bin",
  "obj",
  ".vscode",
  ".idea",
];

function shouldIgnore(filePath, ignorePatterns) {
  const fileName = path.basename(filePath);
  const patterns = ignorePatterns || DEFAULT_IGNORE_PATTERNS;

  return patterns.some((pattern) => {
    // Support both exact match and wildcard patterns
    if (pattern.includes("*")) {
      const regex = new RegExp(
        "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
      );
      return regex.test(fileName);
    }
    return fileName === pattern;
  });
}

function getDirectoryStructure(
  dirPath,
  depth = 0,
  maxDepth = Infinity,
  includeHidden = false,
  ignorePatterns,
  isLast = true,
  prefix = ""
) {
  if (depth > maxDepth) return "";

  let result = "";
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    // Filter out hidden files if not included
    let filteredEntries = entries.filter((entry) => {
      if (!includeHidden && entry.name.startsWith(".")) return false;
      if (shouldIgnore(entry.name, ignorePatterns)) return false;
      return true;
    });

    // Sort: directories first, then files
    filteredEntries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    filteredEntries.forEach((entry, index) => {
      const isLastEntry = index === filteredEntries.length - 1;
      const connector = isLastEntry ? "└── " : "├── ";
      const entryPath = path.join(dirPath, entry.name);

      result += prefix + connector + entry.name;

      if (entry.isDirectory()) {
        result += "/\n";
        const newPrefix = prefix + (isLastEntry ? "    " : "│   ");
        result += getDirectoryStructure(
          entryPath,
          depth + 1,
          maxDepth,
          includeHidden,
          ignorePatterns,
          isLastEntry,
          newPrefix
        );
      } else {
        result += "\n";
      }
    });
  } catch (error) {
    // Skip directories we can't read
  }

  return result;
}

export function generateTree(dirPath = ".", options = {}) {
  const {
    includeHidden = false,
    maxDepth = Infinity,
    outputPath,
    ignorePatterns = DEFAULT_IGNORE_PATTERNS,
  } = options;

  const resolvedPath = path.resolve(dirPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Directory not found: ${resolvedPath}`);
  }

  const stats = fs.statSync(resolvedPath);
  if (!stats.isDirectory()) {
    throw new Error(`Not a directory: ${resolvedPath}`);
  }

  const dirName = path.basename(resolvedPath);
  let treeOutput = `${dirName}/\n`;

  treeOutput += getDirectoryStructure(
    resolvedPath,
    0,
    maxDepth,
    includeHidden,
    ignorePatterns,
    true,
    ""
  );

  if (outputPath) {
    fs.writeFileSync(outputPath, treeOutput, "utf8");
  }

  return treeOutput;
}

export function generateTreeForSkeldir(dirPath = ".", options = {}) {
  const {
    includeHidden = false,
    maxDepth = Infinity,
    ignorePatterns = DEFAULT_IGNORE_PATTERNS,
  } = options;

  const resolvedPath = path.resolve(dirPath);

  const buildTree = (currentPath, currentDepth, parentPrefix = "") => {
    if (currentDepth > maxDepth) return [];

    const lines = [];
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      let filteredEntries = entries.filter((entry) => {
        if (!includeHidden && entry.name.startsWith(".")) return false;
        if (shouldIgnore(entry.name, ignorePatterns)) return false;
        return true;
      });

      filteredEntries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      filteredEntries.forEach((entry, index) => {
        const isLast = index === filteredEntries.length - 1;
        const prefix = parentPrefix + (isLast ? "└── " : "├── ");
        const entryPath = path.join(currentPath, entry.name);
        const displayName = entry.name + (entry.isDirectory() ? "/" : "");

        lines.push(prefix + displayName);

        if (entry.isDirectory()) {
          const childPrefix = parentPrefix + (isLast ? "    " : "│   ");
          lines.push(...buildTree(entryPath, currentDepth + 1, childPrefix));
        }
      });
    } catch (error) {
      // Skip unreadable directories
    }

    return lines;
  };

  return buildTree(resolvedPath, 0);
}
