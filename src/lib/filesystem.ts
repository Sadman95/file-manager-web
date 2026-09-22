import type { FSNode, NameValidation, NodeMap, NodeType } from "@/types/filesystem";

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface CreateNodeInput {
  name: string;
  type: NodeType;
  parentId: string | null;
  content?: string;
}

export function createFSNode({ name, type, parentId, content }: CreateNodeInput): FSNode {
  const now = Date.now();
  return {
    id: generateId(),
    name: name.trim(),
    type,
    parentId,
    content: type === "file" ? (content ?? "") : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function getNode(nodes: NodeMap, id: string): FSNode | undefined {
  return nodes[id];
}

export function sortNodes(items: FSNode[]): FSNode[] {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

/** Direct children of a folder, sorted folders-first then A–Z. */
export function getChildren(nodes: NodeMap, parentId: string | null): FSNode[] {
  return sortNodes(Object.values(nodes).filter((n) => n.parentId === parentId));
}

/**
 * All ids in the subtree rooted at `id`, including `id` itself.
 * Depth-first, guards against cycles and missing nodes.
 */
export function getDescendantIds(nodes: NodeMap, id: string): string[] {
  if (!nodes[id]) return [];
  const result: string[] = [];
  const visited = new Set<string>();
  const stack: string[] = [id];

  while (stack.length > 0) {
    const current = stack.pop() as string;
    if (visited.has(current)) continue;
    visited.add(current);
    const node = nodes[current];
    if (!node) continue;
    result.push(current);
    for (const child of Object.values(nodes)) {
      if (child.parentId === current && !visited.has(child.id)) {
        stack.push(child.id);
      }
    }
  }
  return result;
}

/**
 * Path from workspace root down to `id` (inclusive).
 * Guards against broken parent links and cycles.
 */
export function getAncestorPath(nodes: NodeMap, id: string): FSNode[] {
  const path: FSNode[] = [];
  const visited = new Set<string>();
  let current = nodes[id];

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    if (current.parentId === null) break;
    current = nodes[current.parentId];
  }
  return path;
}

export function getFullPath(nodes: NodeMap, id: string, sep = " / "): string {
  return getAncestorPath(nodes, id)
    .map((n) => n.name)
    .join(sep);
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Validation shared by create + rename.
 * - Rejects empty names and `/` `\` (would break path display).
 * - Rejects duplicates within the same folder (case-insensitive).
 * - `excludeId` skips the node being renamed so keeping the same name passes.
 */
export function validateName(
  nodes: NodeMap,
  parentId: string | null,
  rawName: string,
  excludeId?: string,
): NameValidation {
  const name = rawName.trim();
  if (!name) return { ok: false, error: "Name cannot be empty." };
  if (name.includes("/") || name.includes("\\")) {
    return { ok: false, error: 'Name cannot contain "/" or "\\".' };
  }
  const normalized = normalizeName(name);
  const duplicate = Object.values(nodes).some(
    (n) => n.parentId === parentId && n.id !== excludeId && normalizeName(n.name) === normalized,
  );
  if (duplicate) return { ok: false, error: `"${name}" already exists in this folder.` };
  return { ok: true };
}

/**
 * Workspace-wide, case-insensitive substring search on names.
 * Empty query returns no results (caller shows hint instead).
 */
export function searchNodes(nodes: NodeMap, query: string): FSNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return sortNodes(
    Object.values(nodes).filter((n) => n.name.toLowerCase().includes(q)),
  );
}

export function isFolder(node: FSNode): boolean {
  return node.type === "folder";
}

export function isFile(node: FSNode): boolean {
  return node.type === "file";
}
