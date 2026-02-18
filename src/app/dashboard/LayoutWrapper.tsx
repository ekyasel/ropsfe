"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
  logoutAction: () => void;
}

export default function LayoutWrapper({ children, userName, userRole, logoutAction }: LayoutWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`dashboard-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        userName={userName} 
        userRole={userRole} 
        logoutAction={logoutAction} 
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
