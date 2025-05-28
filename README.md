# ⚡︎ skeldir (Skeleton Directory)

#### A minimal CLI tool to quickly scaffold clean project directories from your pasted tree structure.  
##### No clutter, no hassle — just your project ready to go.
[![npm version](https://img.shields.io/npm/v/skeldir)](https://www.npmjs.com/package/skeldir)

---

## 📚 Table of Contents

- [Why skeldir?](#why-skeldir)
- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [💡 Usage](#-usage)
- [📌 Examples](#-examples)
- [🛠️ Options](#️-options)
- [🤝 Contributing](#-contributing)



## Why skeldir?

I created `skeldir` because I got tired of manually setting up project folders every time I start a new idea. Copy-pasting old templates felt clunky and often included unnecessary files or folders I didn’t need.

AI can generate project layouts fast, but making all those files yourself is a hassle. `skeldir` takes the AI’s folder tree and builds the whole project instantly. Paste, generate, and start coding.

---

## ✨ Features

- Instantly generate project folder structures  
- Supports multiple languages and custom trees  
- Confirm before creating large structures  
- Verbose and debug modes for detailed logs  
- Cross-platform friendly: detects Windows vs Unix terminals  
- Easy to use with simple commands and options  

---

## 📦 Installation

```bash
npm install -g skeldir
```
  ####        (or)
```bash
npm i skeldir
```

## 💡 Usage
```bash
skeldir <project-name> [options]
```

## 📌 Examples
#### Create a Python project skeleton:
```bash
skeldir my_python_project --python
```

#### Use a custom tree structure (paste your tree structure when prompted, press ENTER to generate):
```bash
skeldir my_project --custom
```

#### Enable verbose logging to see more details:
```bash
skeldir myReactApp --react --verbose
```
#### Enable debug mode for deeper insights:
```bash
skeldir MyJavaProject --java --debug
```
#### Check Version (1.0.4):
```bash
skeldir --version
```

---

## 🛠️ Options

| Option          | Description                                         |
| --------------- | --------------------------------------------------- |
| `--flutter`     | Generate Flutter folder structure                   |
| `--java`        | Generate Java project                               |
| `--python`      | Generate Python project                             |
| `--c`           | Generate C project                                  |
| `--cpp`         | Generate C++ project                                |
| `--node`        | Generate Node.js project                            |
| `--react`       | Generate React project                              |
| `--custom`      | Create project structure from pasted directory tree |
| `--verbose`     | Enable verbose logging                              |
| `--debug`       | Enable debug logs (more detailed)                   |
| `-v, --version` | Show version number                                 |
| `-h, --help`    | Display help for command                            |

---

## 🤝 Contributing
### Contributions are welcome! Whether it's fixing bugs, suggesting new features, or improving the docs — every bit helps.

## 🧭 Getting Started
### 1. Fork this repo

### 2. Clone your fork

### 3. Install dependencies
```bash
npm install
```
### 4. Make your changes
#### Please follow the current coding style and keep commits clean and descriptive.

### 5. Test your changes
#### Make sure your additions work well and don’t break existing features.

### 6. Submit a pull request
- #### Describe what you changed and why
- #### Additionally, you may also link any related issues

---

