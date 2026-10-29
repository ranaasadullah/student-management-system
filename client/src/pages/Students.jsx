import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, fmtDate, initials } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import Pagination from '../components/Pagination.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const LIMIT = 8;

export default function Students() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const course = params.get('course') || '';
  const page = parseInt(params.get('page')) || 1;

  const [q, setQ] = useState(search);
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reload, setReload] = useState(0);

  const update = (changes) => {
    const next = Object.fromEntries(params);
    Object.assign(next, changes);
    Object.keys(next).forEach((k) => (!next[k] || next[k] === 1) && delete next[k]);
    setParams(next);
  };

  // Debounce typing in the search box
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim() !== search) update({ search: q.trim(), page: 1 });
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    api('/students/courses').then((d) => setCourses(d.courses)).catch(() => {});
  }, [reload]);

  useEffect(() => {
    setData(null);
    setError('');
    const qs = new URLSearchParams({ page, limit: LIMIT, search, course });
    api(`/students?${qs}`).then(setData).catch((e) => setError(e.message));
  }, [search, course, page, reload]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api(`/students/${toDelete._id}`, { method: 'DELETE' });
      toast('Student deleted.');
      setToDelete(null);
      if (data.students.length === 1 && page > 1) update({ page: page - 1 });
      else setReload((n) => n + 1);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Students</h1>
          <p className="muted">{data ? `${data.total} ${data.total === 1 ? 'record' : 'records'}` : 'Loading records'}</p>
        </div>
        <Link to="/students/new" className="btn btn-primary">Add student</Link>
      </div>

      <div className="toolbar">
        <input className="grow" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, roll number, email or course" aria-label="Search students" />
        <select value={course} onChange={(e) => update({ course: e.target.value, page: 1 })} aria-label="Filter by course">
          <option value="">All courses</option>
          {courses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="panel table-panel">
        <table className="table">
          <thead>
            <tr><th>Student</th><th>Roll no.</th><th>Course</th><th>Year</th><th>Added</th><th aria-label="Actions" /></tr>
          </thead>
          <tbody>
            {!data && !error && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="skeleton-row">{Array.from({ length: 6 }).map((_, j) => <td key={j}><span className="skeleton" /></td>)}</tr>
            ))}
            {data?.students.map((s) => (
              <tr key={s._id}>
                <td data-label="Student">
                  <Link to={`/students/${s._id}`} className="student-cell">
                    <span className="avatar">{initials(s.fullName)}</span>
                    <span><strong>{s.fullName}</strong><span className="muted small block">{s.email}</span></span>
                  </Link>
                </td>
                <td data-label="Roll no.">{s.rollNumber}</td>
                <td data-label="Course">{s.course}</td>
                <td data-label="Year">{s.year}</td>
                <td data-label="Added">{fmtDate(s.createdAt)}</td>
                <td className="actions">
                  <Link to={`/students/${s._id}`} className="btn btn-ghost btn-sm">View</Link>
                  <Link to={`/students/${s._id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                  {isAdmin && <button className="btn btn-ghost btn-sm text-danger" onClick={() => setToDelete(s)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.students.length === 0 && (
          <div className="empty">
            <p>{search || course ? 'No students match your search. Try a different name or clear the filters.' : 'No students yet. Add your first record to get started.'}</p>
            {(search || course) ? (
              <button className="btn btn-ghost btn-sm" onClick={() => { setQ(''); setParams({}); }}>Clear filters</button>
            ) : (
              <Link to="/students/new" className="btn btn-primary btn-sm">Add student</Link>
            )}
          </div>
        )}
      </div>

      {data && <Pagination page={data.page} pages={data.pages} total={data.total} limit={LIMIT} onChange={(p) => update({ page: p })} />}

      {toDelete && (
        <ConfirmDialog
          title="Delete this student?"
          message={`${toDelete.fullName} (${toDelete.rollNumber}) will be permanently removed.`}
          confirmLabel="Delete student"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
