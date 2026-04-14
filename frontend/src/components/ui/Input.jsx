export default function Input({ label, error, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        style={{
          height: 38, width: '100%', borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? '#fca5a5' : 'var(--border)'}`,
          background: '#fff', padding: '0 12px', fontSize: 14,
          color: 'var(--text)', outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit',
          ...(props.style || {}),
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--black)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.06)'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#fca5a5' : 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      />
      {error && <p style={{ fontSize: 12, color: '#dc2626' }}>{error}</p>}
    </div>
  );
}
