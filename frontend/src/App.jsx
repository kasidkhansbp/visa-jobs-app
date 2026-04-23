import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import JobsPage from './pages/JobsPage';
import SponsorsPage from './pages/SponsorsPage';
import SourcesPage from './pages/SourcesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PrivacyPage from './pages/PrivacyPage';
import CoveragePage from './pages/CoveragePage';
import ContactPage from './pages/ContactPage';
import ResourcesPage from './pages/ResourcesPage';
import SourcesSection from './components/SourcesSection';

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppInner() {
  return (
    <div className="app">
      <Nav />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<JobsPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/coverage" element={<CoveragePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/saved" element={<SavedView />} />
        <Route path="/about" element={<AboutView />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
