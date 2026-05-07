import { useState } from 'react';
import { Icon } from './Icon';
import Globe from './Globe';

export default function Hero({ initialTitle = '', initialLocation = '', onSearch }) {
  const [title, setTitle] = useState(initialTitle || 'Technical program manager');
  const [location, setLocation] = useState(initialLocation || 'London');
  const [source, setSource] = useState('');

  function handleSearch() {
    onSearch({ title, location, source });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <section className="hero">
      <div className="eyebrow-row">
        <div className="divider"/>
        <div className="eyebrow">Updated daily · sponsor-verified roles</div>
      </div>
      <h1>Jobs that will sponsor<br /><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><em>your visa.</em><Globe size={52} /></span></h1>
      <p className="sub">
        Every listing cross-referenced against the UK Home Office register of licensed
        Skilled Worker sponsors. No dead ends.
      </p>
      <div className="searchbar">
        <label className="field">
          <Icon.search/>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search titles, companies, keywords"
          />
        </label>
        <label className="field">
          <Icon.pin/>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Location"
          />
        </label>
        <label className="field">
          <Icon.briefcase/>
          <select value={source} onChange={e => setSource(e.target.value)}>
            <option value="">All sources</option>
            <option value="adzuna">Adzuna</option>
            <option value="reed">Reed</option>
          </select>
          <Icon.chev/>
        </label>
        <button className="submit" onClick={handleSearch}>Search</button>
      </div>
      <div className="stats-strip">
        <div><b>81,204</b> licensed sponsors</div>
        <div>Cross-referenced daily</div>
      </div>
    </section>
  );
}
