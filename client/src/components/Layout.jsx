import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { initials } from '../api.js';

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const close = () => setOpen(false);

  return (
    <div className="shell">
      <header className="topbar">
        <button className="icon-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <span className="brand brand-sm">Rollcall</span>
      </header>

      {open && <div className="scrim" onClick={close} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">Rollcall</div>
        <nav className="nav" onClick={close}>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/students" end>All students</NavLink>
          <NavLink to="/students/new">Add student</NavLink>
        </nav>
        <div className="profile">
          <span className="avatar">{initials(user.name)}</span>
          <div className="profile-text">
            <strong>{user.name}</strong>
            <span className={`chip chip-${user.role}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
        </div>
      </aside>

      <main className="main" key={location.pathname}>
        <Outlet />
      </main>
    </div>
  );
}
