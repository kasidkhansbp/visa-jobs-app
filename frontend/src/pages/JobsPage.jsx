import { useAuth } from '../context/AuthContext';
import { fetchHiddenJobs } from '../services/jobsApi';
const ADMIN_EMAIL = 'kasidkhan@gmail.com';
import { useState, useEffect } from 'react';
import { useJobs } from '../hooks/useJobs';
import useSEO from '../hooks/useSEO';
import Hero from '../components/Hero';
import FilterRail from '../components/FilterRail';
import JobRow from '../components/JobRow';
import JobDetail from '../components/JobDetail';
import ActiveFilters from '../components/ActiveFilters';
import SourcesSection from '../components/SourcesSection';

const PAGE_SIZE = 50;

const DEFAULT_FILTERS = {
  title: 'Technical program manager',
  location: 'London',
  source: '',
  posted_days: 30,
  contract_type: '',
  job_type: '',
  sponsor_verified: false,
  frequent_sponsor: false,
};

function buildApiFilters(filters) {
  const api = {
    title: filters.title || undefined,
    location: filters.location || undefined,
    source: filters.source || undefined,
    contract_type: filters.contract_type || undefined,
    job_type: filters.job_type || undefined,
    sponsor_verified: filters.sponsor_verified || undefined,
    frequent_sponsor: filters.frequent_sponsor || undefined,
  };
  if (filters.posted_days) {
    const d = new Date(Date.now() - filters.posted_days * 86400000);
    api.posted_from = d.toISOString().split('T')[0];
  }
  return api;
}

export default function JobsPage() {
  useSEO({ title: 'Sponsor-verified TPM jobs in the UK', description: 'Browse Technical Program Manager jobs from employers on the UK Home Office Skilled Worker sponsor register. Updated daily.' });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeId, setActiveId] = useState(null);
  const [offset, setOffset] = useState(0);
  const [allJobs, setAllJobs] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [showHidden, setShowHidden] = useState(false);
  const [hiddenJobs, setHiddenJobs] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const apiFilters = { ...buildApiFilters(filters), limit: PAGE_SIZE, offset };
  const { data: page = [], isLoading, isFetching, isError } = useJobs(apiFilters);

  useEffect(() => {
    if (page.length === 0 && offset === 0) {
      setAllJobs([]);
      return;
    }
    if (offset === 0) {
      setAllJobs(page);
    } else {
      setAllJobs(prev => [...prev, ...page]);
    }
  }, [page]);

  const hasMore = page.length === PAGE_SIZE;
  const activeJob = allJobs.find(j => j.id === activeId) ?? null;

  function handleSearch({ title, location, source }) {
    setFilters(f => ({ ...f, title, location, source }));
    setOffset(0);
    setActiveId(null);
  }

  function handleFilterChange(next) {
    setFilters(next);
    setOffset(0);
    setActiveId(null);
  }

  return (
    <>
      <Hero
        initialTitle={filters.title}
        initialLocation={filters.location}
        onSearch={handleSearch}
      />
      {/* Mobile filter overlay */}
      {showMobileFilters && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--paper)', zIndex: 20, display: 'flex', flexDirection: 'column' }}>
          {/* Fixed header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            <span style={{ fontWeight: 600, fontSize: 18 }}>Filters</span>
            <button onClick={() => setShowMobileFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--ink-3)', lineHeight: 1 }}>✕</button>
          </div>
          {/* Scrollable filter content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            <FilterRail filters={filters} onChange={(f) => { handleFilterChange(f); }} />
          </div>
          {/* Fixed footer button */}
          <div style={{ padding: '12px 20px 24px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
            <button onClick={() => setShowMobileFilters(false)} style={{ width: '100%', padding: '13px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Show results
            </button>
          </div>
        </div>
      )}

      <main className="main" style={activeJob ? { gridTemplateColumns: '240px 1fr 400px' } : {}}>
        <FilterRail filters={filters} onChange={handleFilterChange}/>
        <div>
          <div className="results-head">
            <h2>London jobs</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="mobile-filter-btn" onClick={() => setShowMobileFilters(true)}>
                Filters
              </button>
              {isAdmin && (
                <button
                  onClick={async () => {
                    const next = !showHidden;
                    setShowHidden(next);
                    if (next && hiddenJobs.length === 0) {
                      const jobs = await fetchHiddenJobs();
                      setHiddenJobs(jobs);
                    }
                  }}
                  style={{
                    fontSize: 12, padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${showHidden ? 'var(--danger)' : 'var(--line)'}`,
                    color: showHidden ? 'var(--danger)' : 'var(--ink-4)',
                    background: 'var(--paper)', cursor: 'pointer',
                  }}
                >
                  {showHidden ? 'Hide hidden' : 'Show hidden'}
                </button>
              )}
              <span className="sort">
                Sort by{' '}
                <select defaultValue="recent">
                  <option value="recent">Most recent</option>
                  <option>Salary high to low</option>
                  <option>Best match</option>
                </select>
              </span>
            </div>
          </div>
          {!isLoading && !isError && (
            <div className="count-line">
              <b>{allJobs.length}</b> sponsor-verified results
            </div>
          )}
          <ActiveFilters filters={filters} onChange={handleFilterChange}/>
          <div className="joblist">
            {isLoading && offset === 0 && <div className="loading-row">Loading jobs…</div>}
            {isError && (
              <div className="loading-row" style={{ color: 'var(--danger)' }}>
                Could not load jobs. Make sure the gateway is running on port 8000.
              </div>
            )}
            {!isLoading && !isError && allJobs.length === 0 && (
              <div className="empty">
                <img src="/illustration-empty.svg" width="120" alt=""/>
                <h3>No results</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
            {allJobs.map(j => (
              <JobRow
                key={j.id}
                job={j}
                active={activeId === j.id}
                onClick={() => setActiveId(activeId === j.id ? null : j.id)}
                filters={filters}
                onFilterChange={handleFilterChange}
                isAdmin={isAdmin}
                onHidden={id => setAllJobs(prev => prev.filter(job => job.id !== id))}
                onUnhidden={() => {}}
              />
            ))}
            {showHidden && hiddenJobs.length > 0 && (
              <div style={{ borderTop: '2px dashed var(--danger)', marginTop: 16, paddingTop: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Hidden jobs ({hiddenJobs.length})
                </div>
                {hiddenJobs.map(j => (
                  <JobRow
                    key={j.id}
                    job={{ ...j, is_hidden: true }}
                    active={false}
                    onClick={() => {}}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    isAdmin={isAdmin}
                    onHidden={() => {}}
                    onUnhidden={id => {
                      setHiddenJobs(prev => prev.filter(job => job.id !== id));
                      setAllJobs(prev => [...prev, { ...hiddenJobs.find(h => h.id === id), is_hidden: false }]);
                    }}
                  />
                ))}
              </div>
            )}
            {hasMore && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <button
                  className="btn"
                  onClick={() => setOffset(o => o + PAGE_SIZE)}
                  disabled={isFetching}
                >
                  {isFetching ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        </div>
        {activeJob && <JobDetail job={activeJob}/>}
      </main>
      <SourcesSection/>
    </>
  );
}
