import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { createCustomWithContent, writeFile, createReadme } from "./creator.js";

describe("creator", () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "skeldir-test-"));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("createCustomWithContent", () => {
    it("creates files with default content", () => {
      const structure = { "test.txt": null };
      createCustomWithContent(testDir, structure);
      const filePath = path.join(testDir, "test.txt");
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, "utf8")).toContain("created by skeldir");
    });

    it("creates files with custom content", () => {
      const structure = { "test.txt": "custom content" };
      createCustomWithContent(testDir, structure);
      const filePath = path.join(testDir, "test.txt");
      expect(fs.readFileSync(filePath, "utf8")).toBe("custom content");
    });

    it("creates nested directories", () => {
      const structure = {
        "level1/": {
          "level2/": {
            "file.txt": null,
          },
        },
      };
      createCustomWithContent(testDir, structure);
      const filePath = path.join(testDir, "level1", "level2", "file.txt");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("creates multiple files at root level", () => {
      const structure = {
        "a.txt": null,
        "b.txt": null,
        "c.txt": null,
      };
      createCustomWithContent(testDir, structure);
      expect(fs.existsSync(path.join(testDir, "a.txt"))).toBe(true);
      expect(fs.existsSync(path.join(testDir, "b.txt"))).toBe(true);
      expect(fs.existsSync(path.join(testDir, "c.txt"))).toBe(true);
    });

    it("handles mixed files and folders", () => {
      const structure = {
        "file.txt": null,
        "folder/": { "nested.txt": null },
        "other.txt": null,
      };
      createCustomWithContent(testDir, structure);
      expect(fs.existsSync(path.join(testDir, "file.txt"))).toBe(true);
      expect(fs.existsSync(path.join(testDir, "folder", "nested.txt"))).toBe(true);
      expect(fs.existsSync(path.join(testDir, "other.txt"))).toBe(true);
    });
  });

  describe("writeFile", () => {
    it("writes file to target directory", () => {
      writeFile(testDir, "test.txt", "content", false);
      const filePath = path.join(testDir, "test.txt");
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, "utf8")).toBe("content");
    });

    it("creates nested directories if needed", () => {
      writeFile(testDir, path.join("nested", "dir", "test.txt"), "content", false);
      const filePath = path.join(testDir, "nested", "dir", "test.txt");
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe("createReadme", () => {
    it("creates README with project name", () => {
      createReadme(testDir, "TestProject", false);
      const filePath = path.join(testDir, "README.md");
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf8");
      expect(content).toContain("# TestProject");
      expect(content).toContain("Created by skeldir CLI");
    });
  });
});
