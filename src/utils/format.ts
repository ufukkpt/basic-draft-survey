export const mt = (value?: number) => (value === undefined || Number.isNaN(value) ? "--" : `${value.toLocaleString()} MT`);

export const rate = (value?: number) =>
  value === undefined || Number.isNaN(value) ? "--" : `${value.toLocaleString()} MT/h`;

export const pct = (value?: number) => (value === undefined || Number.isNaN(value) ? "--" : `${value.toFixed(1)}%`);

export const dateTime = (iso?: string) => {
  if (!iso) {
    return "--";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
};

export const decimal = (value: string) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};
