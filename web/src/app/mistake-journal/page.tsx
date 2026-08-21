import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import AddMistakeButton from '@/components/AddMistakeButton';

type Mistake = {
  id: number;
  date: string;
  category: string;
  description: string;
  lesson?: string | null;
  problemId: number;
  problem?: { title: string } | null;
};

type ProblemOption = { id: number; title: string };

async function getMistakes(): Promise<Mistake[]> {
  const res = await fetch('http://127.0.0.1:3001/mistakes', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function getProblems(): Promise<ProblemOption[]> {
  const res = await fetch('http://127.0.0.1:3001/problems', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

const categoryColors: Record<string, string> = {
  MISREAD_CONSTRAINTS: '#c026d3',
  WRONG_PATTERN: 'var(--danger)',
  EDGE_CASE: 'var(--warning)',
  IMPLEMENTATION_BUG: 'var(--info)',
  TIME_MANAGEMENT: 'var(--primary)',
  UNKNOWN_CONCEPT: '#0891b2',
  OTHER: 'var(--text-muted)',
};

function humanize(category: string) {
  return category.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function MistakeJournalPage() {
  const [mistakes, problems] = await Promise.all([getMistakes(), getProblems()]);

  const categoryCounts: Record<string, number> = {};
  mistakes.forEach((m) => {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      name: humanize(category),
      pct: mistakes.length ? Math.round((count / mistakes.length) * 100) : 0,
      color: categoryColors[category] || 'var(--text-muted)',
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const recentCount = mistakes.filter((m) => new Date(m.date) >= thirtyDaysAgo).length;
  const priorCount = mistakes.filter((m) => new Date(m.date) >= sixtyDaysAgo && new Date(m.date) < thirtyDaysAgo).length;
  const periodChangePct = priorCount === 0 ? (recentCount > 0 ? 100 : 0) : Math.round(((recentCount - priorCount) / priorCount) * 100);

  return (
    <div style={{ padding: '0 0 2rem 0' }}>

      <header className="main-header" style={{ padding: '0 0 1.5rem 0' }}>
        <div>
          <h1>Mistake Journal</h1>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Track mistakes, learn from them, and don&apos;t repeat.</p>
        </div>
        <div>
          <AddMistakeButton problems={problems} />
        </div>
      </header>

      <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', marginBottom: '2rem' }}>

        {/* Filters Bar */}
        <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>

          <select style={{ padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', appearance: 'none' }}>
            <option>All Categories</option>
            {Object.keys(categoryCounts).map((category) => <option key={category}>{humanize(category)}</option>)}
          </select>

          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search mistakes..."
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)' }}
            />
          </div>

        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Problem</th>
                <th style={{ padding: '1rem 1.5rem' }}>Category</th>
                <th style={{ padding: '1rem 1.5rem' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', width: '30%' }}>Description</th>
                <th style={{ padding: '1rem 1.5rem', width: '30%' }}>Lesson / Fix</th>
              </tr>
            </thead>
            <tbody>
              {mistakes.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No mistakes logged yet.</td></tr>
              )}
              {mistakes.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                    <Link href={`/problems/${m.problemId}`} className="hover:underline text-sm">{m.problem?.title || 'Unknown problem'}</Link>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.875rem', color: categoryColors[m.category] || 'var(--text-main)' }}>{humanize(m.category)}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(m.date).toLocaleDateString('en-US')}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{m.description}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{m.lesson || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex justify-between items-center" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-base)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          <div className="text-sm text-muted">Showing {mistakes.length === 0 ? 0 : 1} to {mistakes.length} of {mistakes.length}</div>
          <div className="flex items-center gap-2">
            <button style={{ padding: '0.25rem' }}><ChevronLeft size={16} className="text-muted" /></button>
            <button style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '4px', fontSize: '0.875rem' }}>1</button>
            <button style={{ padding: '0.25rem' }}><ChevronRight size={16} className="text-muted" /></button>
          </div>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

        <div className="panel flex flex-col gap-4">
          <h2>Top Mistake Categories</h2>
          <div className="flex flex-col gap-4 text-sm mt-2">
            {topCategories.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '1rem 0' }}>No mistakes logged yet.</p>
            ) : (
              topCategories.map((m) => (
                <div key={m.name} className="flex items-center gap-4">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: m.color }} />
                  <span style={{ flex: 1, fontWeight: 500 }}>{m.name}</span>
                  <div style={{ width: '200px', height: '8px', background: 'var(--bg-panel-hover)', borderRadius: '4px' }}>
                    <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: '4px' }} />
                  </div>
                  <span className="text-muted" style={{ width: '40px', textAlign: 'right' }}>{m.pct}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel flex flex-col gap-6 justify-center">
          <div>
            <div className="text-sm font-medium text-muted mb-2">Total Mistakes</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{mistakes.length}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted mb-2">Last 30 Days</div>
            <div className="flex items-center gap-2" style={{ color: periodChangePct <= 0 ? 'var(--success)' : 'var(--warning)', fontWeight: 500 }}>
              <TrendingUp size={16} /> {recentCount} logged{priorCount > 0 ? ` · ${periodChangePct > 0 ? '+' : ''}${periodChangePct}% from prior period` : ''}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
