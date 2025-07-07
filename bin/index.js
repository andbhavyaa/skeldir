#!/usr/bin/env node
import chalk from "chalk";
import { program } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.resolve(__dirname, "..", "package.json"); // one level up
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const version = packageJson.version;

const isWindows = os.platform() === "win32";

// Log helpers
function logVerbose(msg, enabled) {
  if (enabled) console.log(chalk.gray(`[VERBOSE] ${msg}`));
}
function logDebug(msg, enabled) {
  if (enabled) console.log(chalk.magenta(`[DEBUG] ${msg}`));
}

function isValidProjectName(name) {
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

function parseTree(inputLines) {
  // The root is always the project folder, so we don't use the first line as root
  const root = {}; // All pasted lines are children of the root
  const stack = [{ depth: -1, node: root }];

  function getDepth(line) {
    const branchIndex = line.search(/├── |└── /);
    if (branchIndex === -1) return 0;
    return Math.floor(branchIndex / 4) + 1; // +1 because root is depth 0
  }

  for (let i = 0; i < inputLines.length; i++) {
    const line = inputLines[i];
    if (!line.trim()) continue;

    const depth = getDepth(line);
    const clean = line.replace(/^[│ ├└─]+/, "").trim();
    const isFolder = clean.endsWith("/");
    const name = isFolder ? clean.slice(0, -1) : clean;
    const node = isFolder ? {} : null;

    // Pop stack until we find parent at depth - 1
    while (stack.length && depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    parent[name] = node;

    if (isFolder) {
      stack.push({ depth, node });
    }
  }

  return root;
}


function indexStructure(structure) {
  let count = 1;
  const indexed = {};

  for (const key of Object.keys(structure)) {
    const value = structure[key];
    const newKey = `${count}. ${key}`;
    if (value && typeof value === "object") {
      indexed[newKey] = indexStructure(value);
    } else {
      indexed[newKey] = value;
    }
    count++;
  }
  return indexed;
}

// recursive function to create respective directories
function createCustomWithContent(
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
        fs.writeFileSync(fullPath, `// ${key} created by skelder\n`);
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
      console.error(chalk.red(`❌ Error creating ${fullPath}: ${err.message}`));
      if (debug) console.error(err.stack);
      process.exit(1);
    }
  }
}

