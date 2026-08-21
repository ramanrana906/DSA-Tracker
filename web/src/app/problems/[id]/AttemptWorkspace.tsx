'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Code,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Attempt = {
  id: number;
  date: string;
  outcome: string;
  timeTaken?: number | null;
  approach?: string | null;
  thoughts?: string | null;
  complexity?: string | null;
  code?: string | null;
};

type RevisionLog = {
  id: number;
  completedDate: string;
  outcome: string;
  stageBefore: number;
  stageAfter: number;
  recallTime?: number | null;
  assessment?: string | null;
  approach?: string | null;
  thoughts?: string | null;
  code?: string | null;
};

type MistakeEntry = {
  id: number;
  date: string;
  category: string;
  description: string;
};

type Problem = {
  id: number;
  title: string;
  status: string;
  stage: number;
  firstSolvedAt?: string | null;
  pattern?: string | null;
  triggerNote?: string | null;
  nextRevisionDate?: string | null;
  lastRevisionDate?: string | null;
  masteredAt?: string | null;
  link?: string | null;
  solutionNotes?: string | null;
  ease?: number;
  attempts?: Attempt[];
  revisionLogs?: RevisionLog[];
  mistakeEntries?: MistakeEntry[];
};

type Assessment = 'EASY' | 'EFFORT' | 'MOSTLY_FORGOT' | 'COULDNT_SOLVE';
type CompletionKind = 'FIRST_SOLVE_SUCCESS' | 'FIRST_SOLVE_FAILURE' | 'REVISION_SUCCESS' | 'REVISION_FAILURE' | 'MASTERED';
type Completion = {
  kind: CompletionKind;
  assessment: Assessment;
  revisionNumber: number;
  nextReview?: string | null;
  recallTime: number;
  mistakeCount: number;
};

const assessmentOptions: { value: Assessment; label: string; detail: string; color: string; background: string }[] = [
  { value: 'EASY', label: '😎 Easy', detail: 'Solved it confidently', color: 'var(--success)', background: 'var(--success-bg)' },
  { value: 'EFFORT', label: '🙂 Recalled with effort', detail: 'Needed time, but got there', color: 'var(--info)', background: 'var(--info-bg)' },
  { value: 'MOSTLY_FORGOT', label: '😕 Mostly forgot', detail: 'Remembered only parts', color: 'var(--warning)', background: 'var(--warning-bg)' },
  { value: 'COULDNT_SOLVE', label: "😵 Couldn't solve", detail: 'Restart the learning loop', color: 'var(--danger)', background: 'var(--danger-bg)' },
];

const mistakeOptions = [
  ['COULDNT_RECALL_PATTERN', "Couldn't recall pattern"],
  ['COULDNT_DERIVE_APPROACH', "Couldn't derive approach"],
  ['CODING_MISTAKE', 'Coding mistake'],
  ['COMPLEXITY_CONFUSION', 'Complexity confusion'],
  ['EDGE_CASE', 'Edge case'],
  ['SYNTAX_IMPLEMENTATION', 'Syntax / implementation'],
  ['OTHER', 'Other'],
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function relativeDate(value?: string | null) {
  if (!value) return 'Not yet';
  const date = new Date(value);
  const today = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / dayMs);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days === -1) return 'Tomorrow';
  return date.toLocaleDateString('en-US');
}

function reviewTiming(value?: string | null) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const start = (entry: Date) => new Date(entry.getFullYear(), entry.getMonth(), entry.getDate()).getTime();
  const days = Math.round((start(date) - start(now)) / dayMs);
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Due Today';
  if (days === 1) return 'Due Tomorrow';
  return `Upcoming · ${date.toLocaleDateString('en-US')}`;
}

