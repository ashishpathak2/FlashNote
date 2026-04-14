import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const { register, loading }   = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    const res = await register(name, email, password);
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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-muted)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 22,
          }}>
            🧠
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Start learning smarter with Mnemo</p>
        </div>

        <div style={{
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '28px 28px 24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Full name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />

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
              Create account
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
