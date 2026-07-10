import { Container, Modal, Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import LocationForm, {
  type LocationFormValues,
} from "@/features/admin/components/forms/LocationForm";
import CrudTable, { SlugCell, type Column } from "@/features/admin/components/ui/CrudTable";
import PageHeader from "@/features/admin/components/ui/PageHeader";
import { confirmDelete } from "@/features/admin/components/ui/confirmDelete";
import { useEditorModal } from "@/features/admin/hooks/useEditorModal";
import {
  type Location,
  branchesQuery,
  createLocationFn,
  deleteLocationFn,
  locationKeys,
  locationsQuery,
  updateLocationFn,
} from "@/features/admin/server";
import { showErrorNotification, showSuccessNotification } from "@/shared/utils/notifications";

export const Route = createFileRoute("/chains/$chainId/lokasjoner")({
  component: LocationsPage,
});

const columns: Column<Location>[] = [
  { header: "Navn", render: (l) => l.name },
  { header: "Identifikator", render: (l) => <SlugCell>{l.identifier}</SlugCell> },
  {
    header: "Filial",
    render: (l) => (
      <Text size={"sm"} c={"dimmed"}>
        {l.branch?.name ?? "—"}
      </Text>
    ),
  },
];

function LocationsPage() {
  const chainId = Number(Route.useParams().chainId);
  const { data, isLoading } = useQuery(locationsQuery(chainId));
  const { data: branches } = useQuery(branchesQuery(chainId));
  const editor = useEditorModal<Location>();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: locationKeys.all(chainId) });

  const save = useMutation({
    mutationFn: (values: LocationFormValues) => {
      const payload = {
        branchId: Number(values.branchId),
        identifier: values.identifier,
        name: values.name,
      };
      return editor.item
        ? updateLocationFn({ data: { id: editor.item.id, ...payload } })
        : createLocationFn({ data: payload });
    },
    onSuccess: async (location) => {
      await invalidate();
      editor.close();
      showSuccessNotification(`Lagret «${location.name}»`);
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteLocationFn({ data: { id } }),
    onSuccess: async () => {
      await invalidate();
      showSuccessNotification("Lokasjon slettet");
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  return (
    <Container size={"md"} px={0}>
      <PageHeader
        title={"Lokasjoner"}
        subtitle={"Stedene der timer holdes."}
        actionLabel={"Ny lokasjon"}
        onAction={editor.openCreate}
      />
      <CrudTable
        columns={columns}
        rows={data}
        isLoading={isLoading}
        emptyText={
          branches && branches.length === 0
            ? "Opprett en filial først, så kan du legge til lokasjoner."
            : "Ingen lokasjoner ennå."
        }
        onEdit={editor.openEdit}
        onDelete={(l) =>
          confirmDelete({
            title: "Slett lokasjon",
            message: `Slett «${l.name}» og alle timer på den?`,
            onConfirm: () => remove.mutate(l.id),
          })
        }
      />
      <Modal
        opened={editor.opened}
        onClose={editor.close}
        title={editor.item ? "Rediger lokasjon" : "Ny lokasjon"}
        centered
      >
        <LocationForm
          branches={branches ?? []}
          {...(editor.item
            ? {
                initial: {
                  name: editor.item.name,
                  identifier: editor.item.identifier,
                  branchId: String(editor.item.branchId),
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
