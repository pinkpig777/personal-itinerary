const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_DAY_PATTERN = /^(\d{1,2})\/(\d{1,2})$/;

const createNoonDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      12
    );
  }

  if (typeof value !== 'string') {
    return null;
  }

  if (ISO_DATE_PATTERN.test(value)) {
    return new Date(`${value}T12:00:00`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
    12
  );
};

export const formatDisplayDate = (
  value,
  options = { month: 'short', day: 'numeric', year: 'numeric' }
) => {
  const parsed = createNoonDate(value);

  if (!parsed) {
    return '';
  }

  return parsed.toLocaleDateString('en-US', options);
};

export const formatDisplayDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return '';
  }

  return `${formatDisplayDate(startDate, {
    month: 'short',
    day: 'numeric'
  })} - ${formatDisplayDate(endDate, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`;
};

export const formatDateKey = (value) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const monthDayMatch = trimmed.match(MONTH_DAY_PATTERN);

    if (monthDayMatch) {
      return `${Number(monthDayMatch[1])}/${Number(monthDayMatch[2])}`;
    }

    if (ISO_DATE_PATTERN.test(trimmed)) {
      const [, month, day] = trimmed.split('-').map(Number);
      return `${month}/${day}`;
    }
  }

  const parsed = createNoonDate(value);
  if (!parsed) {
    return '';
  }

  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
};

export const formatIsoDate = (value) => {
  const parsed = createNoonDate(value);

  if (!parsed) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const matchesDateKey = (left, right) => {
  return formatDateKey(left) === formatDateKey(right);
};

export const getItineraryDateOptions = (startDate, endDate) => {
  const start = createNoonDate(startDate);
  const end = createNoonDate(endDate);

  if (!start || !end || start > end) {
    return [];
  }

  const options = [];

  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    const currentDate = new Date(current);
    const key = formatIsoDate(currentDate);

    options.push({
      key,
      label: `${currentDate
        .toLocaleDateString('en-US', { weekday: 'short' })
        .toUpperCase()} ${formatDateKey(currentDate)}`
    });
  }

  return options;
};
