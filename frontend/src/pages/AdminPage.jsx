import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getAdminUsers } from '../services/cvApi';

const ADMIN_EMAIL = 'kasidkhan@gmail.com';

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      background: 'var(--paper)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div className="eyebrow" style={{ marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

export default function AdminPage() {
  useSEO({ title: 'Admin', description: 'Site stats' });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [userList, setUserList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user === undefined) return;
    if (user === null || user.email !== ADMIN_EMAIL) {
      navigate('/', { replace: true });
      return;
    }
    Promise.all([getAdminStats(), getAdminUsers()])
      .then(([s, u]) => { setStats(s); setUserList(u); })
      .catch(() => setError(true));
  }, [user, navigate]);

  if (user === undefined || !stats && !error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--danger)' }}>Failed to load stats.</p>
      </div>
    );
  }

  const { users, jobs, cvs } = stats;

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '64px var(--s-9) 96px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>ADMIN</div>
      <h1 style={{ margin: '0 0 48px' }}>Site stats</h1>

      <Section title="Users">
        <StatCard label="Total users" value={users.total} />
        <StatCard label="New this week" value={users.new_this_week} />
        <StatCard label="New this month" value={users.new_this_month} />
      </Section>

      <Section title="Jobs">
        <StatCard label="Total jobs" value={jobs.total} />
        <StatCard label="Added this week" value={jobs.added_this_week} />
        <StatCard label="Sponsor verified" value={jobs.sponsor_verified} />
        <StatCard label="Frequent sponsor" value={jobs.frequent_sponsor} />
        {Object.entries(jobs.by_source).map(([source, count]) => (
          <StatCard key={source} label={`Source — ${source}`} value={count} />
        ))}
      </Section>

      <Section title="CV Box">
        <StatCard label="CVs uploaded" value={cvs.total_cvs} />
        <StatCard label="Active share links" value={cvs.active_share_links} />
        <StatCard label="Total CV views" value={cvs.total_cv_views} />
      </Section>

      <div style={{ marginTop: 8 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Registered users</div>
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Name</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Email</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Joined</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-3)' }}>Last login</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--ink-3)' }}>Logins</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((u, i) => (
                <tr key={u.email} style={{ borderTop: i > 0 ? '1px solid var(--line)' : 'none', background: 'var(--paper)' }}>
                  <td style={{ padding: '10px 16px', color: 'var(--ink)' }}>{u.name}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-3)' }}>{u.email}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-4)' }}>{new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ink-4)' }}>{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--ink)' }}>{u.login_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
