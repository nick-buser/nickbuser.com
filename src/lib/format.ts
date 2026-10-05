export function formatDate(date: Date, month: "short" | "long" = "short"): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month,
    day: "numeric",
    timeZone: "UTC",
  });
}
