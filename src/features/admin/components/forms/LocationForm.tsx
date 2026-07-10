import { Button, Stack } from "@mantine/core";

import { locationCreateSchema } from "@/features/admin/schemas";
import type { Branch } from "@/features/admin/server";
import { slugify } from "@/features/admin/slug";
import { useAppForm } from "@/shared/hooks/form";

export interface LocationFormValues {
  name: string;
  identifier: string;
  branchId: string;
}

export default function LocationForm({
  initial,
  branches,
  submitting,
  onSubmit,
}: {
  initial?: LocationFormValues;
  branches: Branch[];
  submitting: boolean;
  onSubmit: (values: LocationFormValues) => void;
}) {
  const form = useAppForm({
    defaultValues: initial ?? {
      name: "",
      identifier: "",
      branchId: branches[0] ? String(branches[0].id) : "",
    },
    onSubmit: ({ value }) =>
      onSubmit({
        name: value.name.trim(),
        identifier: value.identifier.trim() || slugify(value.name),
        branchId: value.branchId,
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
        <form.AppField name={"branchId"}>
          {(field) => (
            <field.SelectField
              label={"Region"}
              required
              data={branches.map((b) => ({ value: String(b.id), label: b.name }))}
            />
          )}
        </form.AppField>
        <form.AppField name={"name"} validators={{ onBlur: locationCreateSchema.shape.name }}>
          {(field) => (
            <field.TextField label={"Navn"} placeholder={"Bislett"} required data-autofocus />
          )}
        </form.AppField>
        <form.AppField name={"identifier"}>
          {(field) => (
            <field.TextField
              label={"Identifikator"}
              placeholder={"bislett"}
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
