import { useState } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import JobsPage from './pages/JobsPage';
import SponsorsPage from './pages/SponsorsPage';
import SourcesSection from './components/SourcesSection';

function SourcesView() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 56px' }}>
      <div className="eyebrow">DATA SOURCES</div>
      <h1 style={{ margin: '12px 0 16px' }}>Where the jobs come from.</h1>
      <p style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 640, marginBottom: 40 }}>
        TPMguild aggregates from public jobs APIs and cross-references every result against
        the UK Home Office register. Here's the full pipeline.
      </p>
      <SourcesSection/>
    </div>
  );
}

function SavedView() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 56px' }}>
      <div className="eyebrow">SAVED</div>
      <h1 style={{ margin: '12px 0 16px' }}>Your saved roles.</h1>
      <p style={{ color: 'var(--ink-3)', marginTop: 32 }}>Sign in to save and track roles.</p>
    </div>
  );
}

function AboutView() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 56px' }}>
      <div className="eyebrow">ABOUT</div>
      <h1 style={{ margin: '12px 0 24px' }}>A guild, not a feed.</h1>
      <div style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ink-2)' }}>
        <p>
          TPMguild is a focused job board for Technical Program Managers searching UK roles.
          We aggregate listings from Adzuna and Reed, then cross-reference every result against
          the UK Home Office register of licensed Skilled Worker sponsors.
        </p>
        <p>
          The product has one job: if it shows you a role, that employer can sponsor your visa.
          No dead ends, no filtering your own way through 200 listings a week.
        </p>
        <p>
          We don't take recruiter money. We don't rank jobs. We don't use AI to rewrite
          descriptions. We do one thing: sponsor-verify every role, every day.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('jobs');

  return (
    <div className="app">
      <Nav view={view} setView={setView}/>
      {view === 'jobs'      && <JobsPage/>}
      {view === 'sponsors'  && <SponsorsPage/>}
      {view === 'sources'   && <SourcesView/>}
      {view === 'saved'   && <SavedView/>}
      {view === 'about'   && <AboutView/>}
      <Footer/>
    </div>
  );
}
