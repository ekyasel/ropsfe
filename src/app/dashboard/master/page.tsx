import MasterDataTabs from './MasterDataTabs';

export default function MasterDataPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Master Data</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Kelola data master sistem</p>
        </div>
      </header>
      
      <MasterDataTabs />
    </>
  );
}
