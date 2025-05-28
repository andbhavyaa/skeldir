#!/usr/bin/env node
import chalk from "chalk";
import { program } from "commander";
import fs, { readFileSync } from "fs";
import os from "os";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Now safely read the correct package.json from root
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8")
);

program.version(packageJson.version, "-v, --version", "Show version number");

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

// parse pasted tree structure
function parseTree(inputLines) {
  const root = {};
  const stack = [{ depth: -1, node: root }];

  // find depth
  function getDepth(line) {
    const treeChars = new Set([" ", "│", "├", "└", "─"]);
    let firstCharIndex = 0;
    while (
      firstCharIndex < line.length &&
      treeChars.has(line[firstCharIndex])
    ) {
      firstCharIndex++;
    }
    return Math.floor(firstCharIndex / 4);
  }

  inputLines.forEach((line) => {
    if (!line.trim()) return;

    const depth = getDepth(line);
    const trimmed = line.trim();
    const clean = trimmed.replace(/^[├└│─\s]+/, "");
    const isFolder = clean.endsWith("/");
    const name = isFolder ? clean.slice(0, -1) : clean;
    const node = isFolder ? {} : null;

    while (stack.length && depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    parent[name] = node;
    if (isFolder) stack.push({ depth, node });
  });

  return root;
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
  .option("--verbose", "Enable verbose logging")
  .option("--debug", "Enable debug logs (more detailed)")
  .version(packageJson.version, "-v, --version", "Show version number")
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

      const structure = parseTree(lines);
      createCustomWithContent(targetDir, structure, verbose, debug);
    } else {
      console.log(
        chalk.yellow(
          "\n⚠️ No framework/language option selected. Created empty folder.\n"
        )
      );
    }

    console.log(
      chalk.green(`\n✅ Project '${projectName}' created at ${targetDir}\n`)
    );
  });

program.usage("<project-name> [options]");
program.parse();
