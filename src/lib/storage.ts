import type { NodeMap } from "@/types/filesystem";

export const STORAGE_KEY = "mini-workspace:v1";
const STORAGE_VERSION = 1;

export interface PersistedWorkspace {
  version: number;
  nodes: NodeMap;
  rootId: string;
  selectedFolderId: string;
  expandedIds: string[];
}

function isValidPersisted(value: unknown): value is PersistedWorkspace {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v["version"] !== STORAGE_VERSION) return false;
  if (typeof v["rootId"] !== "string" || typeof v["selectedFolderId"] !== "string") return false;
  if (typeof v["nodes"] !== "object" || v["nodes"] === null) return false;
  if (!Array.isArray(v["expandedIds"])) return false;
  const nodes = v["nodes"] as NodeMap;
  const rootId = v["rootId"] as string;
  const root = nodes[rootId];
  if (!root || root.type !== "folder" || root.parentId !== null) return false;
  for (const node of Object.values(nodes)) {
    if (
      typeof node.id !== "string" ||
      typeof node.name !== "string" ||
      (node.type !== "folder" && node.type !== "file") ||
      (node.parentId !== null && typeof node.parentId !== "string")
    ) {
      return false;
    }
    if (node.parentId !== null && !nodes[node.parentId]) return false;
  }
  return true;
}

export function loadPersistedWorkspace(): PersistedWorkspace | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidPersisted(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function savePersistedWorkspace(snapshot: PersistedWorkspace): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Quota or private-mode failures must not crash the app.
  }
}

export function clearPersistedWorkspace(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
