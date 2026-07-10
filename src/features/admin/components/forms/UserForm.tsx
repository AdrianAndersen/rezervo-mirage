import { Button, Stack } from "@mantine/core";

import { userCreateSchema } from "@/features/admin/schemas";
import { useAppForm } from "@/shared/hooks/form";

export interface UserFormValues {
  name: string;
  username: string;
  password: string;
  isEmployee: boolean;
}

export default function UserForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial?: UserFormValues;
  submitting: boolean;
  onSubmit: (values: UserFormValues) => void;
}) {
  const form = useAppForm({
    defaultValues: initial ?? {
      name: "",
      username: "",
      password: "passord123",
      isEmployee: false,
    },
    onSubmit: ({ value }) =>
      onSubmit({
        name: value.name.trim(),
        username: value.username.trim(),
        password: value.password,
        isEmployee: value.isEmployee,
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
        <form.AppField name={"name"} validators={{ onBlur: userCreateSchema.shape.name }}>
          {(field) => (
            <field.TextField label={"Navn"} placeholder={"Kari Nordmann"} required data-autofocus />
          )}
        </form.AppField>
        <form.AppField name={"username"} validators={{ onBlur: userCreateSchema.shape.username }}>
          {(field) => (
            <field.TextField
              label={"Brukernavn"}
              placeholder={"kari"}
              required
              description={"Brukes til innlogging mot rezervo."}
            />
          )}
        </form.AppField>
        <form.AppField name={"password"} validators={{ onBlur: userCreateSchema.shape.password }}>
          {(field) => <field.TextField label={"Passord"} placeholder={"passord123"} required />}
        </form.AppField>
        <form.AppField name={"isEmployee"}>
          {(field) => (
            <field.SwitchField
              label={"Ansatt"}
              description={"Ansatte kan settes som instruktører og delta på timer."}
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
