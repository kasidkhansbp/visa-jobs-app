import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="inner">
        <div className="brand-col">
          <div className="wordmark">
            <img src="/logo-mark-ink.svg" width="28" height="28" alt=""/>
            TPMguild
          </div>
          <p>
            A focused job board for Technical Program Managers. Every listing
            cross-referenced against the UK Home Office sponsor register.
          </p>
        </div>
        <div>
          <h5>Product</h5>
          <ul>
            <li><Link to="/jobs">Jobs</Link></li>
            <li><Link to="/sources">Sources</Link></li>
            <li><Link to="/resources">Resources</Link></li>
          </ul>
        </div>
        <div>
          <h5>Data</h5>
          <ul>
            <li><Link to="/sponsors">Sponsor register</Link></li>
            <li><a href="https://www.adzuna.co.uk" target="_blank" rel="noopener noreferrer">Adzuna</a></li>
            <li><a href="https://www.reed.co.uk" target="_blank" rel="noopener noreferrer">Reed</a></li>
            <li><a href="https://find-and-update.company-information.service.gov.uk" target="_blank" rel="noopener noreferrer">Companies House</a></li>
          </ul>
        </div>
        <div>
          <h5>About</h5>
          <ul>
            <li><Link to="/how-it-works">How it works</Link></li>
            <li><Link to="/coverage">Coverage</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
            <li><Link to="/changelog">Changelog</Link></li>
          </ul>
        </div>
      </div>
      <div className="colophon">
        <span>© 2026 TPMGUILD · NOT AFFILIATED WITH ADZUNA, REED, OR UKGOV</span>
        <span>KASIDKHAN@TPMGUILD.COM</span>
      </div>
    </footer>
  );
}
