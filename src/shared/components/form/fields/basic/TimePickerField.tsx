import { TimePicker, type TimePickerProps } from "@mantine/dates";

import { useFieldContext } from "@/shared/hooks/form";
import { fieldErrorText } from "@/shared/components/form/fieldError";

export default function TimePickerField(props: TimePickerProps) {
  const field = useFieldContext<string>();
  return (
    <TimePicker
      {...props}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      error={fieldErrorText(field.state.meta.errors)}
    />
  );
}
