import { FormDatePicker } from "@/shared/components/form-date-picker";
import type { Control } from "react-hook-form";
import type { ProfileFormValues } from "../schemas/profile.schema";

export function BirthDateField({
  control,
}: {
  control: Control<ProfileFormValues>;
}) {
  const today = new Date();
  const cutoffYear = today.getFullYear() - 18;
  const lastDayOfMonth = new Date(
    cutoffYear,
    today.getMonth() + 1,
    0,
  ).getDate();
  const maximumDate = new Date(
    cutoffYear,
    today.getMonth(),
    Math.min(today.getDate(), lastDayOfMonth),
  );
  return (
    <FormDatePicker
      control={control}
      name="birthDate"
      label="Fecha de nacimiento"
      maximumDate={maximumDate}
    />
  );
}
