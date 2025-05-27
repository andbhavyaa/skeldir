#!/usr/bin/env node
import chalk from "chalk";
import { program } from "commander";
import fs from "fs";
import os from "os";
import path from "path";

const isWindows = os.platform() === "win32";

// for colored output that adapts to platform
function colorText(text, colorFunc) {
  return colorFunc(text);
}

// only allow letters, numbers, dashes, and underscores
function isValidProjectName(name) {
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

// important parsing required for pasted tree structure
function parseTree(inputLines) {
  const root = {};
  const stack = [{ depth: -1, node: root }];

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

    // find the depth till leaf node
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
    if (isFolder) {
      parent[name] = node;
      stack.push({ depth, node });
    } else {
      parent[name] = null;
    }
  });

  return root;
}

// create folders/files, supports string content for files in case files are not empty
function createFromStructureWithContent(basePath, structure, verbose = false) {
  for (const key in structure) {
    const fullPath = path.join(basePath, key);
    const value = structure[key];
    if (verbose) {
      console.log(colorText(`Creating: ${fullPath}`, chalk.gray));
    }
    if (value === null) {
      fs.writeFileSync(fullPath, `// ${key} created by CLI\n`);
    } else if (typeof value === "string") {
      fs.writeFileSync(fullPath, value);
    } else {
      fs.mkdirSync(fullPath, { recursive: true });
      createFromStructureWithContent(fullPath, value, verbose);
    }
  }
}

