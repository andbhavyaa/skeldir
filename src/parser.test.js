import { describe, it, expect } from "vitest";
import { parseTree, indexStructure } from "./parser.js";

describe("parser", () => {
  describe("parseTree", () => {
    it("parses a simple tree structure", () => {
      const input = ["├── file1.js", "├── file2.js", "└── folder/"];
      const result = parseTree(input);
      expect(result).toHaveProperty("file1.js", null);
      expect(result).toHaveProperty("file2.js", null);
      expect(result).toHaveProperty("folder");
      expect(typeof result.folder).toBe("object");
    });

    it("parses nested directories", () => {
      const input = [
        "├── src/",
        "│   ├── index.js",
        "│   └── utils.js",
        "└── test/",
      ];
      const result = parseTree(input);
      expect(result.src).toHaveProperty("index.js", null);
      expect(result.src).toHaveProperty("utils.js", null);
      expect(result.test).toEqual({});
    });

    it("handles various branch characters", () => {
      const input = ["├── folder/", "│   ├── nested.js", "└── other.js"];
      const result = parseTree(input);
      expect(result.folder).toHaveProperty("nested.js", null);
      expect(result["other.js"]).toBeNull();
    });

    it("ignores empty lines", () => {
      const input = ["├── file.js", "", "└── other.js"];
      const result = parseTree(input);
      expect(Object.keys(result)).toHaveLength(2);
    });

    it("handles deep nesting", () => {
      const input = [
        "├── level1/",
        "│   └── level2/",
        "│       └── level3/",
        "│           └── file.txt",
      ];
      const result = parseTree(input);
      // Single root folder is unwrapped, so result is contents of level1/
      expect(result.level2.level3).toHaveProperty("file.txt", null);
    });

    it("unwraps single root folder", () => {
      const input = [
        "├── my-project/",
        "│   ├── src/",
        "│   │   └── index.js",
        "│   └── package.json",
      ];
      const result = parseTree(input);
      // Root folder "my-project/" should be unwrapped
      expect(result).toHaveProperty("src");
      expect(result).toHaveProperty("package.json");
      expect(result).not.toHaveProperty("my-project");
    });

    it("preserves multiple top-level items", () => {
      const input = [
        "├── src/",
        "│   └── index.js",
        "├── tests/",
        "└── package.json",
      ];
      const result = parseTree(input);
      // Multiple top-level items should not be unwrapped
      expect(result).toHaveProperty("src");
      expect(result).toHaveProperty("tests");
      expect(result).toHaveProperty("package.json");
    });
  });

  describe("indexStructure", () => {
    it("adds numbered prefixes to single level", () => {
      const input = { "a.txt": null, "b.txt": null, "c.txt": null };
      const result = indexStructure(input);
      expect(Object.keys(result)).toEqual(["1 - a.txt", "2 - b.txt", "3 - c.txt"]);
    });

    it("pads numbers correctly for 10+ items", () => {
      const items = {};
      for (let i = 1; i <= 15; i++) {
        items[`file${i}.txt`] = null;
      }
      const result = indexStructure(items);
      expect(Object.keys(result)[0]).toBe("01 - file1.txt");
      expect(Object.keys(result)[14]).toBe("15 - file15.txt");
    });

    it("pads numbers correctly for 100+ items", () => {
      const items = {};
      for (let i = 1; i <= 150; i++) {
        items[`file${i}.txt`] = null;
      }
      const result = indexStructure(items);
      expect(Object.keys(result)[0]).toBe("001 - file1.txt");
      expect(Object.keys(result)[149]).toBe("150 - file150.txt");
    });

    it("indexes nested structures", () => {
      const input = {
        "folder/": { "inner.txt": null },
        "file.txt": null,
      };
      const result = indexStructure(input);
      expect(result["1 - folder"]).toHaveProperty("1 - inner.txt", null);
      expect(result["2 - file.txt"]).toBeNull();
    });

    it("handles mixed files and folders", () => {
      const input = {
        "a.txt": null,
        "folder/": { "b.txt": null },
        "c.txt": null,
      };
      const result = indexStructure(input);
      expect(result["1 - a.txt"]).toBeNull();
      expect(result["2 - folder"]).toHaveProperty("1 - b.txt");
      expect(result["3 - c.txt"]).toBeNull();
    });
  });
});
