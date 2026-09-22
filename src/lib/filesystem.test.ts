import { describe, expect, it } from "vitest";
import {
  getAncestorPath,
  getChildren,
  getDescendantIds,
  getFullPath,
  searchNodes,
  validateName,
} from "@/lib/filesystem";
import { buildSeedSnapshot, SEED_IDS } from "@/lib/seed";

describe("filesystem utils", () => {
  it("seeds the spec example tree", () => {
    const { nodes, rootId } = buildSeedSnapshot();
    expect(rootId).toBe(SEED_IDS.root);
    expect(nodes[rootId].name).toBe("Workspace");
    expect(getChildren(nodes, SEED_IDS.webbly).map((n) => n.name)).toEqual([
      "notes.txt",
      "tasks.txt",
    ]);
  });

  it("sorts children folders-first then A-Z", () => {
    const { nodes, rootId } = buildSeedSnapshot();
    expect(getChildren(nodes, rootId).map((n) => n.name)).toEqual([
      "Documents",
      "Projects",
      "README.txt",
    ]);
  });

  it("collects nested descendants for recursive delete", () => {
    const { nodes } = buildSeedSnapshot();
    const ids = getDescendantIds(nodes, SEED_IDS.projects);
    expect(ids).toContain(SEED_IDS.webbly);
    expect(ids).toContain(SEED_IDS.personal);
    expect(ids).toContain(SEED_IDS.notes);
    expect(ids).toContain(SEED_IDS.tasks);
    expect(getDescendantIds(nodes, "missing")).toEqual([]);
  });

  it("builds root-to-node breadcrumb paths", () => {
    const { nodes } = buildSeedSnapshot();
    expect(getAncestorPath(nodes, SEED_IDS.notes).map((n) => n.name)).toEqual([
      "Workspace",
      "Projects",
      "Webbly",
      "notes.txt",
    ]);
    expect(getFullPath(nodes, SEED_IDS.notes)).toBe("Workspace / Projects / Webbly / notes.txt");
  });

  it("validates empty, slash, and duplicate names", () => {
    const { nodes } = buildSeedSnapshot();
    expect(validateName(nodes, SEED_IDS.root, "   ").ok).toBe(false);
    expect(validateName(nodes, SEED_IDS.root, "a/b").ok).toBe(false);
    expect(validateName(nodes, SEED_IDS.root, "projects").ok).toBe(false); // case-insensitive dup
    expect(validateName(nodes, SEED_IDS.documents, "Projects").ok).toBe(true); // other folder OK
    expect(
      validateName(nodes, SEED_IDS.root, "Projects", SEED_IDS.projects).ok,
    ).toBe(true); // rename self OK
  });

  it("searches workspace-wide, case-insensitive, across nesting", () => {
    const { nodes } = buildSeedSnapshot();
    expect(searchNodes(nodes, "")).toEqual([]);
    expect(searchNodes(nodes, "webbly").map((n) => n.name)).toContain("Webbly");
    expect(searchNodes(nodes, "WEB").map((n) => n.name)).toEqual(
      expect.arrayContaining(["Webbly"]),
    );
    expect(searchNodes(nodes, "notes").map((n) => n.name)).toContain("notes.txt");
  });
});
