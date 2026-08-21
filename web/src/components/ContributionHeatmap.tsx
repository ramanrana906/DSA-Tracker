type DayCount = { date: string; count: number };

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function levelFor(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

export default function ContributionHeatmap({ days }: { days: DayCount[] }) {
  if (days.length === 0) return null;

  // Pad the front so the grid starts on a Sunday, matching GitHub's layout.
  const firstDay = new Date(days[0].date + 'T00:00:00Z').getUTCDay();
  const padded: (DayCount | null)[] = [...Array(firstDay).fill(null), ...days];
  const weeks: (DayCount | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const monthMarkers: { index: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, index) => {
    const firstReal = week.find((d) => d);
    if (!firstReal) return;
    const month = new Date(firstReal.date + 'T00:00:00Z').getUTCMonth();
    if (month !== lastMonth) {
      monthMarkers.push({ index, label: MONTH_LABELS[month] });
      lastMonth = month;
    }
  });

  const totalActive = days.filter((d) => d.count > 0).length;
  const best = days.reduce((max, d) => (d.count > max.count ? d : max), days[0]);

  return (
    <div className="panel" style={{ padding: '1.5rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem' }}>Activity</h2>
          <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
            {totalActive} active day{totalActive === 1 ? '' : 's'} in the last year
            {best.count > 0 ? ` · busiest day ${best.count} session${best.count === 1 ? '' : 's'}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <span>Less</span>
          {[0, 1, 2, 3].map((level) => (
            <span key={level} className="heatmap-cell" data-level={level} style={{ width: '11px', height: '11px' }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.3rem', minWidth: 'max-content' }}>
          <div style={{ display: 'flex', gap: '3px', paddingLeft: '2px' }}>
            {weeks.map((_, index) => {
              const marker = monthMarkers.find((m) => m.index === index);
              return (
                <div key={index} className="text-xs text-muted" style={{ width: '11px', fontSize: '0.62rem' }}>
                  {marker ? marker.label : ''}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {weeks.map((week, wIndex) => (
              <div key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map((day, dIndex) =>
                  day ? (
                    <span
                      key={dIndex}
                      className="heatmap-cell"
                      data-level={levelFor(day.count)}
                      title={`${day.count} session${day.count === 1 ? '' : 's'} · ${new Date(day.date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    />
                  ) : (
                    <span key={dIndex} style={{ width: '11px', height: '11px' }} />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
