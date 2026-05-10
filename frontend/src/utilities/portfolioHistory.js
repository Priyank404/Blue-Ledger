const DAY_MS = 24 * 60 * 60 * 1000;

export const HISTORY_RANGES = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const toDayString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const addStep = (date, range) => {
  const next = new Date(date);

  if (range === 'weekly') {
    next.setDate(next.getDate() + 7);
    return next;
  }

  if (range === 'monthly') {
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  if (range === 'yearly') {
    next.setFullYear(next.getFullYear() + 1);
    return next;
  }

  next.setDate(next.getDate() + 1);
  return next;
};

const subtractMonths = (date, months) => {
  const previous = new Date(date);
  previous.setMonth(previous.getMonth() - months);
  previous.setHours(0, 0, 0, 0);
  return previous;
};

const getRangeStart = (today, firstDate, range) => {
  if (range === 'daily') {
    const oneMonthAgo = subtractMonths(today, 1);
    return oneMonthAgo > firstDate ? oneMonthAgo : firstDate;
  }

  if (range === 'weekly') {
    const sixMonthsAgo = subtractMonths(today, 6);
    return sixMonthsAgo > firstDate ? sixMonthsAgo : firstDate;
  }

  return firstDate;
};

const alignStartDate = (date, range) => {
  const aligned = new Date(date);

  if (range === 'weekly') {
    const day = aligned.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    aligned.setDate(aligned.getDate() - daysFromMonday);
  }

  if (range === 'monthly') {
    aligned.setDate(1);
  }

  if (range === 'yearly') {
    aligned.setMonth(0, 1);
  }

  aligned.setHours(0, 0, 0, 0);
  return aligned;
};

const getSnapshotDate = (item) => normalizeDate(item.day || item.date);

export const buildPortfolioHistory = (history = [], range = 'daily') => {
  const snapshots = history
    .map((item) => {
      const date = getSnapshotDate(item);
      return date
        ? {
            date,
            value: Number(item.value) || 0,
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);

  if (snapshots.length === 0) return [];

  const today = normalizeDate(new Date());
  const firstDate = snapshots[0].date;
  const rangeStart = getRangeStart(today, firstDate, range);
  let cursor = alignStartDate(rangeStart, range);
  const points = [];
  let snapshotIndex = 0;
  let lastValue = snapshots[0].value;

  while (cursor <= today) {
    const periodEnd = addStep(cursor, range);
    const pointDate = periodEnd > today ? today : new Date(periodEnd.getTime() - DAY_MS);

    while (
      snapshotIndex < snapshots.length &&
      snapshots[snapshotIndex].date <= pointDate
    ) {
      lastValue = snapshots[snapshotIndex].value;
      snapshotIndex += 1;
    }

    if (pointDate >= rangeStart) {
      points.push({
        day: toDayString(pointDate),
        value: lastValue,
      });
    }

    cursor = periodEnd;
  }

  const lastPoint = points[points.length - 1];
  const todayString = toDayString(today);
  if (lastPoint?.day !== todayString) {
    points.push({
      day: todayString,
      value: snapshots[snapshots.length - 1].value,
    });
  }

  return points;
};

export const formatHistoryLabel = (value, range) => {
  const date = new Date(value);

  if (range === 'yearly') {
    return date.toLocaleDateString('en-IN', { year: 'numeric' });
  }

  if (range === 'monthly') {
    return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
  }

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
};
