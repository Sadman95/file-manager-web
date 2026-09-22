"use client";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useEditorGuard } from "@/contexts/EditorGuardContext";
import { getChildren } from "@/lib/filesystem";
import type { FSNode } from "@/types/filesystem";
import { cn } from "@/utils/cn";
import { ChevronIcon, FolderIcon } from "@/components/ui/Icons";

function TreeNode({ node, depth }: { node: FSNode; depth: number }) {
  const { state, dispatch } = useWorkspace();
  const { guarded } = useEditorGuard();
  const children = getChildren(state.nodes, node.id).filter((n) => n.type === "folder");
  const isExpanded = state.expandedIds.includes(node.id);
  const isSelected = state.selectedFolderId === node.id;
  const hasChildren = children.length > 0;

  return (
    <li>
      <div
        className={cn(
          "group flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-sm",
          isSelected ? "bg-slate-900 font-medium text-white" : "text-slate-700 hover:bg-slate-100",
        )}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        <button
          type="button"
          aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
          aria-expanded={isExpanded}
          disabled={!hasChildren}
          onClick={() => dispatch({ type: "TOGGLE_EXPAND", id: node.id })}
          className={cn(
            "rounded p-0.5",
            hasChildren
              ? isSelected
                ? "text-slate-300 hover:bg-white/10"
                : "text-slate-400 hover:bg-slate-200"
              : "invisible",
          )}
        >
          <span className={cn("block transition-transform", isExpanded && "rotate-90")}>
            <ChevronIcon />
          </span>
        </button>
        <button
          type="button"
          onClick={() => guarded(() => dispatch({ type: "SELECT_FOLDER", id: node.id }))}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-current={isSelected ? "true" : undefined}
        >
          <span className={isSelected ? "text-sky-300" : "text-sky-600"}>
            <FolderIcon />
          </span>
          <span className="truncate">{node.name}</span>
        </button>
      </div>
      {isExpanded && hasChildren && (
        <ul>
          {children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeView() {
  const { state } = useWorkspace();
  const root = state.nodes[state.rootId];
  if (!root) return <p className="p-2 text-sm text-slate-500">Workspace is empty.</p>;

  return (
    <nav aria-label="Folder tree">
      <ul>
        <TreeNode node={root} depth={0} />
      </ul>
    </nav>
  );
}
