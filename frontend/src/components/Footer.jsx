export default function Footer({ setView }) {
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
            <li><a href="#" onClick={e => { e.preventDefault(); setView('jobs'); }}>Jobs</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('sources'); }}>Sources</a></li>
          </ul>
        </div>
        <div>
          <h5>Data</h5>
          <ul>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('sponsors'); }}>Sponsor register</a></li>
            <li><a href="https://www.adzuna.co.uk" target="_blank" rel="noopener noreferrer">Adzuna</a></li>
            <li><a href="https://www.reed.co.uk" target="_blank" rel="noopener noreferrer">Reed</a></li>
            <li><a href="https://find-and-update.company-information.service.gov.uk" target="_blank" rel="noopener noreferrer">Companies House</a></li>
          </ul>
        </div>
        <div>
          <h5>About</h5>
          <ul>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('how-it-works'); }}>How it works</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('coverage'); }}>Coverage</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('contact'); }}>Contact</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setView('privacy'); }}>Privacy</a></li>
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
