import { modals } from "@mantine/modals";

/** Open a standard Norwegian confirm dialog for a destructive delete. */
export function confirmDelete(options: { title: string; message: string; onConfirm: () => void }) {
  modals.openConfirmModal({
    title: options.title,
    centered: true,
    children: options.message,
    labels: { confirm: "Slett", cancel: "Avbryt" },
    confirmProps: { color: "red", "data-testid": "confirm-delete" },
    onConfirm: options.onConfirm,
  });
}
