import { Box, Container, Group, Modal, Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import ActivityForm, {
  type ActivityFormValues,
} from "@/features/admin/components/forms/ActivityForm";
import CrudTable, { type Column } from "@/features/admin/components/ui/CrudTable";
import PageHeader from "@/features/admin/components/ui/PageHeader";
import { confirmDelete } from "@/features/admin/components/ui/confirmDelete";
import { useEditorModal } from "@/features/admin/hooks/useEditorModal";
import {
  type Activity,
  activitiesQuery,
  activityKeys,
  createActivityFn,
  deleteActivityFn,
  updateActivityFn,
} from "@/features/admin/server";
import { showErrorNotification, showSuccessNotification } from "@/shared/utils/notifications";

export const Route = createFileRoute("/chains/$chainId/aktiviteter")({
  component: ActivitiesPage,
});

const columns: Column<Activity>[] = [
  {
    header: "Aktivitet",
    render: (a) => (
      <Group gap={"sm"} wrap={"nowrap"}>
        <Box w={14} h={14} style={{ borderRadius: 4, background: a.color, flexShrink: 0 }} />
        <Text fw={500} size={"sm"}>
          {a.name}
        </Text>
      </Group>
    ),
  },
  {
    header: "Beskrivelse",
    render: (a) => (
      <Text size={"sm"} c={"dimmed"} lineClamp={1} maw={280}>
        {a.description || "—"}
      </Text>
    ),
  },
];

function ActivitiesPage() {
  const chainId = Number(Route.useParams().chainId);
  const { data, isLoading } = useQuery(activitiesQuery(chainId));
  const editor = useEditorModal<Activity>();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: activityKeys.all(chainId) });

  const save = useMutation({
    mutationFn: (values: ActivityFormValues) => {
      const payload = {
        name: values.name,
        color: values.color,
        description: values.description || null,
        additionalInformation: values.additionalInformation || null,
        image: values.image || null,
      };
      return editor.item
        ? updateActivityFn({ data: { id: editor.item.id, ...payload } })
        : createActivityFn({ data: { chainId, ...payload } });
    },
    onSuccess: async (activity) => {
      await invalidate();
      editor.close();
      showSuccessNotification(`Lagret «${activity.name}»`);
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteActivityFn({ data: { id } }),
    onSuccess: async () => {
      await invalidate();
      showSuccessNotification("Aktivitet slettet");
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  return (
    <Container size={"md"} px={0}>
      <PageHeader
        title={"Aktiviteter"}
        subtitle={"Timetypene som kan planlegges."}
        actionLabel={"Ny aktivitet"}
        onAction={editor.openCreate}
      />
      <CrudTable
        columns={columns}
        rows={data}
        isLoading={isLoading}
        emptyText={"Ingen aktiviteter ennå. Opprett den første."}
        onEdit={editor.openEdit}
        onDelete={(a) =>
          confirmDelete({
            title: "Slett aktivitet",
            message: `Slett «${a.name}»? Timer som bruker den vil også slettes.`,
            onConfirm: () => remove.mutate(a.id),
          })
        }
      />
      <Modal
        opened={editor.opened}
        onClose={editor.close}
        title={editor.item ? "Rediger aktivitet" : "Ny aktivitet"}
        centered
      >
        <ActivityForm
          {...(editor.item
            ? {
                initial: {
                  name: editor.item.name,
                  color: editor.item.color,
                  description: editor.item.description ?? "",
                  additionalInformation: editor.item.additionalInformation ?? "",
                  image: editor.item.image ?? "",
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
