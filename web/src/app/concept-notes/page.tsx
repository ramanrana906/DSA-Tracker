import Link from 'next/link';
import { Search, Edit2, BookOpen } from 'lucide-react';
import AddConceptButton from '@/components/AddConceptButton';

type ConceptNote = {
  id: number;
  pattern: string;
  topic: string;
  coreIdea: string;
  template?: string | null;
  variations?: string | null;
  pitfalls?: string | null;
};

type ProblemSummary = { id: number; title: string; pattern?: string | null; difficulty: string };

async function getConcepts(): Promise<ConceptNote[]> {
  const res = await fetch('http://127.0.0.1:3001/concepts', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function getProblems(): Promise<ProblemSummary[]> {
  const res = await fetch('http://127.0.0.1:3001/problems', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

function listLines(value?: string | null) {
  return (value || '').split('\n').map((line) => line.trim()).filter(Boolean);
}

export default async function ConceptNotesPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const [concepts, problems] = await Promise.all([getConcepts(), getProblems()]);
  const selected = (id ? concepts.find((c) => String(c.id) === id) : concepts[0]) || null;
  const relatedProblems = selected ? problems.filter((p) => p.pattern === selected.pattern) : [];

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
          <AddConceptButton />
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
            {concepts.length === 0 && (
              <p className="text-muted text-sm" style={{ padding: '1.5rem' }}>No concept notes yet.</p>
            )}
            {concepts.map((c) => (
              <Link
                key={c.id}
                href={`/concept-notes?id=${c.id}`}
                className="flex items-center gap-3"
                style={selected?.id === c.id
                  ? { padding: '1rem 1.5rem', background: 'var(--bg-panel-hover)', color: 'var(--primary)', fontWeight: 500, borderLeft: '3px solid var(--primary)' }
                  : { padding: '1rem 1.5rem', color: 'var(--text-muted)', borderLeft: '3px solid transparent' }}
              >
                <BookOpen size={16} /> {c.pattern}
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - Concept Viewer */}
        <div className="panel" style={{ padding: '2rem' }}>

          {!selected ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: '3rem 0' }}>
              <BookOpen size={28} className="text-muted" style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>No concept notes yet</h3>
              <p className="text-sm text-muted" style={{ maxWidth: '360px' }}>Capture the core idea, template, and pitfalls for a pattern so future revisions are self-contained.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {selected.pattern} <Edit2 size={18} className="text-muted cursor-pointer hover:text-primary" />
                </h2>
                <span className="badge">{selected.topic}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>

                {/* Main Content */}
                <div className="flex flex-col gap-6">

                  <div>
                    <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Core Idea</h3>
                    <p className="text-sm" style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.coreIdea}</p>
                  </div>

                  {selected.template && (
                    <div>
                      <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Template / Pseudocode</h3>
                      <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '1.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontFamily: 'monospace', lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{selected.template}</pre>
                    </div>
                  )}

                </div>

                {/* Sidebar Content */}
                <div className="flex flex-col gap-6">

                  {listLines(selected.variations).length > 0 && (
                    <div>
                      <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Common Variations</h3>
                      <ul className="text-sm flex flex-col gap-2" style={{ paddingLeft: '1rem', listStyleType: 'disc' }}>
                        {listLines(selected.variations).map((line, i) => <li key={i}>{line}</li>)}
                      </ul>
                    </div>
                  )}

                  {listLines(selected.pitfalls).length > 0 && (
                    <div>
                      <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Common Pitfalls</h3>
                      <ul className="text-sm flex flex-col gap-2" style={{ paddingLeft: '1rem', listStyleType: 'disc' }}>
                        {listLines(selected.pitfalls).map((line, i) => <li key={i}>{line}</li>)}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Problems Using This Pattern</h3>
                    {relatedProblems.length === 0 ? (
                      <p className="text-sm text-muted">No problems tagged with this pattern yet.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {relatedProblems.map((p, i) => (
                          <div key={p.id} className="flex justify-between items-center text-sm">
                            <Link href={`/problems/${p.id}`} className="hover:underline">{i + 1}. {p.title}</Link>
                            <span className={`badge ${p.difficulty === 'Easy' ? 'success' : p.difficulty === 'Medium' ? 'warning' : 'danger'}`}>{p.difficulty}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
