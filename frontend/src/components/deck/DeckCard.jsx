import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { RiMoreLine, RiDeleteBinLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../../lib/api.js';

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DeckCard({ deck, onDelete }) {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const isProcessing = deck.status === 'processing';

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleDelete = async e => {
    e.stopPropagation();
    if (!confirm(`Delete "${deck.title}"?`)) return;
    try { await api.delete(`/decks/${deck._id}`); toast.success('Deck deleted'); onDelete(deck._id); }
    catch { toast.error('Failed to delete'); }
    setMenu(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
      transition={{ duration: 0.18 }}
      onClick={() => !isProcessing && navigate(`/deck/${deck._id}`)}
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: isProcessing ? 'default' : 'pointer',
        position: 'relative',
        transition: 'box-shadow 0.18s',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top row: emoji + title + menu */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{deck.emoji || '📚'}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, color: 'var(--text)',
            lineHeight: 1.4, marginBottom: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {deck.title}
          </h3>
          {deck.description && (
            <p style={{
              fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {deck.description}
            </p>
          )}
        </div>

        {/* 3-dot menu */}
        <div ref={menuRef} onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
          <button
            onClick={() => setMenu(!menu)}
            style={{
              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-subtle)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-subtle)'; }}
          >
            <RiMoreLine size={15} />
          </button>

          {menu && (
            <div style={{
              position: 'absolute', right: 16, top: 46, zIndex: 30,
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '4px',
              minWidth: 130, boxShadow: 'var(--shadow-lg)',
            }}>
              <button
                onClick={handleDelete}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 12px', borderRadius: 'var(--radius-sm)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#dc2626', transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <RiDeleteBinLine size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards count pill */}
      <div style={{ marginBottom: 14 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, color: 'var(--text-muted)',
          background: 'var(--bg-muted)', border: '1px solid var(--border)',
          padding: '3px 9px', borderRadius: 99,
        }}>
          {isProcessing ? (
            <>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-subtle)', animation: 'pulse 1s infinite' }} />
              Generating cards…
            </>
          ) : (
            <>{deck.totalCards} {deck.totalCards === 1 ? 'card' : 'cards'}</>
          )}
        </span>
      </div>

      {/* Footer: date */}
      <div style={{
        paddingTop: 12, borderTop: '1px solid var(--border)',
        fontSize: 11, color: 'var(--text-subtle)',
      }}>
        Created {fmtDate(deck.createdAt)}
      </div>
    </motion.div>
  );
}