program
  .name("skeldir")
  .description("CLI to scaffold projects with custom file structures")
  .argument("<project-name>", "Name of the project folder")
  .option("--flutter", "Generate Flutter folder structure")
  .option("--java", "Generate Java project")
  .option("--python", "Generate Python project")
  .option("--c", "Generate C project")
  .option("--cpp", "Generate C++ project")
  .option("--node", "Generate Node.js project")
  .option("--react", "Generate React project")
  .option("--custom", "Create project structure from pasted directory tree")
  .option("--index", "Prefix folders/files with their order in the tree")
  .option("--verbose", "Enable verbose logging")
  .option("--debug", "Enable debug logs (more detailed)")
  //show version dynamically
  .version(`skeldir CLI version ${version}`, "-v, --version")
  .action(async (projectName, options) => {
    const { verbose, debug } = options;

    logDebug(
      `Detected platform: ${isWindows ? "Windows" : "Unix-like"}`,
      debug
    );

    if (!isValidProjectName(projectName)) {
      console.log(
        chalk.red(
          "\n❌ Invalid project name. Use only letters, numbers, dashes, or underscores.\n"
        )
      );
      process.exit(1);
    }

    const targetDir = path.join(process.cwd(), projectName);
    if (fs.existsSync(targetDir)) {
      console.log(chalk.red("\n❌ Error: Folder already exists.\n"));
      process.exit(1);
    }

    try {
      fs.mkdirSync(targetDir);
      logVerbose(`Project directory created at: ${targetDir}`, verbose);
    } catch (err) {
      console.error(chalk.red(`❌ Failed to create directory: ${err.message}`));
      if (debug) console.error(err.stack);
      process.exit(1);
    }

    const writeFile = (filename, content) => {
      const filePath = path.join(targetDir, filename);
      fs.writeFileSync(filePath, content);
      logVerbose(`Created file: ${filePath}`, verbose);
    };

    const createReadme = () =>
      writeFile("README.md", `# ${projectName}\n\nCreated by skeldir CLI`);

    // structure handling
    if (options.flutter) {
      console.log(chalk.green("\n🚀 Creating Flutter project structure...\n"));
      const structure = {
        lib: {
          core: {
            "themes.dart": null,
            "utils.dart": null,
          },
          models: {
            "user_model.dart": null,
            "data_model.dart": null,
          },
          providers: {
            "theme_provider.dart": null,
            "data_provider.dart": null,
            "user_provider.dart": null,
          },
          services: {
            "api_service.dart": null,
            "storage_service.dart": null,
            "notification_service.dart": null,
          },
          "main.dart": null,
        },
      };
      createCustomWithContent(targetDir, structure, verbose, debug);
    } else if (options.java) {
      const javaPath = path.join(targetDir, "src", "main", "java");
      fs.mkdirSync(javaPath, { recursive: true });
      writeFile(
        path.join("src", "main", "java", "App.java"),
        `public class App {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}`
      );
      createReadme();
    } else if (options.python) {
      writeFile(
        "main.py",
        `def main():\n    print("Hello, Python!")\n\nif __name__ == "__main__":\n    main()\n`
      );
      createReadme();
    } else if (options.c) {
      writeFile(
        "main.c",
        `#include <stdio.h>\n\nint main() {\n    printf("Hello, C!\\n");\n    return 0;\n}\n`
      );
      createReadme();
    } else if (options.cpp) {
      writeFile(
        "main.cpp",
        `#include <iostream>\n\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}\n`
      );
      createReadme();
    } else if (options.node) {
      const packageJson = {
        name: projectName,
        version: "1.0.0",
        main: "index.js",
        scripts: {
          start: "node index.js",
        },
      };
      writeFile("package.json", JSON.stringify(packageJson, null, 2));
      writeFile("index.js", `console.log("Hello, Node.js!");\n`);
    } else if (options.react) {
      fs.mkdirSync(path.join(targetDir, "src"), { recursive: true });
      fs.mkdirSync(path.join(targetDir, "public"), { recursive: true });

      const packageJson = {
        name: projectName,
        version: "1.0.0",
        private: true,
        scripts: {
          start: "react-scripts start",
          build: "react-scripts build",
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
          "react-scripts": "5.0.1",
        },
      };
      writeFile("package.json", JSON.stringify(packageJson, null, 2));
      writeFile(
        path.join("src", "App.js"),
        `import React from 'react';\n\nexport default function App() {\n  return <h1>Hello, React!</h1>;\n}`
      );
      writeFile(
        path.join("src", "index.js"),
        `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);`
      );
      writeFile(
        path.join("public", "index.html"),
        `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${projectName}</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>`
      );
    } else if (options.custom) {
      console.log(
        chalk.green(
          "\n📋 Paste your directory structure (end with an empty line):\n"
        )
      );
      const readline = await import("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const lines = [];
      for await (const line of rl) {
        if (!line.trim()) break;
        lines.push(line);
      }
      rl.close();

      // Confirm if too many lines (> 20)
      if (lines.length > 20) {
        const confirmRl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const question = `You pasted a large structure with ${lines.length} lines. Are you sure you want to create it? (yes/no): `;

        const answer = await new Promise((resolve) => {
          confirmRl.question(question, (ans) => {
            confirmRl.close();
            resolve(ans.trim().toLowerCase());
          });
        });

        if (answer !== "yes" && answer !== "y") {
          console.log(colorText("Aborted by user.\n", chalk.red));
          process.exit(0);
        }
      }

      const structure = parseTree(lines);
      const indexedStructure = indexStructure(structure);
      const finalStructure = options.index ? indexedStructure : structure;
      createCustomWithContent(targetDir, finalStructure, verbose, debug);
    } else {
      console.log(
        chalk.yellow(
          "\n⚠️  No framework/language option selected. Created empty folder.\n"
        )
      );
    }

    console.log(
      chalk.green(`\n✅ Project '${projectName}' created at ${targetDir}\n`)
    );
  });

program.usage("<project-name> [options]");
program.parse();
