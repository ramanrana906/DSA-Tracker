import { User, Palette, Repeat, Info } from 'lucide-react';
import ProfileForm from '@/components/ProfileForm';
import ThemeSettings from '@/components/ThemeSettings';

type CurrentUser = { id: number; name: string; email: string; createdAt: string };

async function getCurrentUser(): Promise<CurrentUser | null> {
  const res = await fetch('http://127.0.0.1:3001/user', { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div style={{ padding: '0 0 2rem 0', maxWidth: '680px' }}>
      <header className="main-header" style={{ padding: '0 0 1.5rem 0' }}>
        <div>
          <h1>Settings</h1>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Manage your profile and preferences.</p>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <section className="panel">
          <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
            <User size={17} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1rem' }}>Profile</h2>
          </div>
          {user ? (
            <ProfileForm initialName={user.name} email={user.email} />
          ) : (
            <p className="text-sm text-muted">Couldn&apos;t load your profile. Is the API running?</p>
          )}
        </section>

        <section className="panel">
          <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
            <Palette size={17} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1rem' }}>Appearance</h2>
          </div>
          <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>Choose how DSA Tracker looks on this device.</p>
          <ThemeSettings />
        </section>

        <section className="panel">
          <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
            <Repeat size={17} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1rem' }}>Spaced Repetition</h2>
          </div>
          <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
            The revision schedule adapts to how each recall goes, so exact dates will vary. Here&apos;s the baseline:
          </p>
          <div className="context-list">
            <div><span>First revision</span><p>1 day after you first solve a problem</p></div>
            <div><span>Revision 2</span><p>~4 days after a successful Revision 1</p></div>
            <div><span>Revision 3</span><p>~7 days after a successful Revision 2</p></div>
            <div><span>Revision 4 (final)</span><p>~30 days after a successful Revision 3, then mastered</p></div>
            <div><span>Pace adjustment</span><p>&quot;Easy&quot; recalls stretch future gaps; &quot;Mostly forgot&quot; or &quot;Couldn&apos;t solve&quot; compress them</p></div>
            <div><span>Needs attention</span><p>A problem is flagged once it has 3 failed recalls</p></div>
          </div>
        </section>

        <section className="panel">
          <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
            <Info size={17} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1rem' }}>About</h2>
          </div>
          <div className="context-list" style={{ marginTop: 0 }}>
            <div><span>Version</span><p>0.1 MVP</p></div>
            <div><span>Stack</span><p>Next.js + NestJS + Prisma (SQLite)</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
