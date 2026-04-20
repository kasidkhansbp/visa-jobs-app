import { JobsTableRow } from "./JobsTableRow";

/**
 * JobsTable — renders the full jobs table.
 *
 * Receives a list of jobs and renders one JobsTableRow per job.
 * Handles empty and loading states independently.
 */
export function JobsTable({ jobs, isLoading }) {
  if (isLoading) {
    return <p>Loading jobs...</p>;
  }

  if (!jobs || jobs.length === 0) {
    return <p>No jobs found.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Company</th>
          <th>Location</th>
          <th>Salary</th>
          <th>Contract</th>
          <th>Type</th>
          <th>Posted</th>
          <th>Source</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <JobsTableRow key={job.id} job={job} />
        ))}
      </tbody>
    </table>
  );
}
