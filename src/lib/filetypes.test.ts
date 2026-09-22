import { describe, expect, it } from "vitest";
import { getExtension, getFileKind } from "@/lib/filetypes";

describe("getExtension", () => {
  it("extracts lowercase extensions", () => {
    expect(getExtension("test.HTML")).toBe("html");
    expect(getExtension("  notes.txt  ")).toBe("txt");
    expect(getExtension("archive.tar.gz")).toBe("gz");
  });

  it("returns empty for dotfiles, extensionless, and trailing dots", () => {
    expect(getExtension(".gitignore")).toBe("");
    expect(getExtension("README")).toBe("");
    expect(getExtension("file.")).toBe("");
  });
});

describe("getFileKind", () => {
  it("maps known types and ignores case", () => {
    expect(getFileKind("test.html")).toMatchObject({ label: "HTML", icon: "filetype-html" });
    expect(getFileKind("APP.TSX")).toMatchObject({ label: "TSX", icon: "filetype-tsx" });
    expect(getFileKind("photo.jpg")).toMatchObject({ label: "JPG", icon: "filetype-jpg" });
    expect(getFileKind("notes.txt")).toMatchObject({ icon: "filetype-txt" });
  });

  it("falls back gracefully for unknown or missing extensions", () => {
    expect(getFileKind("app.astro")).toMatchObject({ icon: "file-earmark-text" });
    expect(getFileKind("README")).toMatchObject({ icon: "file-earmark-text" });
  });
});
