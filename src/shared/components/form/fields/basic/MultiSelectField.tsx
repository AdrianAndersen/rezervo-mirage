import { MultiSelect, type MultiSelectProps } from "@mantine/core";

import { useFieldContext } from "@/shared/hooks/form";
import { fieldErrorText } from "@/shared/components/form/fieldError";

export default function MultiSelectField(props: MultiSelectProps) {
  const field = useFieldContext<string[]>();

  return (
    <MultiSelect
      {...props}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      error={fieldErrorText(field.state.meta.errors)}
    />
  );
}
