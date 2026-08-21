'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function AddConceptModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pattern: '',
    topic: '',
    coreIdea: '',
    template: '',
    variations: '',
    pitfalls: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:3001/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Concept note added!');
        router.refresh();
        onClose();
      } else {
        toast.error('Failed to add concept note');
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
      <div className="panel modal-panel relative" style={{ maxWidth: '600px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          onClick={onClose}
          className="icon-btn"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ marginBottom: '2rem' }}>New Concept Note</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pattern</label>
              <input required style={inputStyle} value={formData.pattern} onChange={(e) => setFormData({ ...formData, pattern: e.target.value })} placeholder="e.g. Two Pointers" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Topic</label>
              <input required style={inputStyle} value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} placeholder="e.g. Array" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Core Idea</label>
            <textarea required style={{ ...inputStyle, minHeight: '80px' }} value={formData.coreIdea} onChange={(e) => setFormData({ ...formData, coreIdea: e.target.value })} placeholder="What's the core idea behind this pattern?" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Template / Pseudocode (Optional)</label>
            <textarea style={{ ...inputStyle, minHeight: '100px', fontFamily: 'monospace', fontSize: '0.85rem' }} value={formData.template} onChange={(e) => setFormData({ ...formData, template: e.target.value })} placeholder="left = 0&#10;right = n - 1&#10;..." />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Common Variations (Optional, one per line)</label>
            <textarea style={{ ...inputStyle, minHeight: '80px' }} value={formData.variations} onChange={(e) => setFormData({ ...formData, variations: e.target.value })} placeholder="Pair sum problems&#10;Palindrome check" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Common Pitfalls (Optional, one per line)</label>
            <textarea style={{ ...inputStyle, minHeight: '80px' }} value={formData.pitfalls} onChange={(e) => setFormData({ ...formData, pitfalls: e.target.value })} placeholder="Moving wrong pointer&#10;Off-by-one errors" />
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
              {loading ? 'Adding...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
