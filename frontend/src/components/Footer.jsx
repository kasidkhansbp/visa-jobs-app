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
            <li>Jobs</li>
            <li>Sources</li>
            <li>Saved searches</li>
            <li>API</li>
          </ul>
        </div>
        <div>
          <h5>Data</h5>
          <ul>
            <li>Sponsor register</li>
            <li>Adzuna</li>
            <li>Reed</li>
            <li>Companies House</li>
          </ul>
        </div>
        <div>
          <h5>About</h5>
          <ul>
            <li>How it works</li>
            <li>Coverage</li>
            <li>Contact</li>
            <li>Privacy</li>
          </ul>
        </div>
      </div>
      <div className="colophon">
        <span>© 2026 TPMGUILD · NOT AFFILIATED WITH ADZUNA, REED, OR UKGOV</span>
        <span>HELLO@TPMGUILD.COM</span>
      </div>
    </footer>
  );
}
