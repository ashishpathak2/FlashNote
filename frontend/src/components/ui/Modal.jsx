import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';

export default function Modal({ open, onClose, title, children, width = 500 }) {
  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative', zIndex: 1,
              width: '100%', maxWidth: width,
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px 16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{title}</h2>
              <button
                onClick={onClose}
                style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <RiCloseLine size={17} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px 24px' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
