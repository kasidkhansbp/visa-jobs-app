export default function FilterRail({ filters, onChange }) {
  function setSource(source) {
    if (source === 'reed') {
      onChange({ ...filters, source, job_type: '', contract_type: '' });
    } else {
      onChange({ ...filters, source });
    }
  }

  function setPostedDays(days) {
    onChange({ ...filters, posted_days: days });
  }

  function setJobType(job_type) {
    onChange({ ...filters, job_type });
  }

  function setContractType(contract_type) {
    onChange({ ...filters, contract_type });
  }

  return (
    <aside className="rail">
      <div className="group">
        <label className="opt">
          <input
            type="checkbox"
            checked={filters.sponsor_verified}
            onChange={e => onChange({ ...filters, sponsor_verified: e.target.checked })}
          />
          Sponsor-verified only
        </label>
        <label className="opt">
          <input
            type="checkbox"
            checked={filters.frequent_sponsor}
            onChange={e => onChange({ ...filters, frequent_sponsor: e.target.checked })}
          />
          Active sponsor only
        </label>
      </div>
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
      <div className="group" style={{ opacity: filters.source === 'reed' ? 0.4 : 1, pointerEvents: filters.source === 'reed' ? 'none' : 'auto' }}>
        <div className="heading">
          <span>Employment</span>
          <a onClick={() => setJobType('')}>clear</a>
        </div>
        <label className="opt">
          <input type="radio" name="job_type" checked={filters.job_type === ''} onChange={() => setJobType('')}/>
          All
        </label>
        <label className="opt">
          <input type="radio" name="job_type" checked={filters.job_type === 'full_time'} onChange={() => setJobType('full_time')}/>
          Full-time
        </label>
        <label className="opt">
          <input type="radio" name="job_type" checked={filters.job_type === 'part_time'} onChange={() => setJobType('part_time')}/>
          Part-time
        </label>
      </div>
      <div className="group" style={{ opacity: filters.source === 'reed' ? 0.4 : 1, pointerEvents: filters.source === 'reed' ? 'none' : 'auto' }}>
        <div className="heading">
          <span>Contract type</span>
          <a onClick={() => setContractType('')}>clear</a>
        </div>
        <label className="opt">
          <input type="radio" name="contract_type" checked={filters.contract_type === ''} onChange={() => setContractType('')}/>
          All
        </label>
        <label className="opt">
          <input type="radio" name="contract_type" checked={filters.contract_type === 'permanent'} onChange={() => setContractType('permanent')}/>
          Permanent
        </label>
        <label className="opt">
          <input type="radio" name="contract_type" checked={filters.contract_type === 'contract'} onChange={() => setContractType('contract')}/>
          Contract
        </label>
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
