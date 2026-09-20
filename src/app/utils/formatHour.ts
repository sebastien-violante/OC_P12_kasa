export default function formatHour(date: string): string {
  const [hours, minutes] = date.split(" ")[1].split(":");

  const hour = Number(hours);
  const period = hour >= 12 ? "pm" : "am";
  const formattedHour = hour % 12 || 12;

  return `${String(formattedHour).padStart(2, "0")}:${minutes} ${period}`;
}