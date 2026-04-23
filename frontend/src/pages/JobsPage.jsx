import { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import Hero from '../components/Hero';
import FilterRail from '../components/FilterRail';
import JobRow from '../components/JobRow';
import JobDetail from '../components/JobDetail';
import ActiveFilters from '../components/ActiveFilters';
import SourcesSection from '../components/SourcesSection';

const DEFAULT_FILTERS = {
  title: 'Technical program manager',
  location: 'London',
  source: '',
  posted_days: 30,
  contract_type: '',
  job_type: '',
};

function buildApiFilters(filters) {
  const api = {
    title: filters.title || undefined,
    location: filters.location || undefined,
    source: filters.source || undefined,
    contract_type: filters.contract_type || undefined,
    job_type: filters.job_type || undefined,
  };
  if (filters.posted_days) {
    const d = new Date(Date.now() - filters.posted_days * 86400000);
    api.posted_from = d.toISOString().split('T')[0];
  }
  return api;
}

export default function JobsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeId, setActiveId] = useState(null);

  const { data: jobs = [], isLoading, isError } = useJobs(buildApiFilters(filters));
  const activeJob = jobs.find(j => j.id === activeId) ?? null;

  function handleSearch({ title, location, source }) {
    setFilters(f => ({ ...f, title, location, source }));
    setActiveId(null);
  }

  function handleFilterChange(next) {
    setFilters(next);
    setActiveId(null);
  }

  return (
    <>
      <Hero
        initialTitle={filters.title}
        initialLocation={filters.location}
        onSearch={handleSearch}
      />
      <main className="main" style={activeJob ? { gridTemplateColumns: '240px 1fr 400px' } : {}}>
        <FilterRail filters={filters} onChange={handleFilterChange}/>
        <div>
          <div className="results-head">
            <h2>London jobs</h2>
            <span className="sort">
              Sort by{' '}
              <select defaultValue="recent">
                <option value="recent">Most recent</option>
                <option>Salary high to low</option>
                <option>Best match</option>
              </select>
            </span>
          </div>
          {!isLoading && !isError && (
            <div className="count-line">
              <b>{jobs.length}</b> sponsor-verified results
            </div>
          )}
          <ActiveFilters filters={filters} onChange={handleFilterChange}/>
          <div className="joblist">
            {isLoading && <div className="loading-row">Loading jobs…</div>}
            {isError && (
              <div className="loading-row" style={{ color: 'var(--danger)' }}>
                Could not load jobs. Make sure the gateway is running on port 8000.
              </div>
            )}
            {!isLoading && !isError && jobs.length === 0 && (
              <div className="empty">
                <img src="/illustration-empty.svg" width="120" alt=""/>
                <h3>No results</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
            {jobs.map(j => (
              <JobRow
                key={j.id}
                job={j}
                active={activeId === j.id}
                onClick={() => setActiveId(activeId === j.id ? null : j.id)}
              />
            ))}
          </div>
        </div>
        {activeJob && <JobDetail job={activeJob}/>}
      </main>
      <SourcesSection/>
    </>
  );
}
