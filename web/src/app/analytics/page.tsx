type ProgressRow = {
  topic?: string;
  pattern?: string;
  total: number;
  solved: number;
  mastery: number;
  avgAttempts: string;
};

type Analytics = {
  kpi: {
    solvedProblems: number;
    masteryPercent: number;
    revisionsCompleted: number;
    avgAttempts: string;
  };
  topicProgress: ProgressRow[];
  patternProgress: ProgressRow[];
};

async function getAnalytics(): Promise<Analytics | null> {
  const res = await fetch('http://127.0.0.1:3001/analytics', {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json() as Promise<Analytics>;
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  if (!analytics) {
    return <div className="p-8">Loading analytics...</div>;
  }

  const { kpi, topicProgress, patternProgress } = analytics;

  return (
    <div style={{ padding: '0 0 2rem 0' }}>
      
      <header className="main-header" style={{ padding: '0 0 1.5rem 0' }}>
        <div>
          <h1>Analytics</h1>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Your progress at a glance.</p>
        </div>
        <div className="flex gap-2 bg-white rounded-md p-1 border border-slate-200">
          <button className="text-sm px-4 py-1 text-slate-500 rounded-sm">7 Days</button>
          <button className="text-sm px-4 py-1 text-slate-500 rounded-sm">30 Days</button>
          <button className="text-sm px-4 py-1 text-slate-500 rounded-sm">3 Months</button>
          <button className="text-sm px-4 py-1 bg-slate-100 text-slate-900 font-medium rounded-sm">All Time</button>
        </div>
      </header>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="panel" style={{ borderBottom: '4px solid var(--success)' }}>
          <div className="text-sm text-muted font-medium mb-2">Problems Solved</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.solvedProblems}</div>
          <div className="text-xs text-muted mt-1">Total</div>
        </div>

        <div className="panel" style={{ borderBottom: '4px solid var(--warning)' }}>
          <div className="text-sm text-muted font-medium mb-2">Mastery % (All)</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.masteryPercent}%</div>
          <div className="text-xs text-muted mt-1">Across all topics</div>
        </div>

        <div className="panel" style={{ borderBottom: '4px solid var(--primary)' }}>
          <div className="text-sm text-muted font-medium mb-2">Revisions Completed</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.revisionsCompleted}</div>
          <div className="text-xs text-muted mt-1">Total</div>
        </div>

        <div className="panel" style={{ borderBottom: '4px solid var(--info)' }}>
          <div className="text-sm text-muted font-medium mb-2">Avg. Attempts Before Mastery</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.avgAttempts}</div>
          <div className="text-xs text-muted mt-1">Across all problems</div>
        </div>

      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        <div className="panel">
          <h2 style={{ marginBottom: '1.5rem' }}>Topic-wise Progress</h2>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr className="text-muted" style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Topic</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Total</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Solved</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Mastery %</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500, textAlign: 'right' }}>Avg Attempts</th>
              </tr>
            </thead>
            <tbody>
              {topicProgress.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '1rem 0', color: 'var(--text-muted)', textAlign: 'center' }}>No data yet</td></tr>
              )}
              {topicProgress.map((r) => (
                <tr key={r.topic} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem 0' }}>{r.topic}</td>
                  <td style={{ padding: '0.75rem 0' }}>{r.total}</td>
                  <td style={{ padding: '0.75rem 0' }}>{r.solved}</td>
                  <td style={{ padding: '0.75rem 0', width: '120px' }}>
                    <div className="flex items-center gap-2">
                      <div style={{ flex: 1, height: '6px', background: 'var(--bg-panel-hover)', borderRadius: '3px' }}>
                        <div style={{ width: `${r.mastery}%`, height: '100%', background: r.mastery > 70 ? 'var(--success)' : 'var(--warning)', borderRadius: '3px' }} />
                      </div>
                      <span className="text-xs text-muted">{r.mastery}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>{r.avgAttempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2 style={{ marginBottom: '1.5rem' }}>Pattern-wise Progress</h2>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr className="text-muted" style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Pattern</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Total</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Solved</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500 }}>Mastery %</th>
                <th style={{ paddingBottom: '0.75rem', fontWeight: 500, textAlign: 'right' }}>Avg Attempts</th>
              </tr>
            </thead>
            <tbody>
              {patternProgress.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '1rem 0', color: 'var(--text-muted)', textAlign: 'center' }}>No data yet</td></tr>
              )}
              {patternProgress.map((r) => (
                <tr key={r.pattern} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem 0' }}>{r.pattern}</td>
                  <td style={{ padding: '0.75rem 0' }}>{r.total}</td>
                  <td style={{ padding: '0.75rem 0' }}>{r.solved}</td>
                  <td style={{ padding: '0.75rem 0', width: '120px' }}>
                    <div className="flex items-center gap-2">
                      <div style={{ flex: 1, height: '6px', background: 'var(--bg-panel-hover)', borderRadius: '3px' }}>
                        <div style={{ width: `${r.mastery}%`, height: '100%', background: r.mastery > 70 ? 'var(--success)' : 'var(--warning)', borderRadius: '3px' }} />
                      </div>
                      <span className="text-xs text-muted">{r.mastery}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>{r.avgAttempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
