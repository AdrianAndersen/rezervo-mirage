import { Button, Stack } from "@mantine/core";

import { chainCreateSchema } from "@/features/admin/schemas";
import { slugify } from "@/features/admin/slug";
import { useAppForm } from "@/shared/hooks/form";

export interface ChainFormValues {
  name: string;
  identifier: string;
}

export default function ChainForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial?: ChainFormValues;
  submitting: boolean;
  onSubmit: (values: ChainFormValues) => void;
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
        <form.AppField name={"name"} validators={{ onBlur: chainCreateSchema.shape.name }}>
          {(field) => (
            <field.TextField label={"Navn"} placeholder={"Mirage Fit"} required data-autofocus />
          )}
        </form.AppField>
        <form.AppField name={"identifier"}>
          {(field) => (
            <field.TextField
              label={"Identifikator"}
              placeholder={"mirage-fit"}
              description={"Brukes av rezervo. Genereres fra navnet om tomt."}
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
