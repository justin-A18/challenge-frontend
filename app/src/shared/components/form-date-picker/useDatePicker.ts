import { useMemo, useState } from "react";
import { formatDate, parseDate } from "./date-picker.helper";
import type { DatePickerOptions } from "./date-picker.types";

export function useDatePicker({
  value,
  onChange,
  onBlur,
  maximumDate,
  initialDate,
}: DatePickerOptions) {
  const [draft, setDraft] = useState<Date | null>(null);
  const dateLimit = maximumDate ?? new Date(9999, 11, 31);
  const [monthOffset, setMonthOffset] = useState(0);
  const shownMonth = useMemo(() => {
    if (!draft) return new Date();
    return new Date(draft.getFullYear(), draft.getMonth() + monthOffset, 1);
  }, [draft, monthOffset]);
  const firstWeekday = (shownMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(
    shownMonth.getFullYear(),
    shownMonth.getMonth() + 1,
    0,
  ).getDate();
  const calendarCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);
  const displayValue = value
    ? String(value).split("-").reverse().join("/")
    : "DD/MM/AAAA";
  function handleOpenPicker() {
    const startDate =
      typeof value === "string" && value
        ? parseDate(value)
        : (initialDate ?? new Date());
    setDraft(startDate > dateLimit ? dateLimit : startDate);
    setMonthOffset(0);
  }
  function handleCancel() {
    setDraft(null);
  }
  function handleChangeMonth(offset: number) {
    const nextMonth = new Date(
      shownMonth.getFullYear(),
      shownMonth.getMonth() + offset,
      1,
    );
    if (
      nextMonth <= new Date(dateLimit.getFullYear(), dateLimit.getMonth(), 1)
    ) {
      setMonthOffset((current) => current + offset);
    }
  }
  function handleSelectDay(day: number) {
    const selected = new Date(
      shownMonth.getFullYear(),
      shownMonth.getMonth(),
      day,
    );
    if (selected > dateLimit) return;
    setDraft(selected);
    setMonthOffset(0);
  }
  function confirm(date: Date) {
    onChange(formatDate(date));
    onBlur();
    handleCancel();
  }
  function handleAcceptDraft() {
    if (draft && draft <= dateLimit) confirm(draft);
  }
  return {
    draft,
    dateLimit,
    shownMonth,
    calendarCells,
    displayValue,
    handleOpenPicker,
    handleCancel,
    handleChangeMonth,
    handleSelectDay,
    handleAcceptDraft,
  };
}
