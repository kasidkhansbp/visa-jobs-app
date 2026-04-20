export default function Chip({ tone = 'source', children }) {
  return (
    <span className={`chip ${tone}`}>
      {tone === 'verified' && <span className="dot"/>}
      {children}
    </span>
  );
}
