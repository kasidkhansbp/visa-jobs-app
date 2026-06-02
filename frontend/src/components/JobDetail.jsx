import { Icon } from './Icon';


function formatPosted(postedAt) {
  if (!postedAt) return null;
  const days = Math.floor((Date.now() - new Date(postedAt)) / 86400000);
  const date = new Date(postedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (days === 0) return `Today (${date})`;
  if (days === 1) return `1 day ago (${date})`;
  if (days < 7) return `${days} days ago (${date})`;
  if (days < 14) return `1 week ago (${date})`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} weeks ago (${date})`;
  return `${Math.floor(days / 30)} months ago (${date})`;
}

function formatSalary(min, max) {
  if (!min && !max) return 'Not listed';
  const fmt = n => `£${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

export default function JobDetail({ job }) {
  if (!job) return null;

  const logo = job.employer_name?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="detail">
      <div className="head">
        <div className="logo azure">{logo}</div>
        <div>
          <h2>{job.title}</h2>
          <div className="company">{job.employer_name} · {job.location}</div>
        </div>
      </div>
      {job.is_sponsor_verified && (
        <div className="sponsor-note">
          <Icon.check size={16}/>
          <div>
            <b>Sponsor-verified.</b> {job.employer_name} appears on the UK Home Office
            register of licensed Skilled Worker sponsors.
          </div>
        </div>
      )}
      <div className="meta-grid">
        <div>
          <div className="k">Salary</div>
          <div className="v mono">{formatSalary(job.salary_min, job.salary_max)}</div>
        </div>
        <div>
          <div className="k">Type</div>
          <div className="v">{job.contract_type || 'Full-time'}</div>
        </div>
        <div>
          <div className="k">Location</div>
          <div className="v">{job.location}</div>
        </div>
        <div>
          <div className="k">Source</div>
          <div className="v mono">{job.source}</div>
        </div>
        {formatPosted(job.posted_at) && (
          <div>
            <div className="k">Posted</div>
            <div className="v">{formatPosted(job.posted_at)}</div>
          </div>
        )}
      </div>
      {job.description && (
        <div
          className="description"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      )}
      <div className="actions">
        <button className="btn secondary"><Icon.bookmark size={14}/> Save</button>
        <a
          className="btn primary"
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open on {job.source} <Icon.external size={14}/>
        </a>
      </div>
    </div>
  );
}
