import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import AboutPage from './pages/AboutPage';

function SavedView() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 56px' }}>
      <div className="eyebrow">SAVED</div>
      <h1 style={{ margin: '12px 0 16px' }}>Your saved roles.</h1>
      <p style={{ color: 'var(--ink-3)', marginTop: 32 }}>Sign in to save and track roles.</p>
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
        <Route path="/about" element={<AboutPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}
