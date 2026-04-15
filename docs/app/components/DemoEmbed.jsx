'use client'

import { useState } from 'react'

export function DemoEmbed({ name, title, src, screenshot }) {
  const [view, setView] = useState('live')

  return (
    <div style={{
      margin: '24px 0',
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
      }}>
        <button
          onClick={() => setView('live')}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: view === 'live' ? 600 : 400,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: view === 'live' ? '#3b82f6' : '#64748b',
            borderBottom: view === 'live' ? '2px solid #3b82f6' : '2px solid transparent',
          }}
        >
          ▶ Live
        </button>
        <button
          onClick={() => setView('screenshot')}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: view === 'screenshot' ? 600 : 400,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: view === 'screenshot' ? '#3b82f6' : '#64748b',
            borderBottom: view === 'screenshot' ? '2px solid #3b82f6' : '2px solid transparent',
          }}
        >
          📷 Screenshot
        </button>
      </div>
      {view === 'live' ? (
        <iframe
          src={src}
          title={title}
          style={{
            width: '100%',
            height: 420,
            border: 'none',
            display: 'block',
          }}
        />
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#f1f5f9',
          padding: 10,
        }}>
          <img
            src={screenshot}
            alt={title}
            style={{ maxWidth: '100%', borderRadius: 6 }}
          />
        </div>
      )}
    </div>
  )
}
