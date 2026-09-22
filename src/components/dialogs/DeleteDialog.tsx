"use client";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getDescendantIds } from "@/lib/filesystem";
import { Modal } from "@/components/ui/Modal";

interface DeleteDialogProps {
  nodeId: string;
  onClose: () => void;
}

export function DeleteDialog({ nodeId, onClose }: DeleteDialogProps) {
  const { state, dispatch } = useWorkspace();
  const node = state.nodes[nodeId];
  if (!node) return null;

  const nestedCount = getDescendantIds(state.nodes, nodeId).length - 1;
  const confirm = () => {
    dispatch({ type: "DELETE_NODE", id: nodeId });
    onClose();
  };

  return (
    <Modal title={`Delete ${node.type === "folder" ? "folder" : "file"}`} onClose={onClose}>
      <p className="text-sm text-slate-600">
        Delete <span className="font-semibold text-slate-900">“{node.name}”</span>
        {node.type === "folder" && nestedCount > 0 && (
          <>
            {" "}and its <span className="font-semibold">{nestedCount} nested item(s)</span>
          </>
        )}
        ? This cannot be undone.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirm}
          autoFocus
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
