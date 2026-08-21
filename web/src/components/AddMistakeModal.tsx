'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

type ProblemOption = { id: number; title: string };

const mistakeCategories = [
  ['MISREAD_CONSTRAINTS', 'Misread Constraints'],
  ['WRONG_PATTERN', 'Used Wrong Pattern'],
  ['EDGE_CASE', 'Missed an Edge Case'],
  ['IMPLEMENTATION_BUG', 'Implementation Bug'],
  ['TIME_MANAGEMENT', 'Took Too Long'],
  ['UNKNOWN_CONCEPT', "Didn't know the concept"],
];

export default function AddMistakeModal({ problems, onClose }: { problems: ProblemOption[]; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [problemId, setProblemId] = useState(problems[0]?.id ? String(problems[0].id) : '');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [lesson, setLesson] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemId || !category || !description.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:3001/mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: Number(problemId),
          category,
          description: description.trim(),
          lesson: lesson.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast.success('Mistake logged!');
        router.refresh();
        onClose();
      } else {
        toast.error('Failed to log mistake');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--bg-base)',
    color: 'var(--text-main)',
    marginBottom: '1rem',
  };

  return (
    <div className="modal-backdrop">
      <div className="panel modal-panel relative" style={{ maxWidth: '480px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          onClick={onClose}
          className="icon-btn"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ marginBottom: '2rem' }}>Add Mistake</h2>

        {problems.length === 0 ? (
          <p className="text-sm text-muted">Add a problem to your inventory first, then log mistakes against it.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Problem</label>
              <select required style={inputStyle} value={problemId} onChange={(e) => setProblemId(e.target.value)}>
                {problems.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Category</label>
              <select required style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select a category</option>
                {mistakeCategories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Description</label>
              <textarea required style={{ ...inputStyle, minHeight: '80px' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe what went wrong..." />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Lesson / Fix (Optional)</label>
              <textarea style={{ ...inputStyle, minHeight: '80px' }} value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="What will you do differently next time?" />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
              >
                {loading ? 'Saving...' : 'Save Mistake'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
