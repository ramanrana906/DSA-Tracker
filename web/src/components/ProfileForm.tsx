'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    background: 'var(--bg-base)',
    color: 'var(--text-main)',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === initialName) return;
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:3001/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        toast.success('Profile updated.');
        router.refresh();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '0.4rem' }}>Display name</label>
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>
      <div>
        <label className="text-xs text-muted" style={{ display: 'block', marginBottom: '0.4rem' }}>Email</label>
        <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={email} disabled />
      </div>
      <div>
        <button type="submit" className="btn-primary" disabled={loading || !name.trim() || name.trim() === initialName} style={{ opacity: loading || !name.trim() || name.trim() === initialName ? 0.6 : 1 }}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
