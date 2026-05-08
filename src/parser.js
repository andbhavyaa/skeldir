import { sanitizeName } from "./utils.js";

export function parseTree(inputLines) {
  let root = {};
  const stack = [{ depth: -1, node: root }];

  function getDepth(line) {
    const branchIndex = line.search(/├── |└── /);
    if (branchIndex === -1) return 0;
    return Math.floor(branchIndex / 4) + 1;
  }

  for (let i = 0; i < inputLines.length; i++) {
    const line = inputLines[i];
    if (!line.trim()) continue;

    const depth = getDepth(line);
    const clean = line.replace(/^[│ ├└─]+/, "").trim();
    if (!clean) continue;
    const isFolder = clean.endsWith("/");
    let name = isFolder ? clean.slice(0, -1) : clean;
    name = sanitizeName(name);
    if (!name) continue;
    const node = isFolder ? {} : null;

    while (stack.length && depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    parent[name] = node;

    if (isFolder) {
      stack.push({ depth, node });
    }
  }

  // Auto-detect and unwrap single root folder
  // If there's only one top-level item and it's a folder, use its contents
  const keys = Object.keys(root);
  if (keys.length === 1) {
    const singleKey = keys[0];
    const singleValue = root[singleKey];
    // If it's a folder (object) and not a file (null), unwrap it
    if (singleValue && typeof singleValue === "object") {
      return singleValue;
    }
  }

  return root;
}

export function indexStructure(structure) {
  const keys = Object.keys(structure);
  const total = keys.length;
  let padLength = 0;
  if (total > 99) {
    padLength = 3;
  } else if (total > 9) {
    padLength = 2;
  } else {
    padLength = 1;
  }

  let count = 1;
  const indexed = {};

  for (const key of keys) {
    const value = structure[key];
    const indexStr = String(count).padStart(padLength, "0");
    const newKey = `${indexStr} - ${sanitizeName(key)}`;
    if (!sanitizeName(key)) {
      count++;
      continue;
    }
    if (value && typeof value === "object") {
      indexed[newKey] = indexStructure(value);
    } else {
      indexed[newKey] = value;
    }
    count++;
  }
  return indexed;
}
