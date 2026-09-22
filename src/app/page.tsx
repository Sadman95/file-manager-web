import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}
