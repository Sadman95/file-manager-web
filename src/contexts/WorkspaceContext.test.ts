import { describe, expect, it } from "vitest";
import { workspaceReducer, type WorkspaceState } from "@/contexts/WorkspaceContext";
import { buildSeedSnapshot, SEED_IDS } from "@/lib/seed";

function seedState(): WorkspaceState {
  const { nodes, rootId } = buildSeedSnapshot();
  return {
    nodes,
    rootId,
    selectedFolderId: rootId,
    openFileId: null,
    expandedIds: [SEED_IDS.root, SEED_IDS.projects],
    isHydrated: true,
  };
}

describe("workspaceReducer", () => {
  it("creates folders and files with validation", () => {
    const s1 = workspaceReducer(seedState(), {
      type: "CREATE_NODE",
      id: "new-1",
      name: "  ",
      nodeType: "folder",
      parentId: SEED_IDS.root,
    });
    expect(Object.keys(s1.nodes)).toHaveLength(Object.keys(seedState().nodes).length);

    const s2 = workspaceReducer(seedState(), {
      type: "CREATE_NODE",
      id: "new-2",
      name: "Projects",
      nodeType: "folder",
      parentId: SEED_IDS.root,
    });
    expect(Object.keys(s2.nodes)).toHaveLength(Object.keys(seedState().nodes).length);

    const s3 = workspaceReducer(seedState(), {
      type: "CREATE_NODE",
      id: "new-3",
      name: "New Folder",
      nodeType: "folder",
      parentId: SEED_IDS.root,
    });
    expect(Object.keys(s3.nodes)).toHaveLength(Object.keys(seedState().nodes).length + 1);
    expect(s3.nodes["new-3"].name).toBe("New Folder");
  });

  it("renames and rejects duplicates", () => {
    const base = seedState();
    const renamed = workspaceReducer(base, {
      type: "RENAME_NODE",
      id: SEED_IDS.documents,
      name: "Docs",
    });
    expect(renamed.nodes[SEED_IDS.documents].name).toBe("Docs");

    const dup = workspaceReducer(base, {
      type: "RENAME_NODE",
      id: SEED_IDS.documents,
      name: "projects",
    });
    expect(dup.nodes[SEED_IDS.documents].name).toBe("Documents");
  });

  it("deletes folders recursively and reselects parent", () => {
    const base: WorkspaceState = { ...seedState(), selectedFolderId: SEED_IDS.webbly };
    const next = workspaceReducer(base, { type: "DELETE_NODE", id: SEED_IDS.projects });
    expect(next.nodes[SEED_IDS.webbly]).toBeUndefined();
    expect(next.nodes[SEED_IDS.notes]).toBeUndefined();
    expect(next.selectedFolderId).toBe(SEED_IDS.root);
    expect(next.openFileId).toBeNull();
  });

  it("never deletes the workspace root", () => {
    const base = seedState();
    const next = workspaceReducer(base, { type: "DELETE_NODE", id: base.rootId });
    expect(next).toBe(base);
  });

  it("updates file content only for files", () => {
    const base = seedState();
    const next = workspaceReducer(base, {
      type: "UPDATE_FILE_CONTENT",
      id: SEED_IDS.notes,
      content: "hello",
    });
    expect(next.nodes[SEED_IDS.notes].content).toBe("hello");

    const noop = workspaceReducer(base, {
      type: "UPDATE_FILE_CONTENT",
      id: SEED_IDS.projects,
      content: "x",
    });
    expect(noop).toBe(base);
  });

  it("opening a file navigates to its parent folder", () => {
    const next = workspaceReducer(seedState(), { type: "OPEN_FILE", id: SEED_IDS.notes });
    expect(next.openFileId).toBe(SEED_IDS.notes);
    expect(next.selectedFolderId).toBe(SEED_IDS.webbly);
  });

  it("selecting another folder closes the open file", () => {
    const base: WorkspaceState = { ...seedState(), openFileId: SEED_IDS.notes };
    const next = workspaceReducer(base, { type: "SELECT_FOLDER", id: SEED_IDS.documents });
    expect(next.selectedFolderId).toBe(SEED_IDS.documents);
    expect(next.openFileId).toBeNull();
  });
});
