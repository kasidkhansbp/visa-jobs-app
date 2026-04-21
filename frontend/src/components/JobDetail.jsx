import { Icon } from './Icon';

const LOGO_TONES = { reed: 'warm', adzuna: 'indigo' };

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
  const logoTone = LOGO_TONES[job.source] ?? 'indigo';

  return (
    <div className="detail">
      <div className="head">
        <div className={`logo ${logoTone}`}>{logo}</div>
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
