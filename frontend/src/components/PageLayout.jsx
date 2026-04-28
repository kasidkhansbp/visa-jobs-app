export default function PageLayout({ children }) {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 56px 96px' }}>
      {children}
    </div>
  );
}
