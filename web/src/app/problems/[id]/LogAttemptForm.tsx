'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Stopwatch from '@/components/Stopwatch';

type LegacyProblem = {
  id: number;
  stage: number;
  status: string;
  firstSolvedAt?: string | null;
  nextRevisionDate?: string | null;
  lastOutcome?: string | null;
  attempts?: unknown[];
};

type AttemptPayload = {
  outcome: string;
  timeTaken?: number;
  approach?: string;
  triggerNote?: string;
  mistake?: { category: string; description: string };
};

export default function LogAttemptForm({ problem }: { problem: LegacyProblem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  
  const [timeTaken, setTimeTaken] = useState('');
  const [approach, setApproach] = useState('');
  const [triggerNote, setTriggerNote] = useState('');

  // Mistake states
  const [madeMistake, setMadeMistake] = useState(false);
  const [mistakeCategory, setMistakeCategory] = useState('');
  const [mistakeDescription, setMistakeDescription] = useState('');

  const isRevision = Boolean(problem.firstSolvedAt) || problem.stage > 0 || ['DUE', 'IN_PROGRESS', 'MASTERED'].includes(problem.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome) return alert('Select an outcome');
    
    setLoading(true);
    try {
      const endpoint = isRevision 
        ? `http://127.0.0.1:3001/problems/${problem.id}/revisions`
        : `http://127.0.0.1:3001/problems/${problem.id}/attempts`;
        
      const payload: AttemptPayload = isRevision 
        ? { outcome } 
        : { outcome, timeTaken: timeTaken ? parseInt(timeTaken) : undefined, approach, triggerNote };

      if (madeMistake && mistakeCategory && mistakeDescription) {
        payload.mistake = {
          category: mistakeCategory,
          description: mistakeDescription
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        toast.success(isRevision ? 'Revision logged!' : 'Attempt saved!');
        router.refresh();
        setOutcome(null);
        setTimeTaken('');
        setApproach('');
        setTriggerNote('');
        setMadeMistake(false);
        setMistakeCategory('');
        setMistakeDescription('');
      } else {
        toast.error('Failed to log');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error logging');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* YOUR PROGRESS PANEL */}
      <div className="panel flex flex-col gap-4 text-sm">
        <h2 style={{ marginBottom: '0.5rem' }}>Your Progress</h2>
        
        <div className="flex justify-between items-center" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <span className="text-muted">Status</span>
          <span className="font-medium" style={{ color: problem.status === 'SOLVED' ? 'var(--success)' : problem.status === 'STRUGGLED' ? 'var(--warning)' : 'var(--text-muted)' }}>
            {problem.status || 'UNSOLVED'} {problem.status === 'SOLVED' && '✓'}
          </span>
        </div>
        
        <div className="flex justify-between items-center" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <span className="text-muted">Stage</span>
          <span className="font-medium">{problem.stage} of 5</span>
        </div>
        
        <div className="flex justify-between items-center" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <span className="text-muted">Next Revision</span>
          <span className="font-medium text-right">
            {problem.nextRevisionDate ? new Date(problem.nextRevisionDate).toLocaleDateString() : '—'}
          </span>
        </div>
        
        <div className="flex justify-between items-center" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <span className="text-muted">Last Outcome</span>
          <span className="font-medium">{problem.lastOutcome || '—'}</span>
        </div>

        <div className="flex justify-between items-center" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <span className="text-muted">Total Attempts</span>
          <span className="font-medium">{problem.attempts?.length || 0}</span>
        </div>
      </div>

      {/* LOG AN ATTEMPT PANEL */}
      <Stopwatch onTimeUpdate={(t) => setTimeTaken(t)} />
      
      <div className="panel flex flex-col gap-4">
        <h2 style={{ marginBottom: '0.5rem' }}>
          {isRevision ? 'Log Revision Outcome' : 'Log an Attempt'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div>
            <div className="flex gap-4">
              {isRevision ? (
                <>
                  <button
                    type="button"
                    onClick={() => setOutcome('RECALLED')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md border-2 font-medium text-sm transition-all ${outcome === 'RECALLED' ? 'bg-green-50' : 'bg-white'}`}
                    style={{
                      borderColor: outcome === 'RECALLED' ? 'var(--success)' : 'var(--border)',
                      color: outcome === 'RECALLED' ? 'var(--success)' : 'var(--text-main)',
                      background: outcome === 'RECALLED' ? 'var(--success-bg)' : 'transparent'
                    }}
                  >
                    Recalled <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome('FORGOT')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md border-2 font-medium text-sm transition-all ${outcome === 'FORGOT' ? 'bg-red-50' : 'bg-white'}`}
                    style={{
                      borderColor: outcome === 'FORGOT' ? 'var(--danger)' : 'var(--border)',
                      color: outcome === 'FORGOT' ? 'var(--danger)' : 'var(--text-main)',
                      background: outcome === 'FORGOT' ? 'var(--danger-bg)' : 'transparent'
                    }}
                  >
                    Forgot <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setOutcome('SOLVED')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md border-2 font-medium text-sm transition-all ${outcome === 'SOLVED' ? 'bg-green-50' : 'bg-white'}`}
                    style={{
                      borderColor: outcome === 'SOLVED' ? 'var(--success)' : 'var(--border)',
                      color: outcome === 'SOLVED' ? 'var(--success)' : 'var(--text-main)',
                      background: outcome === 'SOLVED' ? 'var(--success-bg)' : 'transparent'
                    }}
                  >
                    Solved <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome('STRUGGLED')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md border-2 font-medium text-sm transition-all ${outcome === 'STRUGGLED' ? 'bg-yellow-50' : 'bg-white'}`}
                    style={{
                      borderColor: outcome === 'STRUGGLED' ? 'var(--warning)' : 'var(--border)',
                      color: outcome === 'STRUGGLED' ? 'var(--warning)' : 'var(--text-main)',
                      background: outcome === 'STRUGGLED' ? 'var(--warning-bg)' : 'transparent'
                    }}
                  >
                    Struggled
                  </button>
                </>
              )}
            </div>
          </div>

          {!isRevision && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Time Taken</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={timeTaken}
                    onChange={(e) => setTimeTaken(e.target.value)}
                    placeholder="15"
                    style={{
                      width: '80px',
                      padding: '0.6rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-base)'
                    }}
                  />
                  <span className="text-sm text-muted">mins</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Approach Used (optional)</label>
                <select 
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)' }}
                >
                  <option value="">Select an approach</option>
                  <option value="Hash Map">Hash Map</option>
                  <option value="Two Pointers">Two Pointers</option>
                  <option value="Brute Force">Brute Force</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Trigger Note</label>
                <p className="text-xs text-muted mb-2">What signaled the pattern?</p>
                <textarea 
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-base)',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  value={triggerNote} 
                  onChange={e => setTriggerNote(e.target.value)} 
                  placeholder="e.g. Look for complement (target - x) using hash map..." 
                />
              </div>
            </>
          )}

          <div style={{ padding: '1rem', background: madeMistake ? 'var(--warning-bg)' : 'transparent', border: '1px solid', borderColor: madeMistake ? 'var(--warning)' : 'var(--border)', borderRadius: 'var(--radius-md)' }}>
            <label className="flex items-center gap-2 cursor-pointer font-medium mb-2">
              <input 
                type="checkbox" 
                checked={madeMistake} 
                onChange={(e) => setMadeMistake(e.target.checked)} 
                style={{ width: '16px', height: '16px' }}
              />
              <AlertCircle size={16} className="text-warning" /> Did you make a mistake?
            </label>
            
            {madeMistake && (
              <div className="flex flex-col gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Mistake Category</label>
                  <select 
                    required 
                    value={mistakeCategory} 
                    onChange={e => setMistakeCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)' }}
                  >
                    <option value="">Select a category</option>
                    <option value="MISREAD_CONSTRAINTS">Misread Constraints</option>
                    <option value="WRONG_PATTERN">Used Wrong Pattern</option>
                    <option value="EDGE_CASE">Missed an Edge Case</option>
                    <option value="IMPLEMENTATION_BUG">Implementation Bug</option>
                    <option value="TIME_MANAGEMENT">Took Too Long</option>
                    <option value="UNKNOWN_CONCEPT">Didn&apos;t know the concept</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <textarea 
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-base)',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    value={mistakeDescription} 
                    onChange={e => setMistakeDescription(e.target.value)} 
                    placeholder="Briefly describe what went wrong..." 
                  />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || !outcome}
            className="btn-primary"
            style={{ 
              width: '100%', 
              justifyContent: 'center',
              padding: '0.875rem',
              opacity: (!outcome || loading) ? 0.5 : 1,
              cursor: (!outcome || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Saving...' : 'Save Attempt'}
          </button>
        </form>
      </div>

    </div>
  );
}
