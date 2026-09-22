// Core domain types: file-system nodes and workspace snapshots.
export type NodeType = "folder" | "file";

export interface FSNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  /** Only present for files. Plain text content. */
  content?: string;
  createdAt: number;
  updatedAt: number;
}

export type NodeMap = Record<string, FSNode>;

export interface WorkspaceSnapshot {
  nodes: NodeMap;
  rootId: string;
}

export interface NameValidation {
  ok: boolean;
  error?: string;
}
