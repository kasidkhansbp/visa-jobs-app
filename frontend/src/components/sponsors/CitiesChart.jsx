const BAR_COLORS = [
  '#2E3BE6', '#2F7A4F', '#B8621F', '#A8322C',
  '#6b5518', '#1a4434', '#6b2a25', '#8A8690',
  '#2E3BE6', '#2F7A4F', '#B8621F', '#A8322C',
  '#6b5518', '#1a4434', '#6b2a25', '#8A8690',
  '#2E3BE6', '#2F7A4F', '#B8621F', '#A8322C',
];

export default function CitiesChart({ cities }) {
  if (!cities || cities.length === 0) {
    return (
      <section className="sr-panel">
        <div className="sr-panel-head">Top cities by sponsor count</div>
        <div className="sr-empty">No data available</div>
      </section>
    );
  }

  const max = cities[0].count;

  return (
    <section className="sr-panel">
      <div className="sr-panel-head">Top cities by sponsor count</div>
      <div className="sr-bars">
        {cities.map((city, i) => (
          <div key={city.label} className="sr-bar-row">
            <div className="sr-bar-label">{city.label}</div>
            <div className="sr-bar-track">
              <div
                className="sr-bar-fill"
                style={{ width: `${(city.count / max) * 100}%`, background: BAR_COLORS[i] }}
              />
            </div>
            <div className="sr-bar-val">{city.count.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
