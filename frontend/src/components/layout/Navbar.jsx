import { useNavigate } from 'react-router-dom';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { useAuthStore } from '../../store/authStore.js';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1000, margin: '0 auto',
        padding: '0 32px',
        height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>🧠</span>
          <span style={{
            fontSize: 15, fontWeight: 700, color: 'var(--text)',
            letterSpacing: '-0.03em',
          }}>
            FlashNote
          </span>
        </button>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Avatar circle */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--bg-muted)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'var(--text)',
            flexShrink: 0, userSelect: 'none',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>

          <span style={{
            fontSize: 13, color: 'var(--text-muted)',
            maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.name}
          </span>

          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 13, color: 'var(--text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '5px 8px', borderRadius: 'var(--radius-sm)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <RiLogoutBoxLine size={14} /> Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
