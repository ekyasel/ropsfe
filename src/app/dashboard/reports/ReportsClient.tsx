'use client';

import { useState } from 'react';
import MonthlyReportWidget from './MonthlyReportWidget';
import InsuranceReportWidget from './InsuranceReportWidget';
import PoliReportWidget from './PoliReportWidget';
import RekapitulasiWidget from './RekapitulasiWidget';

type Tab = 'summary' | 'rekapitulasi';

export default function ReportsClient() {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  return (
    <>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: '2px solid #e2e8f0',
        marginTop: '1.5rem',
      }}>
        <button
          onClick={() => setActiveTab('summary')}
          style={{
            padding: '0.625rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'summary' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'summary' ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-2px',
            transition: 'color 0.2s, border-color 0.2s',
          }}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('rekapitulasi')}
          style={{
            padding: '0.625rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'rekapitulasi' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'rekapitulasi' ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-2px',
            transition: 'color 0.2s, border-color 0.2s',
          }}
        >
          Rekapitulasi Bulanan
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '1.5rem' }}>
        {activeTab === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <MonthlyReportWidget />
            <InsuranceReportWidget />
            <PoliReportWidget />
          </div>
        )}

        {activeTab === 'rekapitulasi' && (
          <RekapitulasiWidget />
        )}
      </div>
    </>
  );
}
