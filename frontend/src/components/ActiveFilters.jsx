import { Icon } from './Icon';

export default function ActiveFilters({ filters, onChange }) {
  const chips = [];

  if (filters.title)   chips.push({ key: 'title',   label: filters.title });
  if (filters.location) chips.push({ key: 'location', label: filters.location });
  if (filters.source)  chips.push({ key: 'source',  label: filters.source });
  if (filters.posted_days) chips.push({ key: 'posted_days', label: `Last ${filters.posted_days}d` });

  if (chips.length === 0) return null;

  function remove(key) {
    onChange({ ...filters, [key]: key === 'posted_days' ? null : '' });
  }

  function clearAll() {
    onChange({ title: '', location: '', source: '', posted_days: null });
  }

  return (
    <div className="active-filters">
      {chips.map(c => (
        <span key={c.key} className="chip-active">
          {c.label}
          <button onClick={() => remove(c.key)}><Icon.x/></button>
        </span>
      ))}
      <button className="btn ghost sm" style={{ padding: '4px 8px' }} onClick={clearAll}>
        Clear all
      </button>
    </div>
  );
}
