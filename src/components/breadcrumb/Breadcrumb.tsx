"use client";

import { Fragment } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getAncestorPath } from "@/lib/filesystem";
import { cn } from "@/utils/cn";

export function Breadcrumb() {
  const { state, dispatch } = useWorkspace();
  const path = getAncestorPath(state.nodes, state.selectedFolderId);

  if (path.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
        {path.map((node, i) => {
          const isLast = i === path.length - 1;
          return (
            <Fragment key={node.id}>
              {i > 0 && <span aria-hidden="true" className="text-slate-300">/</span>}
              <li className="min-w-0">
                {isLast ? (
                  <span aria-current="page" className="font-semibold text-slate-900">
                    {node.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SELECT_FOLDER", id: node.id })}
                    className={cn(
                      "rounded px-1 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    {node.name}
                  </button>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
