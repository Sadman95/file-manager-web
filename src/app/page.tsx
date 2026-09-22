// Home route: wires providers around the app shell.
import { Toaster } from "react-hot-toast";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { EditorGuardProvider } from "@/contexts/EditorGuardContext";
import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return (
    <WorkspaceProvider>
      <EditorGuardProvider>
        <AppShell />
        <Toaster position="bottom-center" />
      </EditorGuardProvider>
    </WorkspaceProvider>
  );
}
