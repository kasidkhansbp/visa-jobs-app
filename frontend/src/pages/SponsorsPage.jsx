import { useSponsorStats } from '../hooks/useSponsors';
import StatCards from '../components/sponsors/StatCards';
import CitiesChart from '../components/sponsors/CitiesChart';
import RoutesDonut from '../components/sponsors/RoutesDonut';
import SponsorTable from '../components/sponsors/SponsorTable';
import '../styles/sponsors.css';

export default function SponsorsPage() {
  const { data: stats, isLoading } = useSponsorStats();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 56px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Sponsor Register</div>
      <h1 style={{ margin: '0 0 12px' }}>Every licensed UK visa sponsor.</h1>
      <p style={{ fontSize: 16, color: 'var(--ink-3)', maxWidth: 640, marginBottom: 32 }}>
        The UK Home Office register of licensed Skilled Worker sponsors, refreshed monthly
        and searchable by name, city, route, and rating.
      </p>

      <StatCards stats={isLoading ? null : stats} />

      <div className="sr-charts">
        <CitiesChart cities={stats?.by_city ?? []} />
        <RoutesDonut routes={stats?.by_route ?? []} />
      </div>

      <SponsorTable />
    </div>
  );
}
