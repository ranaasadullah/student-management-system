import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, fmtDate, initials } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    api('/students/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/students?search=${encodeURIComponent(q.trim())}`);
  };

  const cards = stats && [
    { label: 'Total students', value: stats.total, tone: 'sage' },
    { label: 'Joined this week', value: stats.thisWeek, tone: 'butter' },
    { label: 'Courses', value: stats.courses, tone: 'lilac' },
    { label: 'Average per course', value: stats.average, tone: 'blush' },
  ];
  const max = stats ? Math.max(...stats.byCourse.map((c) => c.count), 1) : 1;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hello, {user.name.split(' ')[0]}</h1>
          <p className="muted">Here’s what’s happening with your students.</p>
        </div>
        <Link to="/students/new" className="btn btn-primary">Add student</Link>
      </div>

      <form className="searchbar" onSubmit={search} role="search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, roll number, email or course" aria-label="Search students" />
        <button className="btn btn-primary">Search</button>
      </form>

      {error && <div className="alert">{error}</div>}
      {!stats && !error && <Spinner />}

      {stats && (
        <>
          <div className="stat-grid">
            {cards.map((c) => (
              <div key={c.label} className="stat" style={{ background: `var(--${c.tone})` }}>
                <span className="stat-label">{c.label}</span>
                <span className="stat-value">{c.value}</span>
              </div>
            ))}
          </div>

          <div className="two-col">
            <section className="panel">
              <h3>Recent registrations</h3>
              {stats.recent.length === 0 ? (
                <div className="empty">
                  <p>No students yet.</p>
                  <Link to="/students/new" className="btn btn-primary btn-sm">Add the first student</Link>
                </div>
              ) : (
                <ul className="recent">
                  {stats.recent.map((s) => (
                    <li key={s._id}>
                      <Link to={`/students/${s._id}`}>
                        <span className="avatar">{initials(s.fullName)}</span>
                        <span className="recent-text">
                          <strong>{s.fullName}</strong>
                          <span className="muted">{s.course} · Year {s.year}</span>
                        </span>
                        <span className="muted small">{fmtDate(s.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel">
              <h3>Students by course</h3>
              {stats.byCourse.length === 0 ? (
                <p className="muted">Course numbers appear once you add students.</p>
              ) : (
                <div className="bars">
                  {stats.byCourse.map((c) => (
                    <div key={c.course} className="bar-row">
                      <span className="bar-name">{c.course}</span>
                      <span className="bar-track"><span className="bar-fill" style={{ width: `${(c.count / max) * 100}%` }} /></span>
                      <span className="bar-count">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
