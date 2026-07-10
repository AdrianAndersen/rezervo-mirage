import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireAdmin } from "@/features/admin/auth/guard";
import AdminShell from "@/features/admin/components/shell/AdminShell";

export const Route = createFileRoute("/chains/$chainId")({
  beforeLoad: ({ location }) => requireAdmin(location),
  component: ChainLayout,
});

function ChainLayout() {
  const { chainId } = Route.useParams();
  return (
    <AdminShell chainId={Number(chainId)}>
      <Outlet />
    </AdminShell>
  );
}
