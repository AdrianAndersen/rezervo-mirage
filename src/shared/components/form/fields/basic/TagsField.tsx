import { TagsInput, type TagsInputProps } from "@mantine/core";

import { useFieldContext } from "@/shared/hooks/form";
import { fieldErrorText } from "@/shared/components/form/fieldError";

export default function TagsField(props: TagsInputProps) {
  const field = useFieldContext<string[]>();

  return (
    <TagsInput
      {...props}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      error={fieldErrorText(field.state.meta.errors)}
    />
  );
}
