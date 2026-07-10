import { Switch, type SwitchProps } from "@mantine/core";

import { useFieldContext } from "@/shared/hooks/form";
import { fieldErrorText } from "@/shared/components/form/fieldError";

export default function SwitchField(props: SwitchProps) {
  const field = useFieldContext<boolean>();

  return (
    <Switch
      {...props}
      checked={field.state.value}
      onChange={(event) => field.handleChange(event.currentTarget.checked)}
      onBlur={field.handleBlur}
      error={fieldErrorText(field.state.meta.errors)}
    />
  );
}
