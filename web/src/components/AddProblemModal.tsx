'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function AddProblemModal({ onClose }: { onClose: () => void }) {
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
        router.refresh();
        onClose();
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="panel relative" style={{ maxWidth: '600px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>
        
        <h2 style={{ marginBottom: '2rem' }}>Add New Problem</h2>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Title</label>
            <input required style={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Two Sum" />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Link (Optional)</label>
            <input style={inputStyle} value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="LeetCode URL" />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Topic</label>
              <input required style={inputStyle} value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} placeholder="e.g. Array" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Pattern (Optional)</label>
              <input style={inputStyle} value={formData.pattern} onChange={e => setFormData({...formData, pattern: e.target.value})} placeholder="e.g. Two Pointers" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Difficulty</label>
              <select style={inputStyle} value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Source List (Optional)</label>
              <input style={inputStyle} value={formData.sourceList} onChange={e => setFormData({...formData, sourceList: e.target.value})} placeholder="e.g. NeetCode 150" />
            </div>
          </div>

          <details style={{ marginTop: '0.25rem' }}>
            <summary className="text-sm" style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>Add revision content (optional)</summary>
            <p className="text-xs text-muted" style={{ margin: '0.6rem 0' }}>Keep the statement and examples available during active recall. Solution notes stay hidden until explicitly requested.</p>
            <textarea style={{ ...inputStyle, minHeight: '90px' }} value={formData.problemStatement} onChange={e => setFormData({...formData, problemStatement: e.target.value})} placeholder="Problem statement" />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <textarea style={{ ...inputStyle, minHeight: '72px' }} value={formData.exampleInput} onChange={e => setFormData({...formData, exampleInput: e.target.value})} placeholder="Example input" />
              <textarea style={{ ...inputStyle, minHeight: '72px' }} value={formData.exampleOutput} onChange={e => setFormData({...formData, exampleOutput: e.target.value})} placeholder="Example output" />
            </div>
            <textarea style={{ ...inputStyle, minHeight: '68px' }} value={formData.constraints} onChange={e => setFormData({...formData, constraints: e.target.value})} placeholder="Constraints" />
            <textarea style={{ ...inputStyle, minHeight: '72px' }} value={formData.solutionNotes} onChange={e => setFormData({...formData, solutionNotes: e.target.value})} placeholder="Solution notes (revealed only after Show Solution)" />
          </details>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary"
              style={{ 
                flex: 1, 
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                fontWeight: 600,
                color: 'var(--text-main)'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
              }}
            >
              {loading ? 'Adding...' : 'Save Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
