import { FormDatePicker } from "@/shared/components/form-date-picker";
import type { Control } from "react-hook-form";
import type { ProfileFormValues } from "../schemas/profile.schema";

export function BirthDateField({
  control,
}: {
  control: Control<ProfileFormValues>;
}) {
  const today = new Date();
  const initialDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );
  return (
    <FormDatePicker
      control={control}
      name="birthDate"
      label="Fecha de nacimiento"
      maximumDate={today}
      initialDate={initialDate}
    />
  );
}
