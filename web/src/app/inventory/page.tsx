import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, ArrowRight, CheckCircle } from 'lucide-react';
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
};

async function getProblems(): Promise<InventoryProblem[]> {
  const res = await fetch('http://127.0.0.1:3001/problems', {
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json() as Promise<InventoryProblem[]>;
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
  return `Upcoming · ${date.toLocaleDateString()}`;
}

export default async function InventoryPage() {
  const problems = await getProblems();

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
        <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search problems..." 
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)' }}
            />
          </div>
          
          <select style={{ padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', appearance: 'none' }}>
            <option>All Topics</option>
          </select>
          <select style={{ padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', appearance: 'none' }}>
            <option>All Patterns</option>
          </select>
          <select style={{ padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', appearance: 'none' }}>
            <option>All Difficulties</option>
          </select>
          <select style={{ padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', appearance: 'none' }}>
            <option>All Status</option>
          </select>
          <select style={{ padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', appearance: 'none' }}>
            <option>All Sources</option>
          </select>

          <button style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} /> Filters
          </button>
        </div>

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
                <th style={{ padding: '1rem 1.5rem' }}>Difficulty</th>
                <th style={{ padding: '1rem 1.5rem' }}>Source</th>
                <th style={{ padding: '1rem 1.5rem' }}>Lifecycle</th>
                <th style={{ padding: '1rem 1.5rem' }}>Review</th>
                <th style={{ padding: '1rem 1.5rem', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {problems.length === 0 && (
                <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No problems added yet.</td></tr>
              )}
              {problems.map((p) => {
                const mastered = p.status === 'MASTERED' || p.stage >= 4;
                const timing = mastered ? 'Complete' : reviewTiming(p.nextRevisionDate);
                const due = timing === 'Due Today' || timing === 'Overdue';
                return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}><input type="checkbox" /></td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                    <Link href={`/problems/${p.id}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{p.topic}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{p.pattern}</td>
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
                    {p.nextRevisionDate && !mastered && <div className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>{new Date(p.nextRevisionDate).toLocaleDateString()}</div>}
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
          <div className="text-sm text-muted">Showing 1 to {problems.length} of {problems.length}</div>
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
