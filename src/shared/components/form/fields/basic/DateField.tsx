import { type CalendarLevel, DateInput, type DateInputProps } from "@mantine/dates";
import { useState } from "react";

import { useFieldContext } from "@/shared/hooks/form";
import { fieldErrorText } from "@/shared/components/form/fieldError";

export default function DateField(props: DateInputProps) {
  const field = useFieldContext<string | null>();

  const defaultLevel = props.defaultLevel ?? "month";
  const [level, setLevel] = useState<CalendarLevel>(defaultLevel);
  const [date, setDate] = useState(props.defaultDate ?? new Date());

  return (
    <DateInput
      {...props}
      valueFormat={"DD/MM/YYYY"}
      placeholder={"DD/MM/YYYY"}
      level={level}
      onLevelChange={setLevel}
      date={date}
      onDateChange={(value) => {
        if (value) setDate(new Date(value));
      }}
      value={field.state.value}
      onChange={(value) => {
        setLevel(value ? "month" : defaultLevel);
        field.handleChange(value);
      }}
      onBlur={field.handleBlur}
      error={fieldErrorText(field.state.meta.errors)}
    />
  );
}
