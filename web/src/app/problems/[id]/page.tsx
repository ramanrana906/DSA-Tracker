import Link from 'next/link';
import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import AttemptWorkspace from './AttemptWorkspace';

type ProblemAttempt = {
  id: number;
  date: string;
  outcome: string;
  timeTaken?: number | null;
  approach?: string | null;
  thoughts?: string | null;
  complexity?: string | null;
  code?: string | null;
};

type ProblemRevision = {
  id: number;
  completedDate: string;
  outcome: string;
  stageBefore: number;
  stageAfter: number;
  recallTime?: number | null;
  assessment?: string | null;
  approach?: string | null;
};

type ProblemDetail = {
  id: number;
  title: string;
  link?: string | null;
  topic: string;
  pattern?: string | null;
  difficulty: string;
  sourceList?: string | null;
  status: string;
  stage: number;
  firstSolvedAt?: string | null;
  nextRevisionDate?: string | null;
  lastRevisionDate?: string | null;
  masteredAt?: string | null;
  problemStatement?: string | null;
  exampleInput?: string | null;
  exampleOutput?: string | null;
  constraints?: string | null;
  solutionNotes?: string | null;
  triggerNote?: string | null;
  ease?: number;
  isLeech?: boolean;
  forgotCount?: number;
  tags?: { id: number; name: string }[];
  attempts?: ProblemAttempt[];
  revisionLogs?: ProblemRevision[];
  mistakeEntries?: { id: number; date: string; category: string; description: string }[];
};

