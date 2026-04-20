/**
 * JobsTableRow — renders a single job as a table row.
 *
 * Receives one job object and displays all its fields.
 * Completely independent — no API calls, no state, just display.
 */
export function JobsTableRow({ job }) {
  const salary =
    job.salary_min && job.salary_max
      ? `£${job.salary_min.toLocaleString()} – £${job.salary_max.toLocaleString()}`
      : "Not specified";

  const postedAt = job.posted_at
    ? new Date(job.posted_at).toLocaleDateString("en-GB")
    : "—";

  return (
    <tr>
      <td>{job.title}</td>
      <td>{job.employer_name}</td>
      <td>{job.location}</td>
      <td>{salary}</td>
      <td>{job.contract_type ?? "—"}</td>
      <td>{job.job_type ?? "—"}</td>
      <td>{postedAt}</td>
      <td>
        <span className={`badge badge--${job.source}`}>
          {job.source}
        </span>
      </td>
      <td>
        <a href={job.url} target="_blank" rel="noreferrer">
          Apply
        </a>
      </td>
    </tr>
  );
}
