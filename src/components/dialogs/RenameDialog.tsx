"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { validateName } from "@/lib/filesystem";
import { itemNameSchema, type ItemNameInput } from "@/lib/validation";
import { Modal } from "@/components/ui/Modal";
import { AppForm, TextField } from "@/components/ui/Form";

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
    onClose();
  };

  return (
    <Modal title={`Rename ${node.type === "folder" ? "folder" : "file"}`} onClose={onClose}>
      <AppForm form={form} onSubmit={submit} submitLabel="Rename" onCancel={onClose}>
        <TextField name="name" label="Name" autoFocus />
      </AppForm>
    </Modal>
  );
}