async function getProblem(id: string): Promise<ProblemDetail | null> {
  const res = await fetch(`http://127.0.0.1:3001/problems/${id}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json() as Promise<ProblemDetail>;
}

export default async function ProblemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblem(id);

  if (!problem) {
    return <div className="p-8">Problem not found.</div>;
  }

  return (
    <div className="main-content" style={{ padding: '2rem' }}>
      <Link href="/inventory" className="flex items-center gap-2 text-sm text-muted hover:underline" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to Inventory
      </Link>

      {problem.isLeech && (
        <div className="leech-banner">
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '0.1rem', color: 'var(--warning)' }} />
          <div>
            <strong>This one keeps slipping.</strong>
            <p className="text-sm" style={{ marginTop: '0.2rem' }}>
              {problem.forgotCount} failed recall{problem.forgotCount === 1 ? '' : 's'} so far. Before the next attempt, review the solution notes or the linked concept note instead of just retrying cold.
            </p>
          </div>
        </div>
      )}

      {/* Problem Header */}
      <div className="panel" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '1.5rem' }}>
              {problem.title}
              {problem.link && (
                <a href={problem.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
                  <ExternalLink size={18} />
                </a>
              )}
            </h1>
            <div className="flex gap-2 flex-wrap">
              <span className="badge">{problem.topic}</span>
              {problem.pattern && <span className="badge">{problem.pattern}</span>}
              <span className={`badge ${problem.difficulty === 'Easy' ? 'success' : problem.difficulty === 'Medium' ? 'warning' : 'danger'}`}>{problem.difficulty}</span>
              {problem.sourceList && <span className="badge">{problem.sourceList}</span>}
              {problem.tags?.map((tag) => <span key={tag.id} className="tag-chip">{tag.name}</span>)}
            </div>
          </div>
            <div className="flex gap-3 items-center">
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted">Status</span>
              <span className={`badge ${problem.status === 'MASTERED' || problem.status === 'SOLVED' ? 'success' : problem.status === 'DUE' ? 'danger' : problem.status === 'IN_PROGRESS' ? 'warning' : ''}`} style={{ fontSize: '0.8rem' }}>
                {problem.status || 'UNSOLVED'}
              </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted">Revision</span>
                <span className="font-medium text-sm">{problem.status === 'UNSOLVED' ? 'First Solve' : problem.status === 'MASTERED' ? 'Mastered' : `${problem.stage + 1}/4`}</span>
              </div>
              {problem.lastRevisionDate && (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted">Last Revision</span>
                  <span className="font-medium text-sm">{new Date(problem.lastRevisionDate).toLocaleDateString('en-US')}</span>
                </div>
              )}
            {problem.nextRevisionDate && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted">Next Revision</span>
                <span className="font-medium text-sm">{new Date(problem.nextRevisionDate).toLocaleDateString('en-US')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Spaced Repetition Progress */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <h3 className="text-xs text-muted mb-3 uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>Spaced Repetition Timeline</h3>
          
          {(() => {
            const successfulRevision = (revisionNumber: number) => problem.revisionLogs?.find((revision) => revision.outcome === 'RECALLED' && revision.stageBefore === revisionNumber - 1);
            const solvedAttempt = problem.attempts?.find((attempt) => attempt.outcome === 'SOLVED');
            const hasFirstSolve = Boolean(problem.firstSolvedAt) || Boolean(solvedAttempt) || problem.revisionLogs?.length || problem.stage > 0 || ['SOLVED', 'DUE', 'IN_PROGRESS', 'MASTERED'].includes(problem.status);
            const currentIndex = hasFirstSolve ? Math.min(problem.stage + 1, 4) : 0;
            const latestRevision = problem.revisionLogs?.[0];
            const currentFailed = latestRevision?.outcome === 'FORGOT' && latestRevision.stageBefore === problem.stage;
            const stages = [
              { label: 'First Solve', date: problem.firstSolvedAt || solvedAttempt?.date, complete: Boolean(hasFirstSolve) },
              ...[1, 2, 3, 4].map((revisionNumber) => {
                const revision = successfulRevision(revisionNumber);
                return { label: `Revision ${revisionNumber}`, date: revision?.completedDate, complete: Boolean(revision) };
              }),
            ];
            const completedStages = stages.filter((stage) => stage.complete).length;
            const progress = ((completedStages - 1) / (stages.length - 1)) * 100;

            return (
              <div className="sr-timeline-scroll">
                <div className="sr-timeline" aria-label={`Spaced repetition progress: ${completedStages} of ${stages.length} milestones complete`}>
                  <div className="sr-timeline-track"><span style={{ width: `${Math.max(progress, 0)}%` }} /></div>
                  {stages.map((stage, index) => {
                    const isCurrent = problem.status !== 'MASTERED' && index === currentIndex;
                    const isFailed = isCurrent && currentFailed;
                    const displayDate = stage.date || (isCurrent ? problem.nextRevisionDate : null);
                    return (
                      <div className={`sr-stage ${stage.complete ? 'complete' : ''} ${isCurrent ? 'current' : ''} ${isFailed ? 'failed' : ''}`} key={stage.label}>
                        <div className="sr-stage-label">{stage.label}</div>
                        <div className="sr-stage-dot">{stage.complete ? '✓' : isFailed ? '!' : ''}</div>
                        <div className="sr-stage-date">{displayDate ? new Date(displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : isCurrent && index === 0 ? 'Start here' : isCurrent ? 'Not scheduled' : 'After success'}</div>
                      </div>
                    );
                  })}
                </div>
                {problem.status === 'MASTERED' && <div className="sr-mastered">MASTERED</div>}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Problem content stays visible without exposing the saved solution. */}
      <section className="panel" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Problem</h2>
        {problem.problemStatement ? (
          <p className="text-sm" style={{ lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{problem.problemStatement}</p>
        ) : (
          <p className="text-sm text-muted">
            No problem statement has been saved yet. {problem.link ? <a href={problem.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Open the source problem</a> : 'Add one when creating the problem to keep revisions self-contained.'}
          </p>
        )}
        {(problem.exampleInput || problem.exampleOutput || problem.constraints) && (
          <div className="problem-details-grid" style={{ marginTop: '1rem' }}>
            {problem.exampleInput && <div><span className="text-xs text-muted">Example input</span><pre className="problem-detail-code">{problem.exampleInput}</pre></div>}
            {problem.exampleOutput && <div><span className="text-xs text-muted">Example output</span><pre className="problem-detail-code">{problem.exampleOutput}</pre></div>}
            {problem.constraints && <div><span className="text-xs text-muted">Constraints</span><p className="text-sm" style={{ marginTop: '0.35rem', whiteSpace: 'pre-wrap' }}>{problem.constraints}</p></div>}
          </div>
        )}
      </section>

      {/* Attempt Workspace — Client Component */}
      <AttemptWorkspace problem={problem} />
    </div>
  );
}
