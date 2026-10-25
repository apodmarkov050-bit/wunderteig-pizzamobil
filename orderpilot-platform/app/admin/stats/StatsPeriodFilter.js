'use client';

export default function StatsPeriodFilter({ value }) {
  const periods = [
    { value: 'today', label: 'Heute' },
    { value: '7days', label: 'Letzte 7 Tage' },
    { value: '30days', label: 'Letzte 30 Tage' },
    { value: 'all', label: 'Gesamter Zeitraum' },
  ];

  return (
    <nav className="statsFilters" aria-label="Statistikzeitraum">
      {periods.map((period) => (
        <a
          key={period.value}
          href={`/admin/stats?period=${period.value}`}
          className={`statsFilter${value === period.value ? ' isActive' : ''}`}
          aria-current={value === period.value ? 'page' : undefined}
        >
          {period.label}
        </a>
      ))}
    </nav>
  );
}
