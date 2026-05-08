#!/usr/bin/env node
import chalk from "chalk";
import { program } from "commander";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import { execSync } from "child_process";

import { isWindows, logVerbose, logDebug, isValidProjectName } from "../src/utils.js";
import { parseTree, indexStructure } from "../src/parser.js";
import { createCustomWithContent, createReadme } from "../src/creator.js";
import { templates } from "../src/templates.js";
import { loadConfig, getConfigPath } from "../src/config.js";
import { gitignoreTemplates } from "../src/gitignore.js";
import {
  saveTemplateFromInput,
  loadTemplate,
  listTemplates,
  deleteTemplate,
  getTemplatesDir,
} from "../src/templateManager.js";
import { generateTree, generateTreeForSkeldir } from "../src/treeGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.resolve(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const version = packageJson.version;

// Helper function to initialize git repository
function initGitRepo(targetDir, verbose = false) {
  try {
    execSync("git init", { cwd: targetDir, stdio: "pipe" });
    logVerbose("Initialized git repository", verbose);
    return true;
  } catch (error) {
    console.warn(chalk.yellow("⚠️  Git initialization failed. Is git installed?"));
    return false;
  }
}

program
  .name("skeldir")
  .description("CLI to scaffold projects • skeldir = tree → dir, skeldirnt = dir → tree")
  .argument("<project-name>", "Name of the project folder")
  .option("--flutter", "Generate Flutter folder structure")
  .option("--java", "Generate Java project")
  .option("--python", "Generate Python project")
  .option("--c", "Generate C project")
  .option("--cpp", "Generate C++ project")
  .option("--node", "Generate Node.js project")
  .option("--react", "Generate React project")
  .option("--custom", "Create project structure from pasted directory tree")
  .option("--use-template <name>", "Use a saved custom template")
  .option("--index", "Prefix folders/files with their order in the tree")
  .option("--git", "Initialize git repository")
  .option("--no-gitignore", "Skip .gitignore file generation")
  .option("--verbose", "Enable verbose logging")
  .option("--debug", "Enable debug logs (more detailed)")
  .option("--show-config", "Show current configuration")
  .version(`skeldir CLI version ${version}`, "-v, --version")
  .action(async (projectName, options) => {
    const { verbose, debug, showConfig } = options;

    // Load config
    const config = loadConfig();

    // Show config if requested
    if (showConfig) {
      console.log(chalk.cyan("\n📋 Current Configuration:\n"));
      console.log(JSON.stringify(config, null, 2));
      console.log(chalk.gray(`\nConfig file: ${getConfigPath()}\n`));
      return;
    }

    logDebug(`Detected platform: ${isWindows ? "Windows" : "Unix-like"}`, debug);
    logDebug(`Loaded config: ${JSON.stringify(config)}`, debug);

    // Validate project name
    if (!isValidProjectName(projectName)) {
      console.log(
        chalk.red(
          "\n❌ Invalid project name. Use only letters, numbers, dashes, or underscores.\n"
        )
      );
      process.exit(1);
    }

    // Check if directory already exists
    const targetDir = path.join(process.cwd(), projectName);
    if (fs.existsSync(targetDir)) {
      console.log(chalk.red("\n❌ Error: Folder already exists.\n"));
      process.exit(1);
    }

    // Create project directory
    try {
      fs.mkdirSync(targetDir);
      logVerbose(`Project directory created at: ${targetDir}`, verbose);
    } catch (err) {
      console.error(chalk.red(`❌ Failed to create directory: ${err.message}`));
      if (debug) console.error(err.stack);
      process.exit(1);
    }

    // Determine whether to initialize git
    const shouldInitGit = options.git || config.autoGitInit;

    // Determine which template to use
    let structure = null;
    let needsReadme = false;
    let templateType = null;

    const templateOptions = [
      "flutter",
      "java",
      "python",
      "c",
      "cpp",
      "node",
      "react",
    ];

    const selectedTemplate = templateOptions.find((opt) => options[opt]);

    if (selectedTemplate) {
      console.log(
        chalk.green(`\n🚀 Creating ${selectedTemplate.toUpperCase()} project structure...\n`)
      );
      structure = templates[selectedTemplate](projectName);
      templateType = selectedTemplate;
      needsReadme = !structure["README.md"]; // Create README if template doesn't have one
    } else if (options.useTemplate) {
      console.log(
        chalk.green(`\n📂 Using custom template '${options.useTemplate}'...\n`)
      );
      structure = loadTemplate(options.useTemplate);
      if (!structure) {
        console.log(
          chalk.red(`\n❌ Template '${options.useTemplate}' not found.\n`)
        );
        console.log(chalk.gray(`Templates are stored in: ${getTemplatesDir()}\n`));
        process.exit(1);
      }
      templateType = "custom";
    } else if (options.custom) {
      console.log(
        chalk.green("\n📋 Paste your directory structure (end with an empty line):\n")
      );

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

      // Confirm for large structures
      if (lines.length > 20) {
        const confirmRl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const answer = await new Promise((resolve) => {
          confirmRl.question(
            `You pasted a large structure with ${lines.length} lines. Are you sure you want to create it? (yes/no): `,
            (ans) => {
              confirmRl.close();
              resolve(ans.trim().toLowerCase());
            }
          );
        });

        if (answer !== "yes" && answer !== "y") {
          console.log(chalk.red("\n⚠️  Aborted by user.\n"));
          process.exit(0);
        }
      }

      structure = parseTree(lines);
      templateType = "custom";
    }

    // Create the structure
    if (structure) {
      const finalStructure = options.index
        ? indexStructure(structure)
        : structure;
      createCustomWithContent(targetDir, finalStructure, verbose, debug);

      // Create README for templates that need it
      if (needsReadme && config.alwaysIncludeReadme !== false) {
        createReadme(targetDir, projectName, verbose);
      }

      // Add .gitignore if not explicitly disabled and template doesn't have one
      if (!options.noGitignore && !structure[".gitignore"]) {
        const gitignoreContent =
          gitignoreTemplates[templateType] || gitignoreTemplates.default;
        fs.writeFileSync(
          path.join(targetDir, ".gitignore"),
          gitignoreContent
        );
        logVerbose("Created .gitignore file", verbose);
      }
    } else {
      console.log(
        chalk.yellow(
          "\n⚠️  No framework/language option selected. Created empty folder.\n"
        )
      );

      // Still add default .gitignore if not disabled
      if (!options.noGitignore) {
        fs.writeFileSync(
          path.join(targetDir, ".gitignore"),
          gitignoreTemplates.default
        );
        logVerbose("Created default .gitignore file", verbose);
      }
    }

    // Initialize git if requested
    if (shouldInitGit) {
      initGitRepo(targetDir, verbose);
    }

    console.log(
      chalk.green(`\n✅ Project '${projectName}' created at ${targetDir}\n`)
    );
  });

