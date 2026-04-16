'use client'

export function DemoEmbed({ title, src, screenshot }) {
  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      background: '#ffffff',
    }}>
      <iframe
        src={src}
        title={title}
        style={{
          width: 420,
          maxWidth: '100%',
          height: 520,
          border: 'none',
          display: 'block',
        }}
      />
      <div style={{
        padding: '8px 16px',
        fontSize: 12,
        fontWeight: 600,
        color: '#64748b',
        textAlign: 'center',
        borderTop: '1px solid #f1f5f9',
        background: '#fafafa',
      }}>
        {title}
      </div>
    </div>
  )
}