function humanizeOutcome(outcome?: string | null) {
  if (!outcome) return 'Not recorded';
  return outcome.toLowerCase().replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AttemptWorkspace({ problem }: { problem: Problem }) {
  const router = useRouter();
  const attempts = problem.attempts || [];
  const revisions = problem.revisionLogs || [];
  const mistakes = problem.mistakeEntries || [];
  const hasFirstSolve = Boolean(problem.firstSolvedAt)
    || attempts.some((attempt) => attempt.outcome === 'SOLVED')
    || revisions.length > 0
    || problem.stage > 0
    || ['SOLVED', 'DUE', 'IN_PROGRESS', 'MASTERED'].includes(problem.status);
  const isMastered = problem.status === 'MASTERED' || problem.stage >= 4;
  const isRevision = hasFirstSolve && !isMastered;
  const isRevisionDue = Boolean(problem.nextRevisionDate && new Date(problem.nextRevisionDate) <= new Date());
  const currentRevision = Math.min(problem.stage + 1, 4);
  const latestAttempt = attempts[0];
  const latestRevision = revisions[0];
  const latestSuccessfulRevision = revisions.find((revision) => revision.outcome === 'RECALLED');
  const latestMistake = mistakes[0];

  const [isAttempting, setIsAttempting] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [thoughts, setThoughts] = useState('');
  const [code, setCode] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [complexityReason, setComplexityReason] = useState('');
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [madeMistake, setMadeMistake] = useState(false);
  const [mistakeCategory, setMistakeCategory] = useState('');
  const [mistakeDescription, setMistakeDescription] = useState('');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attemptOutcome, setAttemptOutcome] = useState<'SOLVED' | 'STRUGGLED' | null>(null);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completion, setCompletion] = useState<Completion | null>(null);

  useEffect(() => {
    if (!isTimerRunning) return;
    const intervalId = window.setInterval(() => setTime((current) => current + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, [isTimerRunning]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--bg-base)',
    color: 'var(--text-main)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    resize: 'vertical',
  };

  const startAttempt = () => {
    setCompletion(null);
    setIsAttempting(true);
    setIsTimerRunning(true);
    setTime(0);
    setThoughts('');
    setCode('');
    setTimeComplexity('');
    setSpaceComplexity('');
    setComplexityReason('');
    setIsEditorExpanded(false);
    setShowSolution(false);
    setMadeMistake(false);
    setMistakeCategory('');
    setMistakeDescription('');
    setAssessment(null);
    setAttemptOutcome(null);
  };

  const returnToLearning = (mode: 'SOLUTION' | 'RETRY') => {
    if (mode === 'RETRY') {
      startAttempt();
      return;
    }
    if (!problem.solutionNotes) {
      if (problem.link) window.open(problem.link, '_blank', 'noopener,noreferrer');
      else toast.error('No saved solution or source link is available.');
      return;
    }
    setCompletion(null);
    setIsAttempting(true);
    setIsTimerRunning(false);
    setShowSolution(true);
  };

  const submitSession = async () => {
    if (isRevision && !assessment) {
      toast.error('Choose how well you recalled the problem before completing the revision.');
      return;
    }
    if (!isRevision && !attemptOutcome) {
      toast.error('Choose whether you solved or struggled with this first attempt.');
      return;
    }
    if (madeMistake && (!mistakeCategory || !mistakeDescription.trim())) {
      toast.error('Choose a mistake category and describe what you missed.');
      return;
    }

    setIsTimerRunning(false);
    setLoading(true);
    const isSuccessfulRecall = assessment === 'EASY' || assessment === 'EFFORT';
    const endpoint = isRevision
      ? `http://127.0.0.1:3001/problems/${problem.id}/revisions`
      : `http://127.0.0.1:3001/problems/${problem.id}/attempts`;
    const payload = isRevision
      ? {
          outcome: isSuccessfulRecall ? 'RECALLED' : 'FORGOT',
          assessment,
          recallTime: time,
          thoughts,
          code,
          approach: problem.pattern || undefined,
          timeComplexity,
          spaceComplexity,
          complexityReason,
        }
      : {
          outcome: attemptOutcome,
          timeTaken: time,
          thoughts,
          complexity: `Time: ${timeComplexity || '—'} | Space: ${spaceComplexity || '—'}${complexityReason ? ` | Why: ${complexityReason}` : ''}`,
          code,
          approach: problem.pattern || undefined,
        };

    if (madeMistake) {
      Object.assign(payload, { mistake: { category: mistakeCategory, description: mistakeDescription.trim() } });
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save session');

      const updatedProblem = await res.json();
      const selectedAssessment = assessment || (attemptOutcome === 'SOLVED' ? 'EASY' : 'MOSTLY_FORGOT');
      const kind: CompletionKind = isRevision
        ? updatedProblem.status === 'MASTERED'
          ? 'MASTERED'
          : isSuccessfulRecall
            ? 'REVISION_SUCCESS'
            : 'REVISION_FAILURE'
        : attemptOutcome === 'SOLVED'
          ? 'FIRST_SOLVE_SUCCESS'
          : 'FIRST_SOLVE_FAILURE';
      setCompletion({
        kind,
        assessment: selectedAssessment,
        revisionNumber: isRevision ? currentRevision : 0,
        nextReview: updatedProblem.nextRevisionDate,
        recallTime: time,
        mistakeCount: madeMistake ? 1 : 0,
      });
      setIsAttempting(false);
      toast.success(isRevision ? (isSuccessfulRecall ? 'Revision complete.' : `Revision ${currentRevision} remains active.`) : 'First attempt saved.');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save the learning session.');
    } finally {
      setLoading(false);
    }
  };

  const previousTimes = [
    ...attempts.map((attempt) => attempt.timeTaken),
    ...revisions.map((revision) => revision.recallTime),
  ].filter((value): value is number => typeof value === 'number');
  const previousBest = previousTimes.length ? Math.min(...previousTimes) : null;
  const historyItems = [
    ...revisions.map((revision) => ({
      id: `revision-${revision.id}`,
      title: `Revision ${revision.stageBefore + 1}`,
      date: revision.completedDate,
      time: revision.recallTime,
      outcome: revision.assessment ? assessmentOptions.find((option) => option.value === revision.assessment)?.label || humanizeOutcome(revision.outcome) : humanizeOutcome(revision.outcome),
      successful: revision.outcome === 'RECALLED',
      thoughts: revision.thoughts,
      code: revision.code,
    })),
    ...attempts.map((attempt, index) => ({
      id: `attempt-${attempt.id}`,
      title: attempts.length > 1 ? `First Solve Attempt ${attempts.length - index}` : 'First Solve',
      date: attempt.date,
      time: attempt.timeTaken,
      outcome: humanizeOutcome(attempt.outcome),
      successful: attempt.outcome === 'SOLVED',
      thoughts: attempt.thoughts,
      code: attempt.code,
    })),
  ].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
  const latestHistory = historyItems[0];

  return (
    <div className="revision-workspace">
      <div className="revision-main">
        {completion?.kind === 'REVISION_FAILURE' || completion?.kind === 'FIRST_SOLVE_FAILURE' ? (
          <section className="panel" style={{ padding: '1.75rem', borderColor: 'var(--warning)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}><AlertCircle size={20} /><span className="text-sm" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>{completion.kind === 'REVISION_FAILURE' ? `REVISION ${completion.revisionNumber} NEEDS ANOTHER PASS` : 'FIRST ATTEMPT SAVED'}</span></div>
            <h2 style={{ fontSize: '1.25rem' }}>{completion.kind === 'REVISION_FAILURE' ? "That's okay. This problem stays at the current revision." : 'Keep working through the first solve.'}</h2>
            <p className="text-sm text-muted" style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>{completion.kind === 'REVISION_FAILURE' ? `Revision ${completion.revisionNumber} did not advance. Retry it successfully before Revision ${Math.min(completion.revisionNumber + 1, 4)} can be scheduled.` : 'A revision will only be scheduled after a successful first solve.'}</p>
            <div className="flex gap-3 flex-wrap" style={{ marginTop: '1.25rem' }}>
              {completion.kind === 'REVISION_FAILURE' && <button className="btn-primary" onClick={() => returnToLearning('SOLUTION')} style={{ background: 'var(--primary)' }}>Review Solution</button>}
              <button className="secondary-action" onClick={() => returnToLearning('RETRY')}>Try Again</button>
              <button className="secondary-action" onClick={() => router.push('/inventory')}>Back to Inventory</button>
            </div>
          </section>
        ) : completion ? (
          <section className="panel" style={{ padding: '1.75rem' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--success)', marginBottom: '0.5rem' }}><CheckCircle size={20} /><span className="text-sm" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>{completion.kind === 'MASTERED' ? 'MASTERED' : completion.kind === 'FIRST_SOLVE_SUCCESS' ? 'PROBLEM SOLVED' : 'REVISION COMPLETE'}</span></div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{completion.kind === 'MASTERED' ? 'All four revisions are complete.' : completion.kind === 'FIRST_SOLVE_SUCCESS' ? 'Your first solve is complete.' : `Revision ${completion.revisionNumber} advanced successfully.`}</h2>
            <div className="completion-summary-grid">
              {completion.revisionNumber > 0 && <div><span>Revision</span><p className="text-sm" style={{ fontWeight: 700 }}>{completion.revisionNumber} / 4</p></div>}
              <div><span>{completion.revisionNumber > 0 ? 'Recall' : 'Result'}</span><p className="text-sm" style={{ fontWeight: 700 }}>{completion.revisionNumber > 0 ? assessmentOptions.find((option) => option.value === completion.assessment)?.label : 'Solved'}</p></div>
              <div><span>Time</span><p className="text-sm" style={{ fontWeight: 700 }}>{formatTime(completion.recallTime)}</p></div>
              {completion.revisionNumber === 0 && <div><span>Pattern</span><p className="text-sm" style={{ fontWeight: 700 }}>{problem.pattern || 'Not recorded'}</p></div>}
              {completion.revisionNumber === 0 && <div><span>Time Complexity</span><p className="text-sm" style={{ fontWeight: 700 }}>{timeComplexity || 'Not recorded'}</p></div>}
              {completion.revisionNumber === 0 && <div><span>Space Complexity</span><p className="text-sm" style={{ fontWeight: 700 }}>{spaceComplexity || 'Not recorded'}</p></div>}
              <div><span>Mistakes</span><p className="text-sm" style={{ fontWeight: 700 }}>{completion.mistakeCount}</p></div>
              {completion.kind !== 'MASTERED' && <div><span>Next Revision</span><p className="text-sm" style={{ fontWeight: 700 }}>{completion.nextReview ? `${relativeDate(completion.nextReview)} · ${new Date(completion.nextReview).toLocaleDateString('en-US')}${completion.revisionNumber > 0 ? ` · Revision ${completion.revisionNumber + 1}` : ''}` : 'Schedule pending'}</p></div>}
            </div>
            {previousBest !== null && completion.recallTime < previousBest && <p className="text-sm" style={{ color: 'var(--success)', marginTop: '1rem', fontWeight: 600 }}>{Math.round(((previousBest - completion.recallTime) / previousBest) * 100)}% faster than your previous best ({formatTime(previousBest)}).</p>}
            <div className="flex gap-3 flex-wrap" style={{ marginTop: '1.5rem' }}>
              <button className="btn-primary" onClick={() => router.push('/inventory')}>Back to Inventory</button>
              <button onClick={() => router.push('/')} className="secondary-action">Next Problem</button>
            </div>
          </section>
        ) : !isAttempting ? (
          <section className="panel" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: isMastered ? 'var(--success-bg)' : 'var(--primary-bg)', color: isMastered ? 'var(--success)' : 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>{isMastered ? <CheckCircle size={25} /> : <Brain size={25} />}</div>
            <p className="text-xs" style={{ color: isMastered ? 'var(--success)' : 'var(--primary)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.45rem' }}>{isMastered ? 'MASTERED' : isRevision ? `REVISION ${currentRevision}` : 'FIRST ATTEMPT'}</p>
            <h2 style={{ fontSize: '1.2rem' }}>{isMastered ? 'This problem has completed its revision lifecycle.' : isRevision ? `${reviewTiming(problem.nextRevisionDate)}${problem.nextRevisionDate ? ` · ${new Date(problem.nextRevisionDate).toLocaleDateString('en-US')}` : ''}` : 'Solve this problem from scratch.'}</h2>
            <p className="text-sm text-muted" style={{ maxWidth: '440px', margin: '0.6rem auto 1.25rem', lineHeight: 1.6 }}>{isMastered ? 'It remains available here and in the Mastered inventory.' : isRevision ? isRevisionDue ? 'Try to solve this problem again without looking at your previous solution.' : `Revision ${currentRevision} will become available on its scheduled date.` : 'Read the problem, derive the pattern, implement it, and explain the complexity.'}</p>
            {!isMastered && (!isRevision ? <button className="btn-primary" onClick={startAttempt}><Play size={16} /> Start First Attempt</button> : isRevisionDue ? <button className="btn-primary" onClick={startAttempt}><Play size={16} /> Attempt Revision {currentRevision}</button> : null)}
          </section>
        ) : (
          <>
            <section className="panel revision-timer">
              <div className="flex items-center gap-3"><Clock size={19} /><div><span className="text-xs" style={{ fontWeight: 800, letterSpacing: '0.09em' }}>RECALL TIME</span><p className="text-xs" style={{ opacity: 0.78, marginTop: '0.15rem' }}>Time spent reconstructing the solution</p></div></div>
              <div className="revision-clock">{formatTime(time)}</div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsTimerRunning((running) => !running)} className="timer-control">{isTimerRunning ? <Pause size={14} /> : <Play size={14} />}{isTimerRunning ? 'Pause' : 'Resume'}</button>
                <button type="button" onClick={() => { setTime(0); setIsTimerRunning(true); }} className="timer-reset" title="Reset timer"><RotateCcw size={15} /></button>
              </div>
            </section>

            <section className="panel revision-section">
              <label className="flex items-center gap-2" style={{ fontWeight: 700 }}><Brain size={17} style={{ color: 'var(--primary)' }} /> Recall First</label>
              <p className="text-sm text-muted" style={{ marginTop: '0.35rem' }}>Before writing code, try to reconstruct the solution from memory.</p>
              <div className="recall-prompts"><span>What pattern does this use?</span><span>What is the brute-force approach?</span><span>What is the optimized approach?</span><span>Which edge cases matter?</span></div>
              <textarea style={{ ...inputStyle, minHeight: '110px', marginTop: '1rem' }} value={thoughts} onChange={(event) => setThoughts(event.target.value)} placeholder="Talk through the idea before writing code..." />
            </section>

            <section className="panel revision-section">
              <div className="flex items-center justify-between gap-2"><div><label className="flex items-center gap-2" style={{ fontWeight: 700 }}><Code size={17} style={{ color: 'var(--success)' }} /> Your Approach</label><p className="text-sm text-muted" style={{ marginTop: '0.35rem' }}>Try to implement the solution from memory.</p></div><button type="button" onClick={() => setIsEditorExpanded((expanded) => !expanded)} className="text-sm" style={{ color: 'var(--primary)', fontWeight: 700 }}>{isEditorExpanded ? 'Collapse Editor' : 'Expand Editor'}</button></div>
              <textarea style={{ ...inputStyle, minHeight: isEditorExpanded ? '360px' : '145px', marginTop: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.6 }} value={code} onChange={(event) => setCode(event.target.value)} placeholder={'// Reconstruct the solution here\nfunction solve(input) {\n  \n}'} />
            </section>

            {showSolution && problem.solutionNotes && <section className="solution-review"><span>Saved Solution</span><p>{problem.solutionNotes}</p></section>}

            <section className="panel revision-section">
              <label className="flex items-center gap-2" style={{ fontWeight: 700 }}><Clock size={17} style={{ color: 'var(--warning)' }} /> Complexity</label>
              <div className="complexity-grid" style={{ marginTop: '1rem' }}>
                <div><label className="text-xs text-muted">Time Complexity</label><input style={{ ...inputStyle, marginTop: '0.35rem' }} value={timeComplexity} onChange={(event) => setTimeComplexity(event.target.value)} placeholder="O(...)" /></div>
                <div><label className="text-xs text-muted">Space Complexity</label><input style={{ ...inputStyle, marginTop: '0.35rem' }} value={spaceComplexity} onChange={(event) => setSpaceComplexity(event.target.value)} placeholder="O(...)" /></div>
              </div>
              <div style={{ marginTop: '0.9rem' }}><label className="text-xs text-muted">Why?</label><textarea style={{ ...inputStyle, minHeight: '74px', marginTop: '0.35rem' }} value={complexityReason} onChange={(event) => setComplexityReason(event.target.value)} placeholder="Explain why this complexity is correct..." /></div>
            </section>

            <section className="panel revision-section" style={{ borderColor: madeMistake ? 'var(--warning)' : 'var(--border)' }}>
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontWeight: 700 }}><input type="checkbox" checked={madeMistake} onChange={(event) => setMadeMistake(event.target.checked)} style={{ width: '16px', height: '16px' }} /><AlertCircle size={17} style={{ color: 'var(--warning)' }} /> Log a mistake</label>
              {madeMistake && <div style={{ marginTop: '1rem' }}><p className="text-sm" style={{ fontWeight: 600 }}>What went wrong?</p><div className="mistake-options">{mistakeOptions.map(([value, label]) => <label className="mistake-option" key={value}><input type="radio" name="mistake-category" value={value} checked={mistakeCategory === value} onChange={() => setMistakeCategory(value)} />{label}</label>)}</div><label className="text-xs text-muted" style={{ display: 'block', marginTop: '1rem' }}>What did you miss?</label><textarea style={{ ...inputStyle, minHeight: '84px', marginTop: '0.35rem' }} value={mistakeDescription} onChange={(event) => setMistakeDescription(event.target.value)} placeholder="Capture the misconception so future reviews can target it..." /></div>}
            </section>

            <section className="panel revision-section">
              <h3 style={{ fontSize: '1rem' }}>{isRevision ? 'How well did you recall this problem?' : 'How did this first attempt go?'}</h3>
              {isRevision ? (
                <div className="assessment-grid">{assessmentOptions.map((option) => <button type="button" key={option.value} onClick={() => setAssessment(option.value)} style={{ border: `1px solid ${assessment === option.value ? option.color : 'var(--border)'}`, background: assessment === option.value ? option.background : 'var(--bg-panel)', color: assessment === option.value ? option.color : 'var(--text-main)' }} className="assessment-option"><strong>{option.label}</strong><span>{option.detail}</span></button>)}</div>
              ) : (
                <div className="flex gap-3" style={{ marginTop: '1rem' }}><button type="button" onClick={() => setAttemptOutcome('SOLVED')} className="assessment-option" style={{ flex: 1, border: `1px solid ${attemptOutcome === 'SOLVED' ? 'var(--success)' : 'var(--border)'}`, background: attemptOutcome === 'SOLVED' ? 'var(--success-bg)' : 'var(--bg-panel)', color: attemptOutcome === 'SOLVED' ? 'var(--success)' : 'var(--text-main)' }}><strong>Solved</strong><span>I completed the problem.</span></button><button type="button" onClick={() => setAttemptOutcome('STRUGGLED')} className="assessment-option" style={{ flex: 1, border: `1px solid ${attemptOutcome === 'STRUGGLED' ? 'var(--warning)' : 'var(--border)'}`, background: attemptOutcome === 'STRUGGLED' ? 'var(--warning-bg)' : 'var(--bg-panel)', color: attemptOutcome === 'STRUGGLED' ? 'var(--warning)' : 'var(--text-main)' }}><strong>Struggled</strong><span>I need to revisit the approach.</span></button></div>
              )}
              <div className="flex gap-3" style={{ marginTop: '1.25rem' }}><button className="btn-primary" disabled={loading || (isRevision ? !assessment : !attemptOutcome)} onClick={submitSession} style={{ opacity: loading || (isRevision ? !assessment : !attemptOutcome) ? 0.6 : 1 }}>{loading ? 'Saving...' : isRevision ? 'Complete Revision' : 'Save Attempt'}</button><button type="button" onClick={() => { setIsAttempting(false); setIsTimerRunning(false); }} style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-muted)', fontWeight: 600 }}>Cancel</button></div>
            </section>
          </>
        )}
      </div>

      <aside className="revision-sidebar">
        <section className="panel" style={{ padding: '1.5rem' }}>
          <p className="text-xs text-muted" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>CURRENT REVISION</p>
          <h2 style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{isMastered ? 'Mastered' : hasFirstSolve ? `Revision ${currentRevision} of 4` : 'First Solve'}</h2>
          <div className="context-list">
            <div><span>Status</span><p style={{ color: isMastered ? 'var(--success)' : problem.status === 'DUE' ? 'var(--danger)' : 'var(--text-main)', fontWeight: 700 }}>{isMastered ? 'Mastered' : reviewTiming(problem.nextRevisionDate)}</p></div>
            <div><span>Last successful revision</span><p>{latestSuccessfulRevision ? new Date(latestSuccessfulRevision.completedDate).toLocaleDateString('en-US') : 'None yet'}</p></div>
            <div><span>Last attempt</span><p>{latestHistory ? `${new Date(latestHistory.date).toLocaleDateString('en-US')} · ${latestHistory.outcome}` : 'Not recorded'}</p></div>
            <div><span>Last approach</span><p>{latestRevision?.approach || latestAttempt?.approach || problem.pattern || problem.triggerNote || 'Not recorded'}</p></div>
            <div><span>Last mistake</span><p>{latestMistake?.description || 'No mistake recorded yet'}</p></div>
            <div><span>Next review</span><p>{latestRevision?.outcome === 'FORGOT' ? 'Pending successful recall' : problem.nextRevisionDate ? `${relativeDate(problem.nextRevisionDate)} · ${new Date(problem.nextRevisionDate).toLocaleDateString('en-US')}` : isMastered ? 'Lifecycle complete' : 'Not scheduled'}</p></div>
          </div>
          <div className="context-stats">
            <div><span>Attempts</span><strong>{historyItems.length}</strong></div>
            <div><span>Previous best</span><strong>{previousBest === null ? '—' : formatTime(previousBest)}</strong></div>
            {hasFirstSolve && typeof problem.ease === 'number' && (
              <div>
                <span>Recall pace</span>
                <strong>{problem.ease >= 1.1 ? 'Stretching out' : problem.ease <= 0.9 ? 'Tightening up' : 'Standard'} ({problem.ease.toFixed(2)}×)</strong>
              </div>
            )}
          </div>
          <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '1.25rem', paddingTop: '1.25rem' }}>
            <div className="flex items-center justify-between"><h3 className="text-sm">Attempt History</h3><span className="text-xs text-muted">{historyItems.length} total</span></div>
            {historyItems.length === 0 ? <p className="text-sm text-muted" style={{ marginTop: '0.75rem' }}>No attempts recorded yet.</p> : <div className="history-list">{historyItems.slice(0, 6).map((item) => { const expanded = expandedAttempt === item.id; return <div key={item.id} className="history-item"><button type="button" onClick={() => setExpandedAttempt(expanded ? null : item.id)}><span><strong>{item.title}</strong><small>{new Date(item.date).toLocaleDateString('en-US')}{item.time ? ` · ${formatTime(item.time)}` : ''}</small></span><span className={`badge ${item.successful ? 'success' : 'warning'}`}>{item.outcome} {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span></button>{expanded && <div className="history-detail">{item.thoughts && <p><strong>Recall:</strong> {item.thoughts}</p>}{item.code && <pre>{item.code}</pre>}</div>}</div>; })}</div>}
          </div>
        </section>
      </aside>
    </div>
  );
}
