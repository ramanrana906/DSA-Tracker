import Link from 'next/link';
import { Plus, Search, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

export default function MistakeJournalPage() {
  return (
    <div style={{ padding: '0 0 2rem 0' }}>
      
      <header className="main-header" style={{ padding: '0 0 1.5rem 0' }}>
        <div>
          <h1>Mistake Journal</h1>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Track mistakes, learn from them, and don&apos;t repeat.</p>
        </div>
        <div>
          <button className="btn-primary">
            <Plus size={16} /> Add Mistake
          </button>
        </div>
      </header>

      <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', marginBottom: '2rem' }}>
        
        {/* Filters Bar */}
        <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          
          <select style={{ padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', appearance: 'none' }}>
            <option>All Categories</option>
          </select>
          <select style={{ padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', appearance: 'none' }}>
            <option>All Topics</option>
          </select>
          <select style={{ padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)', appearance: 'none' }}>
            <option>01 Jan 2025 - 08 Aug 2025</option>
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
              {[
                { p: 'Merge Intervals', c: 'Wrong Pattern', color: 'var(--danger)', d: '6 Aug 2025', desc: 'Tried using hash map instead of sorting.', fix: 'Sort first, then merge overlapping intervals.' },
                { p: '3Sum', c: 'Edge Case Missed', color: 'var(--warning)', d: '5 Aug 2025', desc: 'Missed duplicate triplets.', fix: 'Skip duplicates with proper checks.' },
                { p: 'Binary Tree Right Side View', c: 'Implementation Bug', color: 'var(--info)', d: '3 Aug 2025', desc: 'Wrong level order logic.', fix: 'Use queue size per level.' },
                { p: 'Subarray Sum Equals K', c: 'Misread Constraints', color: '#c026d3', d: '2 Aug 2025', desc: 'Assumed positive numbers.', fix: 'Handle negative with prefix sum.' },
                { p: 'LRU Cache', c: 'Didn\'t Know Concept', color: '#0891b2', d: '31 Jul 2025', desc: 'Not aware of design.', fix: 'Learn design patterns (DLL + HashMap).' }
              ].map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                    <Link href="#" className="hover:underline text-sm">{m.p}</Link>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500, fontSize: '0.875rem', color: m.color }}>{m.c}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{m.d}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{m.desc}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{m.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex justify-between items-center" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-base)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          <div className="text-sm text-muted">Showing 1 to 5 of 38</div>
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
            {[
              { name: 'Wrong Pattern', pct: 42, color: 'var(--danger)' },
              { name: 'Edge Case Missed', pct: 28, color: 'var(--warning)' },
              { name: 'Misread Constraints', pct: 18, color: '#c026d3' },
              { name: 'Implementation Bug', pct: 12, color: 'var(--info)' }
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-4">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: m.color }} />
                <span style={{ flex: 1, fontWeight: 500 }}>{m.name}</span>
                <div style={{ width: '200px', height: '8px', background: 'var(--bg-panel-hover)', borderRadius: '4px' }}>
                  <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: '4px' }} />
                </div>
                <span className="text-muted" style={{ width: '40px', textAlign: 'right' }}>{m.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel flex flex-col gap-6 justify-center">
          <div>
            <div className="text-sm font-medium text-muted mb-2">Total Mistakes</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>38</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted mb-2">This Period</div>
            <div className="flex items-center gap-2" style={{ color: 'var(--success)', fontWeight: 500 }}>
              <TrendingUp size={16} /> 12% from last period
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
