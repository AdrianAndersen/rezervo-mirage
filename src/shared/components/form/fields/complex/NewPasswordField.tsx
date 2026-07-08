import { PasswordInput, type PasswordInputProps } from "@mantine/core";

import { useFieldContext } from "@/shared/hooks/form";

export function newPasswordFieldValidator(value: string) {
  if (!value) return "Du må fylle inn et passord";
  if (value.length < 10) return "Passordet må ha minst 10 tegn";

  return null;
}

export default function NewPasswordField(props: PasswordInputProps) {
  const field = useFieldContext<string>();
  return (
    <PasswordInput
      required
      label={"Passord"}
      type={"password"}
      autoComplete={"new-password"}
      placeholder={"correct horse battery staple"}
      {...props}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={field.state.meta.errors.join(", ")}
    />
  );
}
