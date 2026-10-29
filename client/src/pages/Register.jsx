import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import AuthShell from '../components/AuthShell.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (form.password.length < 6) errs.password = 'Use at least 6 characters.';
    if (form.confirm !== form.password) errs.confirm = 'Passwords don’t match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setErrors({ ...err.errors, form: err.message });
    } finally {
      setBusy(false);
    }
  };

  const field = (id, label, type = 'text', auto) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={form[id]} onChange={set(id)} className={errors[id] ? 'invalid' : ''} autoComplete={auto} />
      {errors[id] && <span className="error">{errors[id]}</span>}
    </div>
  );

  return (
    <AuthShell title="Create your account" subtitle="The first account created becomes the admin.">
      <form onSubmit={submit} noValidate>
        {errors.form && <div className="alert">{errors.form}</div>}
        {field('name', 'Full name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('password', 'Password', 'password', 'new-password')}
        {field('confirm', 'Confirm password', 'password', 'new-password')}
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy && <span className="spinner spinner-sm" />} Create account
        </button>
      </form>
      <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
    </AuthShell>
  );
}
