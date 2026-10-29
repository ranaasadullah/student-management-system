export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth">
      <section className="auth-art">
        <div className="brand">Rollcall</div>
        <h1>Every student record, kept in one tidy place.</h1>
        <p>Add, search and update student details, and see who joined recently at a glance.</p>
        <div className="art-tiles" aria-hidden="true">
          <span style={{ background: 'var(--butter)' }} />
          <span style={{ background: 'var(--blush)' }} />
          <span style={{ background: 'var(--lilac)' }} />
          <span style={{ background: 'var(--sage)' }} />
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}
