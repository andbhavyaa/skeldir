import { describe, it, expect } from "vitest";
import { isValidProjectName, sanitizeName } from "./utils.js";

describe("utils", () => {
  describe("isValidProjectName", () => {
    it("accepts valid names with letters", () => {
      expect(isValidProjectName("project")).toBe(true);
    });

    it("accepts valid names with numbers", () => {
      expect(isValidProjectName("project123")).toBe(true);
    });

    it("accepts valid names with dashes", () => {
      expect(isValidProjectName("my-project")).toBe(true);
    });

    it("accepts valid names with underscores", () => {
      expect(isValidProjectName("my_project")).toBe(true);
    });

    it("rejects names with spaces", () => {
      expect(isValidProjectName("my project")).toBe(false);
    });

    it("rejects names with special characters", () => {
      expect(isValidProjectName("project@")).toBe(false);
      expect(isValidProjectName("project!")).toBe(false);
    });

    it("rejects empty names", () => {
      expect(isValidProjectName("")).toBe(false);
    });
  });

  describe("sanitizeName", () => {
    it("removes invalid characters", () => {
      expect(sanitizeName("file<>name")).toBe("filename");
    });

    it("removes path separators", () => {
      expect(sanitizeName("folder/file")).toBe("folderfile");
      expect(sanitizeName("folder\\file")).toBe("folderfile");
    });

    it("trims whitespace", () => {
      expect(sanitizeName("  name  ")).toBe("name");
    });

    it("removes wildcards and quotes", () => {
      expect(sanitizeName('file*name?"test"')).toBe("filenametest");
    });

    it("handles empty strings", () => {
      expect(sanitizeName("")).toBe("");
    });

    it("removes pipe characters", () => {
      expect(sanitizeName("file|name")).toBe("filename");
    });
  });
});
