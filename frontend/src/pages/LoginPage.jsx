import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useAuthStore } from '../store/authStore.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const { login, loading }      = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.ok) navigate('/');
    else setError(res.message);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-subtle)', padding: 16,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        style={{ width: '100%', maxWidth: 360 }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-muted)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 22,
          }}>
            🧠
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sign in to your FlashNote account</p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '28px 28px 24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Email" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" required
                  style={{
                    width: '100%', height: 38, borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)', background: '#fff',
                    padding: '0 38px 0 12px', fontSize: 14, color: 'var(--text)',
                    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--black)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.06)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-subtle)', display: 'flex', alignItems: 'center',
                }}>
                  {showPw ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p style={{
                padding: '9px 12px', borderRadius: 'var(--radius-md)',
                background: '#fef2f2', border: '1px solid #fecaca',
                fontSize: 13, color: '#dc2626',
              }}>
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', marginTop: 4 }}>
              Sign in
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
