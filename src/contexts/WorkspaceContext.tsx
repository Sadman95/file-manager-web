"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import type { NodeMap, NodeType } from "@/types/filesystem";
import { createFSNode, getAncestorPath, getDescendantIds, validateName } from "@/lib/filesystem";
import { buildSeedSnapshot, SEED_IDS } from "@/lib/seed";
import {
  loadPersistedWorkspace,
  savePersistedWorkspace,
  type PersistedWorkspace,
} from "@/lib/storage";

export interface WorkspaceState {
  nodes: NodeMap;
  rootId: string;
  selectedFolderId: string;
  openFileId: string | null;
  expandedIds: string[];
  isHydrated: boolean;
}

export type WorkspaceAction =
  | { type: "CREATE_NODE"; name: string; nodeType: NodeType; parentId: string }
  | { type: "RENAME_NODE"; id: string; name: string }
  | { type: "DELETE_NODE"; id: string }
  | { type: "UPDATE_FILE_CONTENT"; id: string; content: string }
  | { type: "SELECT_FOLDER"; id: string }
  | { type: "OPEN_FILE"; id: string }
  | { type: "CLOSE_FILE" }
  | { type: "TOGGLE_EXPAND"; id: string }
  | { type: "HYDRATE"; snapshot: PersistedWorkspace | null }
  | { type: "RESET_TO_SEED" };

function defaultExpandedIds(): string[] {
  return [SEED_IDS.root, SEED_IDS.projects];
}

function buildInitialState(): WorkspaceState {
  const { nodes, rootId } = buildSeedSnapshot();
  return {
    nodes,
    rootId,
    selectedFolderId: rootId,
    openFileId: null,
    expandedIds: defaultExpandedIds(),
    isHydrated: false,
  };
}

function addUnique(ids: string[], extra: string[]): string[] {
  const set = new Set(ids);
  for (const id of extra) set.add(id);
  return [...set];
}

function nearestSurvivingFolder(
  nodes: NodeMap,
  rootId: string,
  fromParentId: string | null,
): string {
  let currentId = fromParentId;
  while (currentId !== null) {
    const node = nodes[currentId];
    if (node && node.type === "folder") return currentId;
    currentId = node?.parentId ?? null;
  }
  return rootId;
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "CREATE_NODE": {
      const parent = state.nodes[action.parentId];
      if (!parent || parent.type !== "folder") return state;
      const validation = validateName(state.nodes, action.parentId, action.name);
      if (!validation.ok) return state;
      const node = createFSNode({
        name: action.name,
        type: action.nodeType,
        parentId: action.parentId,
        content: action.nodeType === "file" ? "" : undefined,
      });
      return {
        ...state,
        nodes: { ...state.nodes, [node.id]: node },
        expandedIds: addUnique(state.expandedIds, [action.parentId]),
      };
    }

    case "RENAME_NODE": {
      const node = state.nodes[action.id];
      if (!node) return state;
      if (node.name === action.name.trim()) return state;
      const validation = validateName(state.nodes, node.parentId, action.name, action.id);
      if (!validation.ok) return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.id]: { ...node, name: action.name.trim(), updatedAt: Date.now() },
        },
      };
    }

    case "DELETE_NODE": {
      if (action.id === state.rootId) return state;
      const target = state.nodes[action.id];
      if (!target) return state;
      const doomed = new Set(getDescendantIds(state.nodes, action.id));
      const nodes: NodeMap = Object.fromEntries(
        Object.entries(state.nodes).filter(([id]) => !doomed.has(id)),
      );
      const selectedFolderId = doomed.has(state.selectedFolderId)
        ? nearestSurvivingFolder(nodes, state.rootId, target.parentId)
        : state.selectedFolderId;
      return {
        ...state,
        nodes,
        selectedFolderId,
        openFileId: state.openFileId && doomed.has(state.openFileId) ? null : state.openFileId,
        expandedIds: state.expandedIds.filter((id) => !doomed.has(id)),
      };
    }

    case "UPDATE_FILE_CONTENT": {
      const node = state.nodes[action.id];
      if (!node || node.type !== "file") return state;
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.id]: { ...node, content: action.content, updatedAt: Date.now() },
        },
      };
    }

    case "SELECT_FOLDER": {
      const node = state.nodes[action.id];
      if (!node || node.type !== "folder") return state;
      const ancestors = getAncestorPath(state.nodes, action.id).map((n) => n.id);
      return {
        ...state,
        selectedFolderId: action.id,
        expandedIds: addUnique(state.expandedIds, ancestors),
      };
    }

    case "OPEN_FILE": {
      const node = state.nodes[action.id];
      if (!node || node.type !== "file" || node.parentId === null) return state;
      const ancestors = getAncestorPath(state.nodes, action.id).map((n) => n.id);
      return {
        ...state,
        openFileId: action.id,
        selectedFolderId: node.parentId,
        expandedIds: addUnique(state.expandedIds, ancestors),
      };
    }

    case "CLOSE_FILE":
      return state.openFileId === null ? state : { ...state, openFileId: null };

    case "TOGGLE_EXPAND": {
      const node = state.nodes[action.id];
      if (!node || node.type !== "folder") return state;
      return {
        ...state,
        expandedIds: state.expandedIds.includes(action.id)
          ? state.expandedIds.filter((id) => id !== action.id)
          : [...state.expandedIds, action.id],
      };
    }

    case "HYDRATE": {
      if (!action.snapshot) return { ...state, isHydrated: true };
      const { nodes, rootId, selectedFolderId, expandedIds } = action.snapshot;
      const selected = nodes[selectedFolderId]?.type === "folder" ? selectedFolderId : rootId;
      return {
        nodes,
        rootId,
        selectedFolderId: selected,
        openFileId: null,
        expandedIds: expandedIds.filter((id) => nodes[id]?.type === "folder"),
        isHydrated: true,
      };
    }

    case "RESET_TO_SEED": {
      const { nodes, rootId } = buildSeedSnapshot();
      return {
        nodes,
        rootId,
        selectedFolderId: rootId,
        openFileId: null,
        expandedIds: defaultExpandedIds(),
        isHydrated: true,
      };
    }
  }
}

interface WorkspaceContextValue {
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, buildInitialState);

  // Client-only rehydration: server renders seed, then we load localStorage once.
  useEffect(() => {
    dispatch({ type: "HYDRATE", snapshot: loadPersistedWorkspace() });
  }, []);

  // Persist UI + content after hydration. Open file is session-only.
  useEffect(() => {
    if (!state.isHydrated) return;
    savePersistedWorkspace({
      version: 1,
      nodes: state.nodes,
      rootId: state.rootId,
      selectedFolderId: state.selectedFolderId,
      expandedIds: state.expandedIds,
    });
  }, [state.nodes, state.rootId, state.selectedFolderId, state.expandedIds, state.isHydrated]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
