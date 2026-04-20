import Chip from './Chip';

const LOGO_TONES = { reed: 'warm', adzuna: 'indigo' };

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = n => `£${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

function formatPosted(postedAt) {
  if (!postedAt) return null;
  const days = Math.floor((Date.now() - new Date(postedAt)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function JobRow({ job, active, onClick }) {
  const logo = job.employer_name?.[0]?.toUpperCase() ?? '?';
  const logoTone = LOGO_TONES[job.source] ?? 'indigo';
  const salary = formatSalary(job.salary_min, job.salary_max);
  const posted = formatPosted(job.posted_at);
  const stale = job.posted_at
    ? (Date.now() - new Date(job.posted_at)) > 30 * 86400000
    : false;

  return (
    <div className={`jobrow ${active ? 'active' : ''}`} onClick={onClick}>
      <div className={`logo ${logoTone}`}>{logo}</div>
      <div>
        <h3>{job.title}</h3>
        <div className="company">
          {job.employer_name}
          <span className="sep">·</span>
          {job.location}
          {job.contract_type && (
            <><span className="sep">·</span>{job.contract_type}</>
          )}
        </div>
        <div className="meta">
          <span className="mono">{job.source}</span>
          {posted && (
            <><span className="dot"/><span>Posted {posted}</span></>
          )}
          {stale && (
            <><span className="dot"/><Chip tone="warn"><span className="dot"/>Stale</Chip></>
          )}
        </div>
      </div>
      <div className="right">
        <Chip tone="verified">Sponsor-verified</Chip>
        {salary
          ? <span className="salary">{salary}</span>
          : <span className="salary na">Salary not listed</span>}
      </div>
    </div>
  );
}
