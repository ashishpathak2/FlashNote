import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiUploadCloud2Line, RiSearchLine } from 'react-icons/ri';
import DeckCard from '../components/deck/DeckCard.jsx';
import UploadPDFModal from '../components/deck/UploadPDFModal.jsx';
import { DeckCardSkeleton } from '../components/ui/Skeleton.jsx';
import Button from '../components/ui/Button.jsx';
import api from '../lib/api.js';

export default function DashboardPage() {
  const [decks, setDecks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const { data } = await api.get('/decks');
      setDecks(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onCreated = d => { setDecks(p => [d, ...p]); fetchAll(); };
  const onDeleted = id => setDecks(p => p.filter(d => d._id !== id));

  const filtered = decks.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  const hasDecks = !loading && decks.length > 0;

  return (
    <div>
      {/* Empty state — big upload hero */}
      {!loading && decks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          style={{
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '64px 48px',
            textAlign: 'center',
            background: 'var(--bg-subtle)',
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-muted)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <RiUploadCloud2Line size={24} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
            Upload your first PDF
          </h2>
          <p style={{
            fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6,
            maxWidth: 360, margin: '0 auto 28px',
          }}>
            Drop in any PDF — lecture notes, a textbook chapter, your study guide — and AI will generate a smart deck of flashcards ready to study.
          </p>
          <Button variant="primary" size="lg" onClick={() => setShowUpload(true)}>
            <RiUploadCloud2Line size={16} /> Upload PDF
          </Button>
        </motion.div>
      )}

      {/* Toolbar — only when decks exist */}
      {hasDecks && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, gap: 12,
        }}>
          {/* Left: count label */}
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>
            {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
          </p>

          {/* Right: search + upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <RiSearchLine size={14} style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-subtle)', pointerEvents: 'none',
              }} />
              <input
                placeholder="Search decks…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  height: 36, width: 220, paddingLeft: 32, paddingRight: 12,
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                  background: '#fff', fontSize: 13, color: 'var(--text)', outline: 'none',
                  fontFamily: 'inherit', transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--black)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowUpload(true)}>
              <RiUploadCloud2Line size={14} /> Upload PDF
            </Button>
          </div>
        </div>
      )}

      {/* Deck grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => <DeckCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 && search ? (
        <p style={{ textAlign: 'center', padding: '56px 0', fontSize: 14, color: 'var(--text-muted)' }}>
          No decks match "{search}"
        </p>
      ) : hasDecks ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <AnimatePresence>
            {filtered.map(d => <DeckCard key={d._id} deck={d} onDelete={onDeleted} />)}
          </AnimatePresence>
        </div>
      ) : null}

      <UploadPDFModal open={showUpload} onClose={() => setShowUpload(false)} onSuccess={onCreated} />
    </div>
  );
}
