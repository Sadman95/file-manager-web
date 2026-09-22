import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { EditorGuardProvider } from "@/contexts/EditorGuardContext";
import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return (
    <WorkspaceProvider>
      <EditorGuardProvider>
        <AppShell />
      </EditorGuardProvider>
    </WorkspaceProvider>
  );
}
