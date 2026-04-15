import React from 'react';

export function ImageDemo() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: 600,
      height: 400,
      backgroundColor: '#0f172a',
      fontFamily: 'Arial, sans-serif',
      padding: 24,
      gap: 16,
    }}>
      <h1 style={{ fontSize: 20, fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
        Team Members
      </h1>

      {/* Team grid */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flex: 1 }}>
        {[
          { name: 'Alice', role: 'Engineer', color: '#3b82f6' },
          { name: 'Bob', role: 'Designer', color: '#10b981' },
          { name: 'Carol', role: 'PM', color: '#f59e0b' },
          { name: 'Dave', role: 'DevOps', color: '#8b5cf6' },
        ].map((person) => (
          <div key={person.name} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#1e293b',
            borderRadius: 12,
            padding: 20,
            gap: 12,
          }}>
            <img
              src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='${encodeURIComponent(person.color)}'/%3E%3Ccircle cx='40' cy='32' r='14' fill='%23ffffff'/%3E%3Crect x='20' y='52' width='40' height='18' rx='6' fill='%23ffffff'/%3E%3C/svg%3E`}
              alt={person.name}
              style={{ width: 64, height: 64, borderRadius: 32 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 'bold', color: '#f1f5f9' }}>{person.name}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{person.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
