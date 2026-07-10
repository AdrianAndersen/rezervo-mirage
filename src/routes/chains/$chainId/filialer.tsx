import { Badge, Container, Modal } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import BranchForm, { type BranchFormValues } from "@/features/admin/components/forms/BranchForm";
import CrudTable, { SlugCell, type Column } from "@/features/admin/components/ui/CrudTable";
import PageHeader from "@/features/admin/components/ui/PageHeader";
import { confirmDelete } from "@/features/admin/components/ui/confirmDelete";
import { useEditorModal } from "@/features/admin/hooks/useEditorModal";
import {
  type Branch,
  branchKeys,
  branchesQuery,
  createBranchFn,
  deleteBranchFn,
  updateBranchFn,
} from "@/features/admin/server";
import { showErrorNotification, showSuccessNotification } from "@/shared/utils/notifications";

export const Route = createFileRoute("/chains/$chainId/filialer")({
  component: BranchesPage,
});

const columns: Column<Branch>[] = [
  { header: "Navn", render: (b) => b.name },
  { header: "Identifikator", render: (b) => <SlugCell>{b.identifier}</SlugCell> },
  {
    header: "Lokasjoner",
    render: (b) => (
      <Badge variant={"light"} color={"gray"}>
        {b._count?.locations ?? 0}
      </Badge>
    ),
  },
];

function BranchesPage() {
  const chainId = Number(Route.useParams().chainId);
  const { data, isLoading } = useQuery(branchesQuery(chainId));
  const editor = useEditorModal<Branch>();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: branchKeys.all(chainId) });

  const save = useMutation({
    mutationFn: (values: BranchFormValues) =>
      editor.item
        ? updateBranchFn({ data: { id: editor.item.id, ...values } })
        : createBranchFn({ data: { chainId, ...values } }),
    onSuccess: async (branch) => {
      await invalidate();
      editor.close();
      showSuccessNotification(`Lagret «${branch.name}»`);
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteBranchFn({ data: { id } }),
    onSuccess: async () => {
      await invalidate();
      showSuccessNotification("Filial slettet");
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  return (
    <Container size={"md"} px={0}>
      <PageHeader
        title={"Filialer"}
        subtitle={"Grupper lokasjoner under en filial."}
        actionLabel={"Ny filial"}
        onAction={editor.openCreate}
      />
      <CrudTable
        columns={columns}
        rows={data}
        isLoading={isLoading}
        emptyText={"Ingen filialer ennå. Opprett den første."}
        onEdit={editor.openEdit}
        onDelete={(b) =>
          confirmDelete({
            title: "Slett filial",
            message: `Slett «${b.name}» og alle lokasjoner under den?`,
            onConfirm: () => remove.mutate(b.id),
          })
        }
      />
      <Modal
        opened={editor.opened}
        onClose={editor.close}
        title={editor.item ? "Rediger filial" : "Ny filial"}
        centered
      >
        <BranchForm
          {...(editor.item
            ? {
                initial: {
                  name: editor.item.name,
                  identifier: editor.item.identifier,
                },
              }
            : {})}
          submitting={save.isPending}
          onSubmit={(values) => save.mutate(values)}
        />
      </Modal>
    </Container>
  );
}
