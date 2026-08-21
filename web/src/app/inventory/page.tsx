import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, ArrowRight, CheckCircle, AlertTriangle, X } from 'lucide-react';
import AddProblemButton from '@/components/AddProblemButton';

type InventoryProblem = {
  id: number;
  title: string;
  topic: string;
  pattern?: string | null;
  difficulty: string;
  sourceList?: string | null;
  status: string;
  stage: number;
  nextRevisionDate?: string | null;
  isLeech?: boolean;
  forgotCount?: number;
  tags?: { id: number; name: string }[];
};

type Filters = {
  search?: string;
  topic?: string;
  pattern?: string;
  difficulty?: string;
  status?: string;
  sourceList?: string;
  tag?: string;
};

async function getProblems(filters: Filters): Promise<InventoryProblem[]> {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); });
  const res = await fetch(`http://127.0.0.1:3001/problems?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json() as Promise<InventoryProblem[]>;
}

async function getTags(): Promise<{ id: number; name: string }[]> {
  const res = await fetch('http://127.0.0.1:3001/problems/tags', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

function reviewTiming(value?: string | null) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  const today = new Date();
  const start = (entry: Date) => new Date(entry.getFullYear(), entry.getMonth(), entry.getDate()).getTime();
  const days = Math.round((start(date) - start(today)) / (24 * 60 * 60 * 1000));
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Due Today';
  if (days === 1) return 'Due Tomorrow';
  return `Upcoming · ${date.toLocaleDateString('en-US')}`;
}

const selectStyle = { padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-main)', appearance: 'none' as const };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Filters> }) {
  const filters = await searchParams;
  const [problems, allProblems, tags] = await Promise.all([
    getProblems(filters),
    getProblems({}),
    getTags(),
  ]);

  const distinct = (values: (string | null | undefined)[]) => Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort();
  const topics = distinct(allProblems.map((p) => p.topic));
  const patterns = distinct(allProblems.map((p) => p.pattern));
  const difficulties = distinct(allProblems.map((p) => p.difficulty));
  const sources = distinct(allProblems.map((p) => p.sourceList));

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div style={{ padding: '0' }}>
      <header className="main-header" style={{ padding: '0 0 1.5rem 0', borderBottom: 'none' }}>
        <div>
          <h1>Problem Inventory</h1>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>View, filter and manage all your problems.</p>
        </div>
        <div>
          <AddProblemButton />
        </div>
      </header>

      <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: 'auto' }}>
        {/* Filters Bar */}
        <form action="/inventory" method="GET" style={{ display: 'flex', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              name="search"
              defaultValue={filters.search || ''}
              placeholder="Search problems..."
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-main)' }}
            />
          </div>

          <select name="topic" defaultValue={filters.topic || ''} style={selectStyle}>
            <option value="">All Topics</option>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="pattern" defaultValue={filters.pattern || ''} style={selectStyle}>
            <option value="">All Patterns</option>
            {patterns.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select name="difficulty" defaultValue={filters.difficulty || ''} style={selectStyle}>
            <option value="">All Difficulties</option>
            {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select name="status" defaultValue={filters.status || ''} style={selectStyle}>
            <option value="">All Status</option>
            <option value="UNSOLVED">Unsolved</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DUE">Due</option>
            <option value="MASTERED">Mastered</option>
          </select>
          <select name="sourceList" defaultValue={filters.sourceList || ''} style={selectStyle}>
            <option value="">All Sources</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="tag" defaultValue={filters.tag || ''} style={selectStyle}>
            <option value="">All Tags</option>
            {tags.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>

          <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>Apply</button>
          {hasActiveFilters && (
            <Link href="/inventory" className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <X size={14} /> Clear
            </Link>
          )}
        </form>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)' }}>
                <th style={{ padding: '1rem 1.5rem', width: '20px' }}>
                  <input type="checkbox" />
                </th>
                <th style={{ padding: '1rem 1.5rem' }}>Title</th>
                <th style={{ padding: '1rem 1.5rem' }}>Topic</th>
                <th style={{ padding: '1rem 1.5rem' }}>Pattern</th>
                <th style={{ padding: '1rem 1.5rem' }}>Tags</th>
                <th style={{ padding: '1rem 1.5rem' }}>Difficulty</th>
                <th style={{ padding: '1rem 1.5rem' }}>Source</th>
                <th style={{ padding: '1rem 1.5rem' }}>Lifecycle</th>
                <th style={{ padding: '1rem 1.5rem' }}>Review</th>
                <th style={{ padding: '1rem 1.5rem', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {problems.length === 0 && (
                <tr><td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{hasActiveFilters ? 'No problems match these filters.' : 'No problems added yet.'}</td></tr>
              )}
              {problems.map((p) => {
                const mastered = p.status === 'MASTERED' || p.stage >= 4;
                const timing = mastered ? 'Complete' : reviewTiming(p.nextRevisionDate);
                const due = timing === 'Due Today' || timing === 'Overdue';
                return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}><input type="checkbox" /></td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                    <Link href={`/problems/${p.id}`} className="flex items-center gap-2 hover:underline">
                      {p.isLeech && <span title={`${p.forgotCount} failed recalls`}><AlertTriangle size={14} color="var(--warning)" /></span>}
                      {p.title}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{p.topic}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{p.pattern}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.map((tag) => <span key={tag.id} className="tag-chip">{tag.name}</span>)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge ${p.difficulty === 'Easy' ? 'success' : p.difficulty === 'Medium' ? 'warning' : 'danger'}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{p.sourceList}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge ${mastered ? 'success' : p.status === 'UNSOLVED' ? '' : 'warning'}`}>
                      {mastered ? <><CheckCircle size={13} /> Mastered</> : p.status === 'UNSOLVED' ? 'First Solve' : `Revision ${p.stage + 1} / 4`}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ color: due ? 'var(--danger)' : mastered ? 'var(--success)' : 'var(--text-muted)', fontWeight: due || mastered ? 700 : 500 }}>{timing}</span>
                    {p.nextRevisionDate && !mastered && <div className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>{new Date(p.nextRevisionDate).toLocaleDateString('en-US')}</div>}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <Link href={`/problems/${p.id}`} aria-label={`Open ${p.title}`} style={{ color: due ? 'var(--primary)' : 'var(--text-muted)', display: 'inline-flex' }}><ArrowRight size={16} /></Link>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex justify-between items-center" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-base)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          <div className="text-sm text-muted">Showing 1 to {problems.length} of {problems.length}{hasActiveFilters ? ` (filtered from ${allProblems.length})` : ''}</div>
          <div className="flex items-center gap-2">
            <button style={{ padding: '0.25rem' }}><ChevronLeft size={16} className="text-muted" /></button>
            <button style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '4px', fontSize: '0.875rem' }}>1</button>
            <button style={{ padding: '0.25rem' }}><ChevronRight size={16} className="text-muted" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
