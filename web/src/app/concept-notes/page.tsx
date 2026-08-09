import Link from 'next/link';
import { Plus, Search, Edit2, Columns, Map, Link2, Key, Target, Binary, ListTree, GitBranch } from 'lucide-react';

export default function ConceptNotesPage() {
  return (
    <div style={{ padding: '0 0 2rem 0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <header className="main-header" style={{ padding: '0 0 1.5rem 0' }}>
        <div>
          <h1>Concept Notes</h1>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Core ideas, templates, and patterns.</p>
        </div>
        <div className="flex gap-4">
          <div style={{ position: 'relative' }}>
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search patterns or topics..." 
              style={{ width: '300px', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
            />
          </div>
          <button className="btn-primary">
            <Plus size={16} /> New Note
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', flex: 1, alignItems: 'start' }}>
        
        {/* LEFT COLUMN - Concept List */}
        <div className="panel" style={{ padding: '0' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
            <select style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)' }}>
              <option>All Patterns</option>
              <option>All Topics</option>
            </select>
          </div>
          
          <div className="flex flex-col text-sm">
            <Link href="#" className="flex items-center gap-3" style={{ padding: '1rem 1.5rem', background: 'var(--bg-panel-hover)', color: 'var(--primary)', fontWeight: 500, borderLeft: '3px solid var(--primary)' }}>
              <Columns size={16} /> Two Pointers
            </Link>
            <Link href="#" className="flex items-center gap-3 text-muted hover:bg-slate-50" style={{ padding: '1rem 1.5rem' }}>
              <Map size={16} /> Sliding Window
            </Link>
            <Link href="#" className="flex items-center gap-3 text-muted hover:bg-slate-50" style={{ padding: '1rem 1.5rem' }}>
              <Key size={16} /> Hashing
            </Link>
            <Link href="#" className="flex items-center gap-3 text-muted hover:bg-slate-50" style={{ padding: '1rem 1.5rem' }}>
              <ListTree size={16} /> Stack
            </Link>
            <Link href="#" className="flex items-center gap-3 text-muted hover:bg-slate-50" style={{ padding: '1rem 1.5rem' }}>
              <Target size={16} /> Binary Search
            </Link>
            <Link href="#" className="flex items-center gap-3 text-muted hover:bg-slate-50" style={{ padding: '1rem 1.5rem' }}>
              <Binary size={16} /> Dynamic Programming
            </Link>
            <Link href="#" className="flex items-center gap-3 text-muted hover:bg-slate-50" style={{ padding: '1rem 1.5rem' }}>
              <GitBranch size={16} /> Tree
            </Link>
            <Link href="#" className="flex items-center gap-3 text-muted hover:bg-slate-50" style={{ padding: '1rem 1.5rem' }}>
              <Link2 size={16} /> Graph
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN - Concept Viewer */}
        <div className="panel" style={{ padding: '2rem' }}>
          
          <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Two Pointers <Edit2 size={18} className="text-muted cursor-pointer hover:text-primary" />
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            
            {/* Main Content */}
            <div className="flex flex-col gap-6">
              
              <div>
                <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Core Idea</h3>
                <p className="text-sm" style={{ lineHeight: 1.6 }}>
                  Use two pointers to traverse a data structure from two different directions or with different speeds to solve problems efficiently.
                </p>
              </div>

              <div>
                <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Template / Pseudocode</h3>
                <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '1.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontFamily: 'monospace', lineHeight: 1.5 }}>
                  <div style={{ color: '#569cd6' }}>left <span style={{ color: '#d4d4d4' }}>=</span> <span style={{ color: '#b5cea8' }}>0</span></div>
                  <div style={{ color: '#569cd6' }}>right <span style={{ color: '#d4d4d4' }}>= n -</span> <span style={{ color: '#b5cea8' }}>1</span></div>
                  <br />
                  <div style={{ color: '#c586c0' }}>while <span style={{ color: '#d4d4d4' }}>left &lt; right:</span></div>
                  <div style={{ paddingLeft: '1.5rem', color: '#6a9955' }}># do something</div>
                  <div style={{ paddingLeft: '1.5rem', color: '#c586c0' }}>if <span style={{ color: '#d4d4d4' }}>condition:</span></div>
                  <div style={{ paddingLeft: '3rem', color: '#6a9955' }}># do something else</div>
                  <div style={{ paddingLeft: '3rem', color: '#9cdcfe' }}>right <span style={{ color: '#d4d4d4' }}>-=</span> <span style={{ color: '#b5cea8' }}>1</span></div>
                  <div style={{ paddingLeft: '1.5rem', color: '#c586c0' }}>elif <span style={{ color: '#d4d4d4' }}>condition:</span></div>
                  <div style={{ paddingLeft: '3rem', color: '#6a9955' }}># met target / move both</div>
                  <div style={{ paddingLeft: '3rem', color: '#9cdcfe' }}>left <span style={{ color: '#d4d4d4' }}>+=</span> <span style={{ color: '#b5cea8' }}>1</span></div>
                  <div style={{ paddingLeft: '3rem', color: '#9cdcfe' }}>right <span style={{ color: '#d4d4d4' }}>-=</span> <span style={{ color: '#b5cea8' }}>1</span></div>
                  <div style={{ paddingLeft: '1.5rem', color: '#c586c0' }}>else<span style={{ color: '#d4d4d4' }}>:</span></div>
                  <div style={{ paddingLeft: '3rem', color: '#9cdcfe' }}>left <span style={{ color: '#d4d4d4' }}>+=</span> <span style={{ color: '#b5cea8' }}>1</span></div>
                </div>
              </div>

            </div>

            {/* Sidebar Content */}
            <div className="flex flex-col gap-6">
              
              <div>
                <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Common Variations</h3>
                <ul className="text-sm flex flex-col gap-2" style={{ paddingLeft: '1rem', listStyleType: 'disc' }}>
                  <li>Pair sum problems</li>
                  <li>Palindrome check</li>
                  <li>Container with Most Water</li>
                  <li>Removing duplicates</li>
                  <li>Partition problems</li>
                </ul>
              </div>

              <div>
                <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Common Pitfalls</h3>
                <ul className="text-sm flex flex-col gap-2" style={{ paddingLeft: '1rem', listStyleType: 'disc' }}>
                  <li>Moving wrong pointer</li>
                  <li>Skipping duplicates</li>
                  <li>Off-by-one errors</li>
                  <li>Infinite loop (no pointer move)</li>
                </ul>
              </div>

              <div>
                <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Problems Using This Pattern</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <Link href="#" className="hover:underline">1. Two Sum II - Input Array Is Sorted</Link>
                    <span className="badge success">Easy</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <Link href="#" className="hover:underline">2. 3Sum</Link>
                    <span className="badge warning">Medium</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <Link href="#" className="hover:underline">3. Container With Most Water</Link>
                    <span className="badge warning">Medium</span>
                  </div>
                  <Link href="#" className="text-xs mt-2" style={{ color: 'var(--info)' }}>View all (18)</Link>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
