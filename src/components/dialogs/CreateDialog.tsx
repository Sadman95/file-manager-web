// Create dialog: folder/file tabs with live icon preview and validation.
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { generateId, validateName } from "@/lib/filesystem";
import { itemNameSchema, type ItemNameInput } from "@/lib/validation";
import type { NodeType } from "@/types/filesystem";
import { Modal } from "@/components/ui/Modal";
import { AppForm, TextField } from "@/components/ui/Form";
import { FileIcon, FolderIcon } from "@/components/ui/Icons";
import { cn } from "@/utils/cn";

interface CreateDialogProps {
  parentId: string;
  initialType: NodeType;
  onClose: () => void;
}

export function CreateDialog({ parentId, initialType, onClose }: CreateDialogProps) {
  const { state, dispatch } = useWorkspace();
  const [nodeType, setNodeType] = useState<NodeType>(initialType);
  const form = useForm<ItemNameInput>({
    resolver: zodResolver(itemNameSchema),
    defaultValues: { name: "" },
  });
  // Local mirror for the live icon preview (avoids `watch()`, which the
  // React Compiler lint flags as unmemoizable).
  const [preview, setPreview] = useState("");

  const submit = (values: ItemNameInput) => {
    const check = validateName(state.nodes, parentId, values.name);
    if (!check.ok) {
      form.setError("name", { message: check.error });
      return;
    }
    const id = generateId();
    dispatch({ type: "CREATE_NODE", id, name: values.name, nodeType, parentId });
    // New files open immediately so the user can start typing; folders stay put.
    if (nodeType === "file") dispatch({ type: "OPEN_FILE", id });
    toast.success(`Created ${nodeType === "folder" ? "folder" : "file"} “${values.name.trim()}”`);
    onClose();
  };

  return (
    <Modal title={nodeType === "folder" ? "New folder" : "New text file"} onClose={onClose}>
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
        {(["folder", "file"] as NodeType[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={nodeType === t}
            onClick={() => setNodeType(t)}
            className={cn(
              "rounded-md px-2 py-1.5 text-sm font-medium",
              nodeType === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
            )}
          >
            {t === "folder" ? "Folder" : "Text file"}
          </button>
        ))}
      </div>
      <AppForm form={form} onSubmit={submit} submitLabel="Create" onCancel={onClose}>
        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2">
          {nodeType === "folder" ? (
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
        <TextField
          name="name"
          label="Name"
          placeholder={nodeType === "folder" ? "e.g. Projects" : "e.g. notes.txt"}
          autoFocus
          onValueChange={setPreview}
        />
      </AppForm>
    </Modal>
  );
}
