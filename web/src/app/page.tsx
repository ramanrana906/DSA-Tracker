import Link from 'next/link';
import { Calendar, Hourglass, ClipboardList, CheckCircle, Target, Flame, RefreshCw, AlertTriangle, ArrowRight, BookOpen, List } from 'lucide-react';
import AddProblemButton from '@/components/AddProblemButton';

type DashboardProblem = { id: number; title: string; difficulty: string; stage: number; nextRevisionDate?: string | null };
type ProgressRow = { topic?: string; pattern?: string; total: number; solved: number; mastery: number; avgAttempts: string };
type DashboardAnalytics = {
  kpi: { totalProblems: number; solvedProblems: number; masteryPercent: number; revisionsCompleted: number; avgAttempts: string | number };
  topicProgress: ProgressRow[];
  patternProgress: ProgressRow[];
  mistakeCategories: { name: string; pct: number }[];
  recentProblems: DashboardProblem[];
  streak: number;
};

async function getDashboardData() {
  const [dueRes, analyticsRes, allProblemsRes] = await Promise.all([
    fetch('http://127.0.0.1:3001/problems/due', { cache: 'no-store' }),
    fetch('http://127.0.0.1:3001/analytics', { cache: 'no-store' }),
    fetch('http://127.0.0.1:3001/problems', { cache: 'no-store' }),
  ]);
  
  const dueProblems = dueRes.ok ? await dueRes.json() as DashboardProblem[] : [];
  const analytics = analyticsRes.ok ? await analyticsRes.json() as DashboardAnalytics : null;
  const allProblems = allProblemsRes.ok ? await allProblemsRes.json() as DashboardProblem[] : [];
  
  return { dueProblems, analytics, allProblems };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function Dashboard() {
  const { dueProblems, analytics, allProblems } = await getDashboardData();
  const kpi = analytics?.kpi || { totalProblems: 0, solvedProblems: 0, masteryPercent: 0, revisionsCompleted: 0, avgAttempts: 0 };
  const topicProgress = analytics?.topicProgress || [];
  const patternProgress = analytics?.patternProgress || [];
  const mistakeCategories = analytics?.mistakeCategories || [];
  const recentProblems = analytics?.recentProblems || [];
  const streak = analytics?.streak || 0;

  return (
    <>
      <header className="main-header">
        <div>
          <h1>{getGreeting()}, Raman 👋</h1>
          <p className="text-muted text-sm">Keep solving, keep growing.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="panel flex items-center gap-2 text-sm" style={{ padding: '0.6rem 1rem' }}>
            {getFormattedDate()} <Calendar size={16} className="text-muted" />
          </button>
          <AddProblemButton />
        </div>
      </header>

      <main className="main-content flex flex-col gap-6">
        
        {/* TOP STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          <div className="panel" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'none' }}>Revisions Due Today</h3>
            <div className="flex justify-between items-end">
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{dueProblems.length}</div>
                <div className="text-xs text-muted mt-1">Oldest: {dueProblems[0]?.title || 'None'}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)' }}>
                <Hourglass size={24} color="var(--primary)" />
              </div>
            </div>
          </div>
          
          <div className="panel" style={{ borderLeft: '4px solid var(--info)' }}>
            <h3 style={{ color: 'var(--info)', marginBottom: '0.5rem', textTransform: 'none' }}>Avg Attempts</h3>
            <div className="flex justify-between items-end">
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.avgAttempts}</div>
                <div className="text-xs text-muted mt-1">Across all problems</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)' }}>
                <ClipboardList size={24} color="var(--info)" />
              </div>
            </div>
          </div>
          
          <div className="panel" style={{ borderLeft: '4px solid var(--success)' }}>
            <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem', textTransform: 'none' }}>Problems Solved</h3>
            <div className="flex justify-between items-end">
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.solvedProblems}</div>
                <div className="text-xs text-muted mt-1">{kpi.totalProblems} total in inventory</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle size={24} color="var(--success)" />
              </div>
            </div>
          </div>
          
          <div className="panel" style={{ borderLeft: '4px solid var(--warning)' }}>
            <h3 style={{ color: 'var(--warning)', marginBottom: '0.5rem', textTransform: 'none' }}>Mastery % (All)</h3>
            <div className="flex justify-between items-end">
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.masteryPercent}%</div>
                <div className="text-xs text-muted mt-1">Across all topics</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)' }}>
                <Target size={24} color="var(--warning)" />
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="dashboard-grid">
          
          {/* TODAY'S TO-DO */}
          <div className="panel" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2>Today&apos;s To-Do</h2>
            </div>
            
            <div className="flex">
              {/* Due For Revision */}
              <div style={{ flex: 1, padding: '1.5rem', borderRight: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>A. Due for Revision</h3>
                  <RefreshCw size={16} className="text-muted" />
                </div>
                
                <div className="flex flex-col gap-4">
                  {dueProblems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center" style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                      <CheckCircle size={24} style={{ color: 'var(--success)', marginBottom: '0.75rem' }} />
                      <h4 className="font-medium" style={{ marginBottom: '0.25rem' }}>You&apos;re all caught up!</h4>
                      <p className="text-sm text-muted" style={{ maxWidth: '200px' }}>No revisions due today.</p>
                    </div>
                  ) : (
                    dueProblems.slice(0, 5).map((p, i) => (
                      <Link href={`/problems/${p.id}`} key={p.id} className="flex justify-between items-center text-sm" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                        <div className="flex gap-4">
                          <span className="text-muted">{i + 1}.</span>
                          <div><span>{p.title}</span><div className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>Revision {p.stage + 1} / 4 · {p.nextRevisionDate ? new Date(p.nextRevisionDate).toLocaleDateString() : 'Due'}</div></div>
                        </div>
                        <span className={`badge ${p.difficulty === 'Easy' ? 'success' : p.difficulty === 'Medium' ? 'warning' : 'danger'}`}>
                          {p.difficulty}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
                {dueProblems.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <Link href="/inventory" className="text-sm" style={{ color: 'var(--info)' }}>View all ({dueProblems.length})</Link>
                  </div>
                )}
              </div>

              {/* Recently Added */}
              <div style={{ flex: 1, padding: '1.5rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>B. Recently Added</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  {recentProblems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center" style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                      <p className="text-sm text-muted">No problems added yet. Click &quot;Add Problem&quot; to start!</p>
                    </div>
                  ) : (
                    recentProblems.map((p, i) => (
                      <Link href={`/problems/${p.id}`} key={p.id} className="flex justify-between items-center text-sm" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                        <div className="flex gap-4">
                          <span className="text-muted">{i + 1}.</span>
                          <span>{p.title}</span>
                        </div>
                        <span className={`badge ${p.difficulty === 'Easy' ? 'success' : p.difficulty === 'Medium' ? 'warning' : 'danger'}`}>
                          {p.difficulty}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
                {recentProblems.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <Link href="/inventory" className="text-sm" style={{ color: 'var(--info)' }}>View all ({allProblems.length})</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (3 Stacked Panels) */}
          <div className="flex flex-col gap-6">
            
            {/* Current Streak */}
            <div className="panel">
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                  <Flame size={18} color="var(--warning)" /> Current Streak
                </h3>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{streak} <span className="text-sm text-muted font-normal">days</span></div>
                  <div className="text-xs text-muted mt-1">{streak === 0 ? 'Start solving to build your streak!' : 'Keep it going!'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', background: i < streak ? 'var(--success)' : 'var(--bg-panel-light)' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Revisions Completed */}
            <div className="panel">
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                  <Calendar size={18} color="var(--primary)" /> Revisions Completed
                </h3>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.revisionsCompleted}</div>
                <div className="text-xs text-muted mt-1">Total revision sessions</div>
              </div>
            </div>

            {/* Top 3 Mistake Categories */}
            <div className="panel">
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                  <AlertTriangle size={18} color="var(--danger)" /> Top Mistake Categories
                </h3>
                <Link href="/mistake-journal" className="badge">View all</Link>
              </div>
              <div className="flex flex-col gap-4 text-sm">
                {mistakeCategories.length === 0 ? (
                  <p className="text-muted text-center" style={{ padding: '1rem 0' }}>No mistakes logged yet.</p>
                ) : (
                  mistakeCategories.map((m, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-muted" style={{ width: '12px' }}>{i + 1}.</span>
                      <span style={{ flex: 1 }}>{m.name}</span>
                      <div style={{ width: '60px', height: '6px', background: 'var(--bg-panel-light)', borderRadius: '3px' }}>
                        <div style={{ width: `${m.pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                      </div>
                      <span className="text-muted" style={{ width: '32px', textAlign: 'right' }}>{m.pct}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="panel">
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2>Topic-wise Progress</h2>
              <Link href="/analytics" className="text-sm" style={{ color: 'var(--info)' }}>View all topics</Link>
            </div>
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
                {topicProgress.slice(0, 5).map((r) => (
                  <tr key={r.topic} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem 0' }}>{r.topic}</td>
                    <td style={{ padding: '0.75rem 0' }}>{r.total}</td>
                    <td style={{ padding: '0.75rem 0' }}>{r.solved}</td>
                    <td style={{ padding: '0.75rem 0', width: '120px' }}>
                      <div className="flex items-center gap-2">
                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-panel-light)', borderRadius: '3px' }}>
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
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2>Pattern-wise Progress</h2>
              <Link href="/analytics" className="text-sm" style={{ color: 'var(--info)' }}>View all patterns</Link>
            </div>
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
                {patternProgress.slice(0, 5).map((r) => (
                  <tr key={r.pattern} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem 0' }}>{r.pattern}</td>
                    <td style={{ padding: '0.75rem 0' }}>{r.total}</td>
                    <td style={{ padding: '0.75rem 0' }}>{r.solved}</td>
                    <td style={{ padding: '0.75rem 0', width: '120px' }}>
                      <div className="flex items-center gap-2">
                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-panel-light)', borderRadius: '3px' }}>
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

        {/* QUICK LINKS */}
        <div style={{ marginTop: '1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Quick Links</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <Link href="/inventory" className="panel flex items-center justify-between" style={{ padding: '1.25rem', transition: 'background 0.2s', cursor: 'pointer' }}>
              <div className="flex items-center gap-4">
                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
                  <List size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Inventory</div>
                  <div className="text-xs text-muted">Browse all problems</div>
                </div>
              </div>
              <ArrowRight size={18} className="text-muted" />
            </Link>
            
            <Link href="/concept-notes" className="panel flex items-center justify-between" style={{ padding: '1.25rem', transition: 'background 0.2s', cursor: 'pointer' }}>
              <div className="flex items-center gap-4">
                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
                  <BookOpen size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Concept Notes</div>
                  <div className="text-xs text-muted">Patterns, templates & more</div>
                </div>
              </div>
              <ArrowRight size={18} className="text-muted" />
            </Link>
            
            <Link href="/mistake-journal" className="panel flex items-center justify-between" style={{ padding: '1.25rem', transition: 'background 0.2s', cursor: 'pointer' }}>
              <div className="flex items-center gap-4">
                <div style={{ background: 'var(--warning)', padding: '0.75rem', borderRadius: '12px' }}>
                  <AlertTriangle size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Mistake Journal</div>
                  <div className="text-xs text-muted">Learn from your mistakes</div>
                </div>
              </div>
              <ArrowRight size={18} className="text-muted" />
            </Link>
          </div>
        </div>
        
      </main>
    </>
  );
}
