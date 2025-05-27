#!/usr/bin/env node
import chalk from "chalk";
import { program } from "commander";
import fs from "fs";
import os from "os";
import path from "path";

const isWindows = os.platform() === "win32";

// For colored output that adapts to platform
function colorText(text, colorFunc) {
  return colorFunc(text);
}

// Validate project name
function isValidProjectName(name) {
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

// Parse directory tree text into an object structure
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

// Recursively create folders/files from parsed structure
function createCustomWithContent(basePath, structure) {
  for (const key in structure) {
    const fullPath = path.join(basePath, key);
    const value = structure[key];
    if (value === null) {
      fs.writeFileSync(fullPath, `// ${key} created by CLI\n`);
    } else if (typeof value === "string") {
      fs.writeFileSync(fullPath, value);
    } else {
      fs.mkdirSync(fullPath, { recursive: true });
      createCustomWithContent(fullPath, value);
    }
  }
}

// Commander setup
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
  .action(async (projectName, options) => {
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

    fs.mkdirSync(targetDir);

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
      createCustomWithContent(targetDir, structure);
      console.log(
        chalk.green(`\n✅ Flutter project created at ${targetDir}\n`)
      );
    } else if (options.java) {
      const srcPath = path.join(targetDir, "src", "main", "java");
      fs.mkdirSync(srcPath, { recursive: true });
      const javaCode = `public class App {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`;
      fs.writeFileSync(path.join(srcPath, "App.java"), javaCode);
      fs.writeFileSync(
        path.join(targetDir, "README.md"),
        `# ${projectName}\n\nCreated by CLI`
      );
      console.log(chalk.green(`\n✅ Java project created at ${targetDir}\n`));
    } else if (options.python) {
      const mainPy = `def main():
    print("Hello, Python!")

if __name__ == "__main__":
    main()
`;
      fs.writeFileSync(path.join(targetDir, "main.py"), mainPy);
      fs.writeFileSync(
        path.join(targetDir, "README.md"),
        `# ${projectName}\n\nCreated by CLI`
      );
      console.log(chalk.green(`\n✅ Python project created at ${targetDir}\n`));
    } else if (options.c) {
      const mainC = `#include <stdio.h>

int main() {
    printf("Hello, C!\\n");
    return 0;
}
`;
      fs.writeFileSync(path.join(targetDir, "main.c"), mainC);
      fs.writeFileSync(
        path.join(targetDir, "README.md"),
        `# ${projectName}\n\nCreated by CLI`
      );
      console.log(chalk.green(`\n✅ C project created at ${targetDir}\n`));
    } else if (options.cpp) {
      const mainCpp = `#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}
`;
      fs.writeFileSync(path.join(targetDir, "main.cpp"), mainCpp);
      fs.writeFileSync(
        path.join(targetDir, "README.md"),
        `# ${projectName}\n\nCreated by CLI`
      );
      console.log(chalk.green(`\n✅ C++ project created at ${targetDir}\n`));
    } else if (options.node) {
      const packageJson = {
        name: projectName,
        version: "1.0.0",
        main: "index.js",
        scripts: {
          start: "node index.js",
        },
      };
      fs.writeFileSync(
        path.join(targetDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );
      fs.writeFileSync(
        path.join(targetDir, "index.js"),
        `console.log("Hello, Node.js!");\n`
      );
      console.log(
        chalk.green(`\n✅ Node.js project created at ${targetDir}\n`)
      );
    } else if (options.react) {
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
      fs.writeFileSync(
        path.join(targetDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );
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
      fs.mkdirSync(publicDir);
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
      console.log(chalk.green(`\n✅ React project created at ${targetDir}\n`));
    } else if (options.custom) {
      console.log(
        chalk.green(
          "\n📋 Paste your directory structure (end input with an empty line):\n"
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
      createCustomWithContent(targetDir, structure);
      console.log(
        chalk.cyan(
          `\n✅ Project '${projectName}' created from structure at ${targetDir}\n`
        )
      );
    } else {
      console.log(
        chalk.yellow(
          "\n⚠️ No valid framework/language selected. Base folder created.\n"
        )
      );
    }
  });

program.usage("<project-name> [options]");
program.parse();
