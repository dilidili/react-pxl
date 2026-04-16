import React from 'react';

/**
 * Shared component rendered by BOTH react-dom and react-pxl.
 * Demonstrates that the same JSX works identically in both renderers.
 */
export function ProfileCard() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: 380,
      height: 460,
      backgroundColor: '#ffffff',
      borderRadius: 16,
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Cover gradient */}
      <div style={{
        height: 120,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundColor: '#667eea',
      }} />

      {/* Avatar + Info */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: -40,
        padding: 20,
        gap: 12,
      }}>
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' rx='40' fill='%234f46e5'/%3E%3Ctext x='40' y='50' text-anchor='middle' font-family='Arial' font-size='32' font-weight='bold' fill='white'%3EJ%3C/text%3E%3C/svg%3E"
          alt="avatar"
          style={{ width: 80, height: 80, borderRadius: 40 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>Jane Cooper</span>
          <span style={{ fontSize: 14, color: '#64748b' }}>Full-Stack Developer</span>
        </div>
        <p style={{
          fontSize: 13, color: '#94a3b8', textAlign: 'center',
          margin: 0, padding: 0, lineHeight: 1.5,
        }}>
          Building fast, beautiful interfaces with React and Canvas
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', flexDirection: 'row',
        padding: 16, gap: 8,
        borderTop: '1px solid #f1f5f9',
        borderTopWidth: 1, borderTopColor: '#f1f5f9',
      }}>
        {[
          { label: 'Projects', value: '42' },
          { label: 'Followers', value: '1.2k' },
          { label: 'Following', value: '128' },
        ].map((stat) => (
          <div key={stat.label} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2,
          }}>
            <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>{stat.value}</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Action button */}
      <div style={{ padding: 16, paddingTop: 4 }}>
        <button style={{
          width: '100%', display: 'flex', justifyContent: 'center',
          backgroundColor: '#4f46e5', color: '#ffffff',
          fontSize: 14, fontWeight: 'bold', padding: 12,
          borderRadius: 10, borderWidth: 0,
        }}>
          Follow
        </button>
      </div>
    </div>
  );
}
