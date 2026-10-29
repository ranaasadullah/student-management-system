export default function Spinner({ full = false, label = 'Loading' }) {
  return (
    <div className={full ? 'spinner-full' : 'spinner-inline'} role="status" aria-label={label}>
      <span className="spinner" />
    </div>
  );
}
