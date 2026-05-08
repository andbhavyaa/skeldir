import { gitignoreTemplates } from "./gitignore.js";

export const templates = {
  flutter: (projectName) => ({
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
    ".gitignore": gitignoreTemplates.flutter,
  }),

  java: () => ({
    src: {
      main: {
        java: {
          "App.java": `public class App {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`,
        },
      },
    },
    "README.md": null,
    ".gitignore": gitignoreTemplates.java,
  }),

  python: () => ({
    "main.py": `def main():
    print("Hello, Python!")

if __name__ == "__main__":
    main()
`,
    "README.md": null,
    ".gitignore": gitignoreTemplates.python,
  }),

  c: () => ({
    "main.c": `#include <stdio.h>

int main() {
    printf("Hello, C!\\n");
    return 0;
}
`,
    "README.md": null,
    ".gitignore": gitignoreTemplates.c,
  }),

  cpp: () => ({
    "main.cpp": `#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}
`,
    "README.md": null,
    ".gitignore": gitignoreTemplates.cpp,
  }),

  node: (projectName) => ({
    "package.json": JSON.stringify(
      {
        name: projectName,
        version: "1.0.0",
        main: "index.js",
        scripts: {
          start: "node index.js",
        },
      },
      null,
      2
    ),
    "index.js": `console.log("Hello, Node.js!");\n`,
    ".gitignore": gitignoreTemplates.node,
  }),

  react: (projectName) => ({
    src: {
      "App.js": `import React from 'react';

export default function App() {
  return <h1>Hello, React!</h1>;
}`,
      "index.js": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
    },
    public: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
    },
    "package.json": JSON.stringify(
      {
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
      },
      null,
      2
    ),
    ".gitignore": gitignoreTemplates.react,
  }),
};
