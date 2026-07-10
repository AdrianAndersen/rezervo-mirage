import { Badge, Container, Modal, Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import UserForm, { type UserFormValues } from "@/features/admin/components/forms/UserForm";
import CrudTable, { SlugCell, type Column } from "@/features/admin/components/ui/CrudTable";
import PageHeader from "@/features/admin/components/ui/PageHeader";
import { confirmDelete } from "@/features/admin/components/ui/confirmDelete";
import { useEditorModal } from "@/features/admin/hooks/useEditorModal";
import {
  type User,
  createUserFn,
  deleteUserFn,
  updateUserFn,
  userKeys,
  usersQuery,
} from "@/features/admin/server";
import { showErrorNotification, showSuccessNotification } from "@/shared/utils/notifications";

export const Route = createFileRoute("/chains/$chainId/brukere")({
  component: UsersPage,
});

const columns: Column<User>[] = [
  {
    header: "Navn",
    render: (u) => (
      <Text fw={500} size={"sm"}>
        {u.name}
      </Text>
    ),
  },
  { header: "Brukernavn", render: (u) => <SlugCell>{u.username}</SlugCell> },
  {
    header: "Rolle",
    render: (u) =>
      u.isEmployee ? (
        <Badge variant={"light"} color={"rezervo"}>
          Ansatt
        </Badge>
      ) : (
        <Badge variant={"light"} color={"gray"}>
          Medlem
        </Badge>
      ),
  },
];

function UsersPage() {
  const chainId = Number(Route.useParams().chainId);
  const { data, isLoading } = useQuery(usersQuery(chainId));
  const editor = useEditorModal<User>();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: userKeys.all(chainId) });

  const save = useMutation({
    mutationFn: (values: UserFormValues) =>
      editor.item
        ? updateUserFn({ data: { id: editor.item.id, ...values } })
        : createUserFn({ data: { chainId, ...values } }),
    onSuccess: async (user) => {
      await invalidate();
      editor.close();
      showSuccessNotification(`Lagret «${user.name}»`);
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteUserFn({ data: { id } }),
    onSuccess: async () => {
      await invalidate();
      showSuccessNotification("Bruker slettet");
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  return (
    <Container size={"md"} px={0}>
      <PageHeader
        title={"Brukere"}
        subtitle={"Medlemmer og ansatte. Ansatte kan også delta på timer."}
        actionLabel={"Ny bruker"}
        onAction={editor.openCreate}
      />
      <CrudTable
        columns={columns}
        rows={data}
        isLoading={isLoading}
        emptyText={"Ingen brukere ennå. Opprett den første."}
        onEdit={editor.openEdit}
        onDelete={(u) =>
          confirmDelete({
            title: "Slett bruker",
            message: `Slett «${u.name}» og alle påmeldinger?`,
            onConfirm: () => remove.mutate(u.id),
          })
        }
      />
      <Modal
        opened={editor.opened}
        onClose={editor.close}
        title={editor.item ? "Rediger bruker" : "Ny bruker"}
        centered
      >
        <UserForm
          {...(editor.item
            ? {
                initial: {
                  name: editor.item.name,
                  username: editor.item.username,
                  password: editor.item.password,
                  isEmployee: editor.item.isEmployee,
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
