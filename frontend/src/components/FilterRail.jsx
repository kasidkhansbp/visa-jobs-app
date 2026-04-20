export default function FilterRail({ filters, onChange }) {
  function setSource(source) {
    onChange({ ...filters, source });
  }

  function setPostedDays(days) {
    onChange({ ...filters, posted_days: days });
  }

  return (
    <aside className="rail">
      <div className="group">
        <div className="heading">
          <span>Source</span>
          <a onClick={() => setSource('')}>clear</a>
        </div>
        <label className="opt">
          <input
            type="radio"
            name="source"
            checked={filters.source === ''}
            onChange={() => setSource('')}
          />
          All sources
        </label>
        <label className="opt">
          <input
            type="radio"
            name="source"
            checked={filters.source === 'adzuna'}
            onChange={() => setSource('adzuna')}
          />
          Adzuna
        </label>
        <label className="opt">
          <input
            type="radio"
            name="source"
            checked={filters.source === 'reed'}
            onChange={() => setSource('reed')}
          />
          Reed
        </label>
      </div>
      <div className="group">
        <div className="heading">Employment</div>
        <label className="opt"><input type="checkbox" defaultChecked/> Full-time</label>
        <label className="opt"><input type="checkbox"/> Contract</label>
        <label className="opt"><input type="checkbox"/> Part-time</label>
      </div>
      <div className="group">
        <div className="heading">Work mode</div>
        <label className="opt"><input type="checkbox"/> Remote</label>
        <label className="opt"><input type="checkbox" defaultChecked/> Hybrid</label>
        <label className="opt"><input type="checkbox"/> Office</label>
      </div>
      <div className="group">
        <div className="heading">Salary (£)</div>
        <div className="range">
          <input defaultValue="80,000"/><span>to</span><input defaultValue="160,000"/>
        </div>
      </div>
      <div className="group">
        <div className="heading">Posted within</div>
        <label className="opt">
          <input
            type="radio"
            name="posted"
            checked={filters.posted_days === 1}
            onChange={() => setPostedDays(1)}
          />
          24 hours
        </label>
        <label className="opt">
          <input
            type="radio"
            name="posted"
            checked={filters.posted_days === 7}
            onChange={() => setPostedDays(7)}
          />
          7 days
        </label>
        <label className="opt">
          <input
            type="radio"
            name="posted"
            checked={filters.posted_days === 30}
            onChange={() => setPostedDays(30)}
          />
          30 days
        </label>
        <label className="opt">
          <input
            type="radio"
            name="posted"
            checked={!filters.posted_days}
            onChange={() => setPostedDays(null)}
          />
          Any time
        </label>
      </div>
    </aside>
  );
}