// Template management commands
const templateCmd = program.command("template");

templateCmd
  .command("save <name>")
  .description("Save a custom template from pasted directory structure")
  .action(async (name) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const success = await saveTemplateFromInput(name, rl);
    rl.close();

    if (success) {
      console.log(
        chalk.green(`\n✅ Template '${name}' saved successfully!\n`)
      );
    }
  });

templateCmd
  .command("list")
  .description("List all saved custom templates")
  .action(() => {
    const templates = listTemplates();
    if (templates.length === 0) {
      console.log(chalk.yellow("\n⚠️  No saved templates found.\n"));
      console.log(chalk.gray(`Templates are stored in: ${getTemplatesDir()}\n`));
      return;
    }

    console.log(chalk.cyan("\n📂 Saved Templates:\n"));
    templates.forEach((t) => console.log(`  - ${t}`));
    console.log();
  });

templateCmd
  .command("delete <name>")
  .description("Delete a saved custom template")
  .action((name) => {
    const success = deleteTemplate(name);
    if (success) {
      console.log(chalk.green(`\n✅ Template '${name}' deleted.\n`));
    } else {
      console.log(chalk.red(`\n❌ Template '${name}' not found.\n`));
    }
  });

// Config command
program
  .command("config")
  .description("Manage skeldir configuration")
  .option("--show", "Show current configuration")
  .option("--set-auto-git <true|false>", "Enable/disable automatic git initialization")
  .option("--set-default-template <name>", "Set default template")
  .action((options) => {
    const config = loadConfig();

    if (options.show) {
      console.log(chalk.cyan("\n📋 Current Configuration:\n"));
      console.log(JSON.stringify(config, null, 2));
      console.log(chalk.gray(`\nConfig file: ${getConfigPath()}\n`));
      return;
    }

    if (options.setAutoGit !== undefined) {
      config.autoGitInit = options.setAutoGit === "true";
      fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2));
      console.log(chalk.green(`\n✅ autoGitInit set to ${config.autoGitInit}\n`));
    }

    if (options.setDefaultTemplate !== undefined) {
      config.defaultTemplate = options.setDefaultTemplate;
      fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2));
      console.log(
        chalk.green(`\n✅ defaultTemplate set to '${config.defaultTemplate}'\n`)
      );
    }
  });

program.usage("<project-name> [options]");

// Tree generation command (skeldirnt = skeleton directory 'n tree)
program
  .command("tree [path]")
  .alias("skeldirnt")
  .description("Generate a tree structure from an existing directory (aka skeldirnt)")
  .option("-o, --output <file>", "Save output to a file")
  .option("-d, --max-depth <number>", "Maximum depth to traverse", "Infinity")
  .option("-H, --include-hidden", "Include hidden files/folders (starting with .)")
  .option("-i, --ignore <patterns>", "Comma-separated patterns to ignore (e.g., node_modules,dist)")
  .action((pathArg = ".", options) => {
    const ignorePatterns = options.ignore
      ? options.ignore.split(",").map((p) => p.trim())
      : undefined;

    const treeOptions = {
      includeHidden: options.includeHidden || false,
      maxDepth: options.maxDepth === "Infinity" ? Infinity : parseInt(options.maxDepth, 10),
      outputPath: options.output,
      ignorePatterns,
    };

    try {
      const tree = generateTree(pathArg, treeOptions);

      if (options.output) {
        console.log(chalk.green(`\n✅ Tree saved to ${options.output}\n`));
      } else {
        console.log(chalk.cyan("\n🌳 Directory Tree:\n"));
        console.log(tree);
        console.log(chalk.gray("\n💡 Tip: Use --output <file> to save, or pipe to clipboard\n"));
      }
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

program.parse();
