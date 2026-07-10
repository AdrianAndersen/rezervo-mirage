import { Button, ColorInput, Stack } from "@mantine/core";

import { activityCreateSchema } from "@/features/admin/schemas";
import { fieldErrorText } from "@/shared/components/form/fieldError";
import { useAppForm } from "@/shared/hooks/form";

export interface ActivityFormValues {
  name: string;
  color: string;
  description: string;
  additionalInformation: string;
  image: string;
}

const SWATCHES = [
  "#4caf50",
  "#2196f3",
  "#f44336",
  "#ff9800",
  "#9c27b0",
  "#00bcd4",
  "#e91e63",
  "#795548",
  "#607d8b",
  "#ffc107",
];

const DEFAULTS: ActivityFormValues = {
  name: "",
  color: "#4caf50",
  description: "",
  additionalInformation: "",
  image: "",
};

export default function ActivityForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial?: ActivityFormValues;
  submitting: boolean;
  onSubmit: (values: ActivityFormValues) => void;
}) {
  const form = useAppForm({
    defaultValues: initial ?? DEFAULTS,
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <Stack>
        <form.AppField name={"name"} validators={{ onBlur: activityCreateSchema.shape.name }}>
          {(field) => (
            <field.TextField label={"Navn"} placeholder={"Yoga"} required data-autofocus />
          )}
        </form.AppField>
        <form.AppField name={"color"}>
          {(field) => (
            <ColorInput
              label={"Farge"}
              format={"hex"}
              swatches={SWATCHES}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={fieldErrorText(field.state.meta.errors)}
            />
          )}
        </form.AppField>
        <form.AppField name={"description"}>
          {(field) => (
            <field.TextAreaField
              label={"Beskrivelse"}
              placeholder={"Kort beskrivelse av aktiviteten"}
              autosize
              minRows={2}
            />
          )}
        </form.AppField>
        <form.AppField name={"additionalInformation"}>
          {(field) => (
            <field.TextAreaField
              label={"Tilleggsinformasjon"}
              placeholder={"Valgfri ekstra info"}
              autosize
              minRows={1}
            />
          )}
        </form.AppField>
        <form.AppField name={"image"}>
          {(field) => <field.TextField label={"Bildelenke"} placeholder={"https://…"} />}
        </form.AppField>
        <Button type={"submit"} loading={submitting} mt={"xs"}>
          Lagre
        </Button>
      </Stack>
    </form>
  );
}
