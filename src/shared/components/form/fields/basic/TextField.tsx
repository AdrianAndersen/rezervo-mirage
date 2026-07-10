import { TextInput, type TextInputProps } from "@mantine/core";

import { useFieldContext } from "@/shared/hooks/form";
import { fieldErrorText } from "@/shared/components/form/fieldError";

export default function TextField(props: TextInputProps) {
  const field = useFieldContext<string>();

  return (
    <TextInput
      {...props}
      value={field.state.value}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      error={fieldErrorText(field.state.meta.errors)}
    />
  );
}
