import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../components/Toast.jsx';
import Spinner from '../components/Spinner.jsx';

const EMPTY = { fullName: '', rollNumber: '', email: '', phone: '', course: '', year: '1', gender: 'Female', dateOfBirth: '', address: '' };

function validate(f) {
  const e = {};
  if (f.fullName.trim().length < 2) e.fullName = 'Enter the student’s full name.';
  if (!f.rollNumber.trim()) e.rollNumber = 'Roll number is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address.';
  if (!f.course.trim()) e.course = 'Course is required.';
  if (f.phone && !/^[0-9+\-\s()]{7,18}$/.test(f.phone)) e.phone = 'Enter a valid phone number.';
  const y = Number(f.year);
  if (!Number.isInteger(y) || y < 1 || y > 6) e.year = 'Year must be between 1 and 6.';
  return e;
}

export default function StudentForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api(`/students/${id}`)
      .then(({ student: s }) =>
        setForm({ ...EMPTY, ...s, year: String(s.year), dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '' })
      )
      .catch((e) => setErrors({ form: e.message }))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const { student } = await api(editing ? `/students/${id}` : '/students', {
        method: editing ? 'PUT' : 'POST',
        body: form,
      });
      toast(editing ? 'Changes saved.' : 'Student added.');
      navigate(`/students/${student._id}`);
    } catch (err) {
      setErrors({ ...err.errors, form: err.message });
    } finally {
      setBusy(false);
    }
  };

  const text = (k, label, type = 'text', extra = {}) => (
    <div className="field">
      <label htmlFor={k}>{label}</label>
      <input id={k} type={type} value={form[k]} onChange={set(k)} className={errors[k] ? 'invalid' : ''} {...extra} />
      {errors[k] && <span className="error">{errors[k]}</span>}
    </div>
  );

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{editing ? 'Edit student' : 'Add student'}</h1>
          <p className="muted">{editing ? 'Update the details below.' : 'Fill in the student’s details.'}</p>
        </div>
      </div>

      <form className="panel form-panel" onSubmit={submit} noValidate>
        {errors.form && <div className="alert">{errors.form}</div>}
        <div className="form-grid">
          {text('fullName', 'Full name', 'text', { autoFocus: true })}
          {text('rollNumber', 'Roll number')}
          {text('email', 'Email', 'email')}
          {text('phone', 'Phone (optional)', 'tel')}
          {text('course', 'Course', 'text', { placeholder: 'e.g. Computer Science' })}
          <div className="field">
            <label htmlFor="year">Year</label>
            <select id="year" value={form.year} onChange={set('year')}>
              {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Year {y}</option>)}
            </select>
            {errors.year && <span className="error">{errors.year}</span>}
          </div>
          <div className="field">
            <label htmlFor="gender">Gender</label>
            <select id="gender" value={form.gender} onChange={set('gender')}>
              <option>Female</option><option>Male</option><option>Other</option>
            </select>
          </div>
          {text('dateOfBirth', 'Date of birth (optional)', 'date')}
        </div>
        <div className="field">
          <label htmlFor="address">Address (optional)</label>
          <textarea id="address" rows="3" value={form.address} onChange={set('address')} />
        </div>
        <div className="form-actions">
          <Link to={editing ? `/students/${id}` : '/students'} className="btn btn-ghost">Cancel</Link>
          <button className="btn btn-primary" disabled={busy}>
            {busy && <span className="spinner spinner-sm" />} {editing ? 'Save changes' : 'Add student'}
          </button>
        </div>
      </form>
    </>
  );
}
