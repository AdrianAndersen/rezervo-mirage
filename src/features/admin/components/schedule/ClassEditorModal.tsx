import { Button, Center, Divider, Loader, Modal, Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconTrash } from "@tabler/icons-react";

import ClassForm from "@/features/admin/components/forms/ClassForm";
import ParticipantsTransfer from "@/features/admin/components/schedule/ParticipantsTransfer";
import { confirmDelete } from "@/features/admin/components/ui/confirmDelete";
import type { ClassCoreInput } from "@/features/admin/schemas";
import {
  activitiesQuery,
  classKeys,
  classQuery,
  createClassesFn,
  deleteClassFn,
  locationsQuery,
  updateClassFn,
  usersQuery,
} from "@/features/admin/server";
import { showErrorNotification, showSuccessNotification } from "@/shared/utils/notifications";

export default function ClassEditorModal({
  chainId,
  opened,
  classId,
  defaultStart,
  onClose,
}: {
  chainId: number;
  opened: boolean;
  classId: number | null;
  defaultStart: string;
  onClose: () => void;
}) {
  const isEdit = classId !== null;
  const { data: activities } = useQuery(activitiesQuery(chainId));
  const { data: locations } = useQuery(locationsQuery(chainId));
  const { data: users } = useQuery(usersQuery(chainId));
  const { data: cls, isLoading: clsLoading } = useQuery(classQuery(classId));
  const queryClient = useQueryClient();

  const invalidateClasses = () => queryClient.invalidateQueries({ queryKey: classKeys.all });

  const create = useMutation({
    mutationFn: (args: { payload: ClassCoreInput; weeks: number }) =>
      createClassesFn({ data: { ...args.payload, repeatWeeks: args.weeks } }),
    onSuccess: async (created) => {
      await invalidateClasses();
      onClose();
      showSuccessNotification(
        created.length > 1 ? `Opprettet ${created.length} timer` : "Time opprettet",
      );
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  const update = useMutation({
    mutationFn: (payload: ClassCoreInput) =>
      updateClassFn({ data: { id: classId as number, ...payload } }),
    onSuccess: async () => {
      await Promise.all([
        invalidateClasses(),
        queryClient.invalidateQueries({
          queryKey: classKeys.detail(classId as number),
        }),
      ]);
      onClose();
      showSuccessNotification("Time lagret");
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteClassFn({ data: { id: classId as number } }),
    onSuccess: async () => {
      await invalidateClasses();
      onClose();
      showSuccessNotification("Time slettet");
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  const ready = activities && locations && users && (!isEdit || cls);
  const employees = (users ?? []).filter((u) => u.isEmployee);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={"lg"}
      centered
      title={isEdit ? "Rediger time" : "Ny time"}
    >
      {!ready || (isEdit && clsLoading) ? (
        <Center py={"xl"}>
          <Loader />
        </Center>
      ) : (
        <Stack>
          <ClassForm
            key={classId ?? "new"}
            {...(isEdit && cls ? { cls } : {})}
            defaultStart={defaultStart}
            activities={activities}
            locations={locations}
            employees={employees}
            submitting={create.isPending || update.isPending}
            onSubmit={(payload, weeks) =>
              isEdit ? update.mutate(payload) : create.mutate({ payload, weeks })
            }
          />
          {isEdit && cls && (
            <>
              <Divider />
              <ParticipantsTransfer
                classId={cls.id}
                totalSlots={cls.totalSlots}
                registrations={cls.registrations}
                users={users}
              />
              <Divider />
              <Button
                variant={"light"}
                color={"red"}
                leftSection={<IconTrash size={16} />}
                loading={remove.isPending}
                onClick={() =>
                  confirmDelete({
                    title: "Slett time",
                    message: "Slett denne timen og alle påmeldinger?",
                    onConfirm: () => remove.mutate(),
                  })
                }
              >
                Slett time
              </Button>
            </>
          )}
        </Stack>
      )}
    </Modal>
  );
}
