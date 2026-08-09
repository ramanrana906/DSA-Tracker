'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function NewProblem() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    topic: '',
    pattern: '',
    difficulty: 'Easy',
    sourceList: '',
    problemStatement: '',
    exampleInput: '',
    exampleOutput: '',
    constraints: '',
    solutionNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:3001/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Problem added to inventory!');
        router.push('/inventory');
        router.refresh();
      } else {
        toast.error('Failed to add problem');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Add New Problem</h1>
      
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Title</label>
          <input required style={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Two Sum" />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Link (Optional)</label>
          <input style={inputStyle} value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="LeetCode URL" />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Topic</label>
            <input required style={inputStyle} value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} placeholder="e.g. Array" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pattern (Optional)</label>
            <input style={inputStyle} value={formData.pattern} onChange={e => setFormData({...formData, pattern: e.target.value})} placeholder="e.g. Two Pointers" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Difficulty</label>
            <select style={inputStyle} value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Source List (Optional)</label>
            <input style={inputStyle} value={formData.sourceList} onChange={e => setFormData({...formData, sourceList: e.target.value})} placeholder="e.g. NeetCode 150" />
          </div>
        </div>

        <details style={{ marginTop: '0.25rem' }}>
          <summary className="text-sm" style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>Add revision content (optional)</summary>
          <p className="text-xs text-muted" style={{ margin: '0.6rem 0' }}>These details make the revision workspace self-contained while keeping solution notes hidden by default.</p>
          <textarea style={{ ...inputStyle, minHeight: '90px' }} value={formData.problemStatement} onChange={e => setFormData({...formData, problemStatement: e.target.value})} placeholder="Problem statement" />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <textarea style={{ ...inputStyle, minHeight: '72px' }} value={formData.exampleInput} onChange={e => setFormData({...formData, exampleInput: e.target.value})} placeholder="Example input" />
            <textarea style={{ ...inputStyle, minHeight: '72px' }} value={formData.exampleOutput} onChange={e => setFormData({...formData, exampleOutput: e.target.value})} placeholder="Example output" />
          </div>
          <textarea style={{ ...inputStyle, minHeight: '68px' }} value={formData.constraints} onChange={e => setFormData({...formData, constraints: e.target.value})} placeholder="Constraints" />
          <textarea style={{ ...inputStyle, minHeight: '72px' }} value={formData.solutionNotes} onChange={e => setFormData({...formData, solutionNotes: e.target.value})} placeholder="Solution notes (shown only after request)" />
        </details>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '1rem', 
            background: 'var(--accent-primary)', 
            color: 'white', 
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            marginTop: '1rem'
          }}
        >
          {loading ? 'Adding...' : 'Save Problem'}
        </button>
      </form>
    </div>
  );
}
