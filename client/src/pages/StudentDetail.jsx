import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, fmtDate, initials } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import Spinner from '../components/Spinner.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function StudentDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/students/${id}`).then((d) => setStudent(d.student)).catch((e) => setError(e.message));
  }, [id]);

  const remove = async () => {
    setBusy(true);
    try {
      await api(`/students/${id}`, { method: 'DELETE' });
      toast('Student deleted.');
      navigate('/students');
    } catch (e) {
      toast(e.message, 'error');
      setBusy(false);
    }
  };

  if (error) return (
    <div className="empty"><p>{error}</p><Link to="/students" className="btn btn-ghost btn-sm">Back to students</Link></div>
  );
  if (!student) return <Spinner />;

  const rows = [
    ['Roll number', student.rollNumber],
    ['Email', student.email],
    ['Phone', student.phone || '—'],
    ['Course', student.course],
    ['Year', `Year ${student.year}`],
    ['Gender', student.gender],
    ['Date of birth', fmtDate(student.dateOfBirth)],
    ['Address', student.address || '—'],
    ['Registered', fmtDate(student.createdAt)],
    ['Last updated', fmtDate(student.updatedAt)],
  ];

  return (
    <>
      <Link to="/students" className="back">‹ All students</Link>
      <div className="panel detail">
        <div className="detail-head">
          <span className="avatar avatar-lg">{initials(student.fullName)}</span>
          <div className="grow">
            <h1>{student.fullName}</h1>
            <p className="muted">{student.course} · Year {student.year}</p>
          </div>
          <div className="detail-actions">
            <Link to={`/students/${id}/edit`} className="btn btn-primary">Edit</Link>
            {isAdmin && <button className="btn btn-danger-ghost" onClick={() => setConfirm(true)}>Delete</button>}
          </div>
        </div>
        <dl className="detail-grid">
          {rows.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>

      {confirm && (
        <ConfirmDialog
          title="Delete this student?"
          message={`${student.fullName} (${student.rollNumber}) will be permanently removed.`}
          confirmLabel="Delete student"
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirm(false)}
        />
      )}
    </>
  );
}
