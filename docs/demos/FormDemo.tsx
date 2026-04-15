import React from 'react';

export function FormDemo() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: 600,
      height: 400,
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      padding: 32,
      gap: 20,
      justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
          Sign In
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
          Welcome back! Enter your credentials to continue.
        </p>
      </div>

      {/* Email field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#334155' }}>Email</span>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 8,
          padding: 12,
        }}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>you@example.com</span>
        </div>
      </div>

      {/* Password field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#334155' }}>Password</span>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 8,
          padding: 12,
        }}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>••••••••</span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button style={{
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 'bold',
          padding: 14,
          borderRadius: 8,
          borderWidth: 0,
          display: 'flex',
          justifyContent: 'center',
        }}>
          Sign In
        </button>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Don't have an account?{' '}
          </span>
          <a style={{ fontSize: 13, color: '#3b82f6', fontWeight: 'bold' }}>
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
