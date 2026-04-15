import React, { useState } from 'react';

export function DashboardDemo() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: 600,
      height: 400,
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif',
      padding: 20,
      gap: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
          Dashboard
        </h1>
        <span style={{ fontSize: 12, color: '#64748b' }}>Last updated: just now</span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
        {[
          { label: 'Revenue', value: '$12,450', color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Users', value: '1,247', color: '#10b981', bg: '#ecfdf5' },
          { label: 'Orders', value: '384', color: '#f59e0b', bg: '#fffbeb' },
        ].map((stat) => (
          <div key={stat.label} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: stat.bg,
            padding: 16,
            borderRadius: 10,
            gap: 4,
          }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 'bold' }}>{stat.label}</span>
            <span style={{ fontSize: 24, fontWeight: 'bold', color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 16,
        gap: 8,
      }}>
        <span style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>Weekly Activity</span>
        <div style={{ display: 'flex', flexDirection: 'row', flex: 1, gap: 8, alignItems: 'flex-end' }}>
          {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
            <div key={i} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 4,
            }}>
              <div style={{
                width: '100%',
                height: h * 1.5,
                backgroundColor: i === 3 ? '#3b82f6' : '#cbd5e1',
                borderRadius: 4,
              }} />
              <span style={{ fontSize: 10, color: '#94a3b8' }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
