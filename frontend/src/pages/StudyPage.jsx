import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowLeftLine, RiCloseLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import FlashCard from '../components/study/FlashCard.jsx';
import SessionComplete from '../components/study/SessionComplete.jsx';
import api from '../lib/api.js';

export default function StudyPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [deck, setDeck]         = useState(null);
  const [cards, setCards]       = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [done, setDone]         = useState(false);
  const [streak, setStreak]     = useState(0);
  const [stats, setStats]       = useState({ total: 0, correct: 0, mastered: 0 });

  const loadSession = useCallback(async () => {
    setLoading(true); setDone(false); setCurrentIdx(0); setStats({ total: 0, correct: 0, mastered: 0 });
    try {
      const [dr, sr] = await Promise.all([
        api.get(`/decks/${id}`),
        api.get(`/study/session/${id}?limit=200`),
      ]);
      setDeck(dr.data);
      setCards(sr.data.cards);
      if (sr.data.cards.length === 0) {
        toast('All caught up! No cards due right now. ✅');
        navigate(`/deck/${id}`);
      }
    } catch { toast.error('Could not load session'); navigate('/'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadSession(); }, [loadSession]);

  const handleAnswer = async quality => {
    const card = cards[currentIdx];
    try {
      const { data } = await api.post(`/study/review/${card._id}`, { quality });
      setStreak(data.streak);
      if (data.newlyMastered) toast('⭐ Card mastered!');
      const correct = quality >= 3;
      setStats(p => ({
        total: p.total + 1,
        correct: p.correct + (correct ? 1 : 0),
        mastered: p.mastered + (data.newlyMastered ? 1 : 0),
      }));
    } catch {}
    if (currentIdx + 1 >= cards.length) setDone(true);
    else setCurrentIdx(i => i + 1);
  };

  const progress = cards.length > 0 ? (currentIdx / cards.length) * 100 : 0;

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 14, background: '#fafafa',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-muted)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>🧠</div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading your session…</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-subtle)' }}>
      {/* Header */}
      <header style={{
        background: '#fff', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 52,
        display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <button
          onClick={() => navigate(`/deck/${id}`)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13,
            color: 'var(--text-muted)', background: 'none', border: 'none',
            cursor: 'pointer', flexShrink: 0, padding: 0, transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <RiArrowLeftLine size={14} />
          {deck?.title}
        </button>

        {!done && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              flex: 1, height: 3, borderRadius: 99,
              background: 'var(--bg-muted)', overflow: 'hidden',
            }}>
              <motion.div
                style={{ height: '100%', borderRadius: 99, background: 'var(--black)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
              {currentIdx}/{cards.length}
            </span>
          </div>
        )}

        <button
          onClick={() => navigate(`/deck/${id}`)}
          style={{
            width: 28, height: 28, borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', transition: 'all 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <RiCloseLine size={16} />
        </button>
      </header>

      {/* Main */}
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
              <SessionComplete stats={stats} deckId={id} streak={streak} onRestart={loadSession} />
            </motion.div>
          ) : cards[currentIdx] ? (
            <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FlashCard
                card={cards[currentIdx]}
                cardIndex={currentIdx}
                totalCards={cards.length}
                onAnswer={handleAnswer}
                accentColor="var(--black)"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {!done && (
        <footer style={{
          borderTop: '1px solid var(--border)', background: '#fff',
          padding: '10px 24px',
          display: 'flex', justifyContent: 'center', gap: 28,
          fontSize: 12, color: 'var(--text-subtle)',
        }}>
          <span style={{ color: '#15803d', fontWeight: 500 }}>✓ {stats.correct} correct</span>
          <span>{stats.total} reviewed</span>
          <span>{cards.length - currentIdx} remaining</span>
        </footer>
      )}
    </div>
  );
}
