import { useState } from 'react';
import { useSponsorStats } from '../hooks/useSponsors';
import useSEO from '../hooks/useSEO';
import StatCards from '../components/sponsors/StatCards';
import ActiveSponsors from '../components/sponsors/ActiveSponsors';
import CitiesChart from '../components/sponsors/CitiesChart';
import RoutesDonut from '../components/sponsors/RoutesDonut';
import SponsorTable from '../components/sponsors/SponsorTable';
import '../styles/sponsors.css';

export default function SponsorsPage() {
  useSEO({ title: 'UK Skilled Worker Sponsor Register', description: 'Browse the UK Home Office register of licensed Skilled Worker sponsors. Filter by city, route, and activity status.' });
  const { data: stats, isLoading } = useSponsorStats();
  const [minRoutes, setMinRoutes] = useState(null);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 56px' }}>
      <div className="eyebrow sr-anim-rise" style={{ marginBottom: 10, '--sr-d': '0ms' }}>Sponsor Register</div>
      <h1 className="sr-anim-rise" style={{ margin: '0 0 12px', '--sr-d': '80ms' }}>Every licensed UK visa sponsor.</h1>
      <p className="sr-anim-fade" style={{ fontSize: 16, color: 'var(--ink-3)', maxWidth: 640, marginBottom: 32, '--sr-d': '180ms' }}>
        The UK Home Office register of licensed Skilled Worker sponsors, refreshed monthly
        and searchable by name, city, route, and rating.
      </p>

      <StatCards stats={isLoading ? null : stats} />

      <div className="sr-anim-fade" style={{ '--sr-d': '500ms' }}>
        <ActiveSponsors
          active={stats?.active_sponsors}
          onFilter={value => setMinRoutes(value)}
        />
      </div>

      <div className="sr-charts sr-anim-fade" style={{ '--sr-d': '600ms' }}>
        <CitiesChart cities={stats?.by_city ?? []} />
        <RoutesDonut routes={stats?.by_route ?? []} />
      </div>

      <div className="sr-anim-fade" style={{ '--sr-d': '700ms' }}>
        <SponsorTable defaultMinRoutes={minRoutes} />
      </div>
    </div>
  );
}
