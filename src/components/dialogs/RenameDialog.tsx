"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { validateName } from "@/lib/filesystem";
import { itemNameSchema, type ItemNameInput } from "@/lib/validation";
import { Modal } from "@/components/ui/Modal";
import { AppForm, TextField } from "@/components/ui/Form";
import { FileIcon, FolderIcon } from "@/components/ui/Icons";

interface RenameDialogProps {
  nodeId: string;
  onClose: () => void;
}

export function RenameDialog({ nodeId, onClose }: RenameDialogProps) {
  const { state, dispatch } = useWorkspace();
  const node = state.nodes[nodeId];
  const form = useForm<ItemNameInput>({
    resolver: zodResolver(itemNameSchema),
    defaultValues: { name: node?.name ?? "" },
  });
  // Local mirror for the live icon preview (avoids `watch()`, which the
  // React Compiler lint flags as unmemoizable).
  const [preview, setPreview] = useState(node?.name ?? "");

  if (!node) return null;

  const submit = (values: ItemNameInput) => {
    if (values.name.trim() === node.name) {
      onClose();
      return;
    }
    const check = validateName(state.nodes, node.parentId, values.name, node.id);
    if (!check.ok) {
      form.setError("name", { message: check.error });
      return;
    }
    dispatch({ type: "RENAME_NODE", id: node.id, name: values.name });
    toast.success(`Renamed to “${values.name.trim()}”`);
    onClose();
  };

  return (
    <Modal title={`Rename ${node.type === "folder" ? "folder" : "file"}`} onClose={onClose}>
      <AppForm form={form} onSubmit={submit} submitLabel="Rename" onCancel={onClose}>
        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2">
          {node.type === "folder" ? (
            <span className="text-sky-600">
              <FolderIcon className="h-5 w-5" />
            </span>
          ) : (
            <FileIcon name={preview} />
          )}
          <span className="truncate text-sm text-slate-500">
            {preview.trim() === "" ? "Type a name to preview…" : preview.trim()}
          </span>
        </div>
        <TextField name="name" label="Name" autoFocus onValueChange={setPreview} />
      </AppForm>
    </Modal>
  );
}
