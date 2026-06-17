import React from 'react';
import { createRoot } from 'react-dom/client';
import { ShieldCheck, Users, Flag, CreditCard, Activity, Search, Ban, CheckCircle2 } from 'lucide-react';
import { api } from './api/client';
import './styles/app.css';

type Dashboard = {
  users: number;
  openReports: number;
  activeSubscriptions: number;
  averageTrustScore: number;
};

const fallbackDashboard: Dashboard = {
  users: 0,
  openReports: 0,
  activeSubscriptions: 0,
  averageTrustScore: 0,
};

function App() {
  const [token, setToken] = React.useState(localStorage.getItem('soulsync_admin_token') ?? '');
  const [dashboard, setDashboard] = React.useState<Dashboard>(fallbackDashboard);
  const [queue, setQueue] = React.useState<any[]>([]);
  const [queueType, setQueueType] = React.useState('media');
  const [status, setStatus] = React.useState('Connect an admin token to load live data.');

  React.useEffect(() => {
    localStorage.setItem('soulsync_admin_token', token);
    if (!token) return;
    Promise.all([
      api<Dashboard>('/api/v1/admin/dashboard', token),
      api<any[]>(`/api/v1/admin/review-queue?type=${queueType}`, token),
    ])
      .then(([metrics, reviewQueue]) => {
        setDashboard(metrics);
        setQueue(reviewQueue);
        setStatus('Live admin data loaded.');
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : 'Admin API unavailable.'));
  }, [token, queueType]);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck size={24} />
          <span>SoulSync Admin</span>
        </div>
        <nav>
          <button className="navActive"><Activity size={18} /> Overview</button>
          <button><ShieldCheck size={18} /> Verification</button>
          <button><Flag size={18} /> Reports</button>
          <button><CreditCard size={18} /> Revenue</button>
          <button><Users size={18} /> Users</button>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>Trust Operations</h1>
            <p>{status}</p>
          </div>
          <label className="tokenInput">
            <Search size={16} />
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Admin JWT"
              type="password"
            />
          </label>
        </header>

        <section className="metrics">
          <Metric icon={<Users />} label="Users" value={dashboard.users} />
          <Metric icon={<Flag />} label="Open Reports" value={dashboard.openReports} />
          <Metric icon={<CreditCard />} label="Subscriptions" value={dashboard.activeSubscriptions} />
          <Metric icon={<ShieldCheck />} label="Avg Trust" value={Math.round(dashboard.averageTrustScore)} suffix="/100" />
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Review Queue</h2>
            <div className="segmented">
              <button className={queueType === 'media' ? 'selected' : ''} onClick={() => setQueueType('media')}>Media</button>
              <button className={queueType === 'verification' ? 'selected' : ''} onClick={() => setQueueType('verification')}>Verification</button>
            </div>
          </div>
          <div className="table">
            <div className="row head"><span>User</span><span>Status</span><span>Score</span><span>Action</span></div>
            {queue.length === 0 ? (
              <div className="empty">No pending records.</div>
            ) : queue.map((item) => (
              <div className="row" key={item.id ?? item.user_id}>
                <span>{item.username ?? item.user_id}</span>
                <span>{item.moderation_status ?? item.status}</span>
                <span>{item.trust_score ?? item.score ?? '-'}</span>
                <span className="actions"><button title="Approve"><CheckCircle2 size={16} /></button><button title="Ban"><Ban size={16} /></button></span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, suffix = '' }: { icon: React.ReactNode; label: string; value: number; suffix?: string }) {
  return (
    <article className="metric">
      <div className="metricIcon">{icon}</div>
      <span>{label}</span>
      <strong>{value}{suffix}</strong>
    </article>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