program
  .name("skeldir")
  .description("Minimal CLI to scaffold clean project directories.")
  .argument("<project-name>", "Name of the project folder")
  .option("--flutter", "Generate Flutter folder structure")
  .option("--java", "Generate Java project")
  .option("--python", "Generate Python project")
  .option("--c", "Generate C project")
  .option("--cpp", "Generate C++ project")
  .option("--node", "Generate Node.js project")
  .option("--react", "Generate React project")
  .option(
    "--custom",
    "Create project structure from pasted directory tree"
  )
  .option("--verbose", "Enable verbose logging")
  .option("--debug", "Enable debug logs (more detailed)")
  .version("1.0.0", "-v, --version", "Show version number")
  .action(async (projectName, options) => {
    const log = (msg) => {
      if (options.verbose || options.debug) console.log(msg);
    };
    const debugLog = (msg) => {
      if (options.debug) console.log(chalk.magenta(`[DEBUG] ${msg}`));
    };

    // DEBUG: Show detected platform
    debugLog(`Detected platform: ${isWindows ? "Windows (win32)" : "Unix-like (Linux/macOS)"}`);

    if (!isValidProjectName(projectName)) {
      console.log(
        colorText(
          "\n❌ Invalid project name. Use only letters, numbers, dashes, or underscores.\n",
          chalk.red
        )
      );
      process.exit(1);
    }

    const targetDir = path.join(process.cwd(), projectName);
    if (fs.existsSync(targetDir)) {
      console.log(colorText("\n❌ Error: Folder already exists.\n", chalk.red));
      process.exit(1);
    }

    fs.mkdirSync(targetDir);
    log(colorText(`Created base project directory: ${targetDir}`, chalk.gray));
    debugLog(`Target directory path: ${targetDir}`);

    if (options.flutter) {
      log(colorText("\n🚀 Creating Flutter project structure...\n", chalk.green));
      const structure = {
        lib: {
          core: {
            "themes.dart": null,
            "utils.dart": null,
          },
          "main.dart": null,
        },
      };
      createFromStructureWithContent(targetDir, structure, options.verbose);
      console.log(colorText(`\n✅ Flutter project created at ${targetDir}\n`, chalk.green));
    } else if (options.java) {
      log("Creating Java project structure...");
      const srcPath = path.join(targetDir, "src", "main", "java");
      fs.mkdirSync(srcPath, { recursive: true });
      const javaCode = `public class App {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`;
      fs.writeFileSync(path.join(srcPath, "App.java"), javaCode);
      fs.writeFileSync(path.join(targetDir, "README.md"), `# ${projectName}\n\nCreated by CLI`);
      console.log(colorText(`\n✅ Java project created at ${targetDir}\n`, chalk.green));
    } else if (options.python) {
      log("Creating Python project structure...");
      const mainPy = `def main():
    print("Hello, Python!")

if __name__ == "__main__":
    main()
`;
      fs.writeFileSync(path.join(targetDir, "main.py"), mainPy);
      fs.writeFileSync(path.join(targetDir, "README.md"), `# ${projectName}\n\nCreated by CLI`);
      console.log(colorText(`\n✅ Python project created at ${targetDir}\n`, chalk.green));
    } else if (options.c) {
      log("Creating C project structure...");
      const mainC = `#include <stdio.h>

int main() {
    printf("Hello, C!\\n");
    return 0;
}
`;
      fs.writeFileSync(path.join(targetDir, "main.c"), mainC);
      fs.writeFileSync(path.join(targetDir, "README.md"), `# ${projectName}\n\nCreated by CLI`);
      console.log(colorText(`\n✅ C project created at ${targetDir}\n`, chalk.green));
    } else if (options.cpp) {
      log("Creating C++ project structure...");
      const mainCpp = `#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}
`;
      fs.writeFileSync(path.join(targetDir, "main.cpp"), mainCpp);
      fs.writeFileSync(path.join(targetDir, "README.md"), `# ${projectName}\n\nCreated by CLI`);
      console.log(colorText(`\n✅ C++ project created at ${targetDir}\n`, chalk.green));
    } else if (options.node) {
      log("Creating Node.js project structure...");
      const packageJson = {
        name: projectName,
        version: "1.0.0",
        main: "index.js",
        scripts: {
          start: "node index.js",
        },
      };
      fs.writeFileSync(path.join(targetDir, "package.json"), JSON.stringify(packageJson, null, 2));
      fs.writeFileSync(path.join(targetDir, "index.js"), `console.log("Hello, Node.js!");\n`);
      console.log(colorText(`\n✅ Node.js project created at ${targetDir}\n`, chalk.green));
    } else if (options.react) {
      log("Creating React project structure...");
      fs.mkdirSync(path.join(targetDir, "src"), { recursive: true });
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
      fs.writeFileSync(path.join(targetDir, "package.json"), JSON.stringify(packageJson, null, 2));
      fs.writeFileSync(
        path.join(targetDir, "src", "App.js"),
        `import React from 'react';

export default function App() {
  return <h1>Hello, React!</h1>;
}
`
      );
      fs.writeFileSync(
        path.join(targetDir, "src", "index.js"),
        `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`
      );
      const publicDir = path.join(targetDir, "public");
      fs.mkdirSync(publicDir, { recursive: true });
      fs.writeFileSync(
        path.join(publicDir, "index.html"),
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`
      );
      console.log(colorText(`\n✅ React project created at ${targetDir}\n`, chalk.green));
    } else if (options.fromStructure) {
      log(
        "Paste your directory tree (end with empty line or Ctrl+D):"
      );

      // async read from stdin
      const lines = [];
      for await (const line of process.stdin) {
        if (line.trim() === "") break;
        lines.push(line);
      }

      debugLog(`Read ${lines.length} lines from stdin for tree structure`);
      const treeObj = parseTree(lines);
      debugLog(JSON.stringify(treeObj, null, 2));

      createFromStructureWithContent(targetDir, treeObj, options.verbose);
      console.log(colorText(`\n✅ Project structure created at ${targetDir}\n`, chalk.green));
    } else {
      // when no valid option is provided
      console.log(
        chalk.yellow(
          `\n⚠️  No project type option specified. Use --help to see usage.\n`
        )
      );
      process.exit(1);
    }
  });

program.usage('<project-name> [options]');
program.parse(process.argv);
