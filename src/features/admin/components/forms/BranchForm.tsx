import { Button, Stack } from "@mantine/core";

import { branchCreateSchema } from "@/features/admin/schemas";
import { slugify } from "@/features/admin/slug";
import { useAppForm } from "@/shared/hooks/form";

export interface BranchFormValues {
  name: string;
  identifier: string;
}

export default function BranchForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial?: BranchFormValues;
  submitting: boolean;
  onSubmit: (values: BranchFormValues) => void;
}) {
  const form = useAppForm({
    defaultValues: initial ?? { name: "", identifier: "" },
    onSubmit: ({ value }) =>
      onSubmit({
        name: value.name.trim(),
        identifier: value.identifier.trim() || slugify(value.name),
      }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <Stack>
        <form.AppField name={"name"} validators={{ onBlur: branchCreateSchema.shape.name }}>
          {(field) => (
            <field.TextField label={"Navn"} placeholder={"Oslo"} required data-autofocus />
          )}
        </form.AppField>
        <form.AppField name={"identifier"}>
          {(field) => (
            <field.TextField
              label={"Identifikator"}
              placeholder={"oslo"}
              description={"Genereres fra navnet om tomt."}
            />
          )}
        </form.AppField>
        <Button type={"submit"} loading={submitting} mt={"xs"}>
          Lagre
        </Button>
      </Stack>
    </form>
  );
}
