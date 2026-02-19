"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  userName: string;
  userRole: string;
  logoutAction: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ userName, userRole, logoutAction, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { title: 'Beranda', href: '/dashboard', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
    { title: 'Jadwal Operasi', href: '/dashboard/schedule', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
    // { title: 'Notifikasi', href: '/dashboard/notifications', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> },
    { title: 'Laporan', href: '/dashboard/reports', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
    { title: 'Master Data', href: '/dashboard/master', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10h10V2z"></path><path d="M22 2h-10v10h10V2z"></path><path d="M12 12H2v10h10V12z"></path><path d="M22 12h-10v10h10V12z"></path></svg> },
    { 
      title: 'Manajemen Pengguna', 
      href: '/dashboard/users', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
      restricted: true 
    },
  ];

  const filteredMenuItems = userRole === 'SuperAdmin' 
    ? menuItems 
    : menuItems.filter(item => 
        item.href === '/dashboard' || item.href === '/dashboard/schedule'
      );

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '1.5rem 0.5rem' : '1.5rem 1.25rem' }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: 'var(--accent)', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14V10h-4V6h-4v4H7v4h4v4h4v-4h4z"/>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>SORA</span>
              <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>Smart Operating Room Access</span>
            </div>
          </div>
        )}
        <button 
          onClick={onToggle}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: '#64748b',
            display: 'flex',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background 0.2s'
          }}
          className="hover:bg-gray-100"
          title={isCollapsed ? "Tampilkan Sidebar" : "Sembunyikan Sidebar"}
        >
          {isCollapsed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
          )}
        </button>
      </div>

      <nav className="sidebar-nav" style={{ padding: isCollapsed ? '1.5rem 0.5rem' : '1.5rem 1rem' }}>
        {filteredMenuItems.map((item, index) => (
          <Link 
            key={index} 
            href={item.href} 
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
            title={isCollapsed ? item.title : ''}
          >
            {item.icon}
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ padding: isCollapsed ? '1rem 0.5rem' : '1.5rem' }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', overflow: 'hidden' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0
            }}>
              {userName[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{userName}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{userRole}</div>
            </div>
          </div>
        )}
        <form action={logoutAction}>
          <button type="submit" className="button-secondary" style={{ 
            width: '100%', 
            padding: isCollapsed ? '8px 4px' : '8px', 
            fontSize: '0.8rem', 
            color: '#dc2626', 
            borderColor: '#fee2e2', 
            backgroundColor: '#fff',
            display: 'flex',
            justifyContent: 'center'
          }}>
            {isCollapsed ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            ) : 'Sign Out'}
          </button>
        </form>
      </div>
    </aside>
  );
}
