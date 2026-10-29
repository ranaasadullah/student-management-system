export default function Pagination({ page, pages, total, limit, onChange }) {
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Show a compact window of page numbers around the current page
  const nums = [];
  for (let i = Math.max(1, page - 1); i <= Math.min(pages, page + 1); i++) nums.push(i);
  if (nums[0] > 1) nums.unshift(1);
  if (nums[nums.length - 1] < pages) nums.push(pages);

  return (
    <div className="pagination">
      <span className="muted">Showing {from}–{to} of {total}</span>
      <div className="pages">
        <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        {nums.map((n, i) => (
          <span key={n} className="page-wrap">
            {i > 0 && n - nums[i - 1] > 1 && <span className="muted">…</span>}
            <button
              className={`page-num ${n === page ? 'active' : ''}`}
              aria-current={n === page ? 'page' : undefined}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          </span>
        ))}
        <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}
