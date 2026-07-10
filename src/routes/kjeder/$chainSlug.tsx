import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { requireAdmin } from "@/features/admin/auth/guard";
import AdminShell from "@/features/admin/components/shell/AdminShell";
import { chainBySlugQuery } from "@/features/admin/server";

export const Route = createFileRoute("/kjeder/$chainSlug")({
  beforeLoad: ({ location }) => requireAdmin(location),
  loader: async ({ context, params }) => {
    const chain = await context.queryClient.ensureQueryData(chainBySlugQuery(params.chainSlug));
    if (!chain) throw notFound();
    return { chain };
  },
  component: ChainLayout,
});

function ChainLayout() {
  const { chain } = Route.useLoaderData();
  return (
    <AdminShell chain={chain}>
      <Outlet />
    </AdminShell>
  );
}
