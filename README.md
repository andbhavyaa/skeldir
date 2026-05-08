# ⚡︎ skeldir (Skeleton Directory)

#### A minimal CLI tool to quickly scaffold clean project directories from your pasted tree structure.
##### No clutter, no hassle — just your project ready to go.

[![npm version](https://img.shields.io/npm/v/skeldir)](https://www.npmjs.org/package/skeldir)

> **💡 Naming:** `skeldir` = tree → directory (create dir) • `skeldirnt` = directory → tree (generate tree)

---

## 📚 Table of Contents

- [Why skeldir?](#why-skeldir)
- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [💡 Usage](#-usage)
- [📌 Examples](#-examples)
- [🌳 Tree Generation (unskeldir!)](#-tree-generation-unskeldir)
- [📋 Template Management](#-template-management)
- [⚙️ Configuration](#-configuration)
- [🛠️ Options](#️-options)
- [🤝 Contributing](#-contributing)

---

## Why skeldir?

I created `skeldir` because I got tired of manually setting up project folders every time I start a new idea. Copy-pasting old templates felt clunky and often included unnecessary files or folders I didn't need.

AI can generate project layouts fast, but making all those files yourself is a hassle. `skeldir` takes the AI's folder tree and builds the whole project instantly. Paste, generate, and start coding.

---

## ✨ Features

- **Instant scaffolding** — Generate project folder structures from tree diagrams
- **Language templates** — Built-in templates for Flutter, Java, Python, C, C++, Node.js, React
- **Smart parsing** — Automatically handles root folders (no duplicate nesting)
- **Git integration** — Auto-initialize git repos
- **.gitignore generation** — Language-specific ignore files
- **Template persistence** — Save and reuse custom templates
- **Tree generation** — Generate tree structures from existing directories (unskeldir!)
- **Config file** — Customize defaults via `~/.skeldir.json`
- **Cross-platform** — Works on Windows, macOS, and Linux

---

## 📦 Installation

```bash
npm install -g skeldir
```

Or locally:
```bash
npm install skeldir
npx skeldir <project-name> [options]
```

---

## 💡 Usage

```bash
skeldir <project-name> [options]
```

---

## 📌 Examples

#### Create a Python project with git and .gitignore:
```bash
skeldir my_app --python --git
```

#### Create a React project with verbose output:
```bash
skeldir myReactApp --react --git --verbose
```

#### Use a custom tree structure:
```bash
skeldir my_project --custom
# Paste your tree structure and press ENTER
```

#### Create with numbered prefixes:
```bash
skeldir my_project --custom --index
```

---

## 🌳 Tree Generation (skeldirnt)

Generate a tree structure from an existing directory — perfect for documenting your project or creating templates!

```bash
# Generate tree from current directory
skeldir tree

# Generate tree from specific path
skeldir tree src

# Fun alias: skeldirnt (skeleton directory 'n tree)
skeldir skeldirnt my-project

# Save to file
skeldir tree . --output structure.txt

# Limit depth
skeldir tree . --max-depth 2

# Include hidden files
skeldir tree . --include-hidden
```

**Automatically ignores:** `node_modules`, `.git`, `dist`, `build`, `coverage`, `.next`, `.nuxt`, `target`, `bin`, `obj`, `.vscode`, `.idea`

---

## 📋 Template Management

Save and reuse your custom templates:

```bash
# Save a custom template
skeldir template save my-template
# Paste your tree structure when prompted

# List all saved templates
skeldir template list

# Use a saved template
skeldir my-project --use-template my-template

# Delete a template
skeldir template delete my-template
```

---

## ⚙️ Configuration

Customize skeldir behavior via `~/.skeldir.json`:

```bash
# Show current configuration
skeldir config --show

# Enable automatic git initialization
skeldir config --set-auto-git true

# Set a default template
skeldir config --set-default-template node
```

**Example `~/.skeldir.json`:**
```json
{
  "autoGitInit": true,
  "defaultTemplate": "node",
  "alwaysIncludeReadme": true,
  "customTemplatesPath": null
}
```

---

## 🛠️ Options

### Project Creation Options

| Option              | Description                                      |
| ------------------- | ------------------------------------------------ |
| `--flutter`         | Generate Flutter folder structure                |
| `--java`            | Generate Java project                            |
| `--python`          | Generate Python project                          |
| `--c`               | Generate C project                               |
| `--cpp`             | Generate C++ project                             |
| `--node`            | Generate Node.js project                         |
| `--react`           | Generate React project                           |
| `--custom`          | Create from pasted directory tree                |
| `--use-template <name>` | Use a saved custom template              |
| `--index`           | Prefix folders/files with numbered prefixes      |
| `--git`             | Initialize git repository                        |
| `--no-gitignore`    | Skip .gitignore file generation                  |
| `--verbose`         | Enable verbose logging                           |
| `--debug`           | Enable debug logs (more detailed)                |

### Tree Generation Options

| Option              | Description                                      |
| ------------------- | ------------------------------------------------ |
| `-o, --output <file>` | Save tree output to a file                    |
| `-d, --max-depth <n>` | Maximum depth to traverse                      |
| `-H, --include-hidden` | Include hidden files/folders                   |
| `-i, --ignore <patterns>` | Comma-separated patterns to ignore          |

### Other Commands

| Command             | Description                                      |
| ------------------- | ------------------------------------------------ |
| `-v, --version`     | Show version number                              |
| `-h, --help`        | Display help                                     |

---

## 🔄 Workflow Example

**Clone an existing project structure:**

```bash
# 1. Generate tree from existing project
skeldir tree existing-project --output my-tree.txt

# 2. Create new project from that tree
skeldir my-new-project --custom --git
# Paste the contents of my-tree.txt
```

---

## 🤝 Contributing

Contributions are welcome! Whether it's fixing bugs, suggesting new features, or improving the docs — every bit helps.

## 🧭 Getting Started

### 1. Fork this repo

### 2. Clone your fork
```bash
git clone https://github.com/your-username/skeldir.git
cd skeldir
```

### 3. Create your own branch
```bash
git checkout -b your-branch-name
```

### 4. Install dependencies
```bash
npm install
```

### 5. Make your changes
Please follow the current coding style and keep commits clean and descriptive.

### 6. Test your changes
```bash
npm test
```

### 7. Pull recent changes from main branch
```bash
git pull origin main
```

### 8. Push your branch
```bash
git push origin your-branch-name
```

### 9. Submit a pull request
- Describe what you changed and why
- Link any related issues

---

## 📄 License

MIT
