import { useState } from "react";

/** Manage open/close state for a create/edit modal holding an optional item. */
export function useEditorModal<T>() {
  const [item, setItem] = useState<T | null>(null);
  const [opened, setOpened] = useState(false);

  return {
    opened,
    /** The item being edited, or `null` when creating. */
    item,
    openCreate: () => {
      setItem(null);
      setOpened(true);
    },
    openEdit: (value: T) => {
      setItem(value);
      setOpened(true);
    },
    close: () => setOpened(false),
  };
}
