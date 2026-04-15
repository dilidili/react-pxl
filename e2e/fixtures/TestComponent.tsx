import React from 'react';

/**
 * Shared test component rendered by BOTH react-dom and react-pxl.
 * Uses standard HTML elements + inline styles (no Tailwind here for
 * deterministic comparison — className parsing could add variance).
 *
 * Fixed 800x600 layout for screenshot comparison.
 */
export function TestComponent() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: 800,
      height: 600,
      backgroundColor: '#f1f5f9',
      padding: 24,
      gap: 16,
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1e293b',
        padding: 20,
        borderRadius: 12,
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
          react-pxl
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, marginTop: 4 }}>
          Visual fidelity test
        </p>
      </div>

      {/* Cards row */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 12,
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#3b82f6',
          padding: 16,
          borderRadius: 8,
        }}>
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff' }}>
            Card One
          </span>
          <span style={{ fontSize: 12, color: '#dbeafe', marginTop: 4 }}>
            Blue card
          </span>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#10b981',
          padding: 16,
          borderRadius: 8,
        }}>
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff' }}>
            Card Two
          </span>
          <span style={{ fontSize: 12, color: '#d1fae5', marginTop: 4 }}>
            Green card
          </span>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#8b5cf6',
          padding: 16,
          borderRadius: 8,
        }}>
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff' }}>
            Card Three
          </span>
          <span style={{ fontSize: 12, color: '#ede9fe', marginTop: 4 }}>
            Purple card
          </span>
        </div>
      </div>

      {/* Content box */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'solid',
        padding: 20,
        borderRadius: 8,
        gap: 8,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
          Content Area
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
          This is a paragraph of text that should render similarly in both DOM and canvas modes.
        </p>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
          The visual diff test compares pixel output between react-dom and react-pxl.
        </p>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 8,
      }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          E2E Visual Fidelity Test
        </span>
      </div>
    </div>
  );
}
