import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiArrowLeftLine, RiPlayCircleLine, RiAddLine,
  RiDeleteBinLine, RiSearchLine, RiArrowDownSLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button.jsx';
import AddCardModal from '../components/deck/AddCardModal.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import api from '../lib/api.js';

const STATE_STYLE = {
  new:      { label: 'New',      bg: '#f5f5f5', color: '#737373' },
  learning: { label: 'Learning', bg: '#fef9c3', color: '#713f12' },
  review:   { label: 'Review',   bg: '#dbeafe', color: '#1e3a8a' },
  mastered: { label: 'Mastered', bg: '#dcfce7', color: '#14532d' },
};

const TYPE_COLORS = {
  concept: '#6d28d9', definition: '#1d4ed8', example: '#15803d',
  relationship: '#be185d', 'edge-case': '#c2410c', formula: '#b45309',
};

export default function DeckPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [deck, setDeck]         = useState(null);
  const [cards, setCards]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [showAdd, setShowAdd]   = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchDeck = useCallback(async () => {
    try {
      const [dr, cr] = await Promise.all([api.get(`/decks/${id}`), api.get(`/cards/deck/${id}`)]);
      setDeck(dr.data); setCards(cr.data);
    } catch { toast.error('Could not load deck'); navigate('/'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchDeck(); }, [fetchDeck]);

  const handleCardAdded = card => {
    setCards(p => [...p, card]);
    setDeck(p => p ? { ...p, totalCards: p.totalCards + 1 } : p);
  };

  const handleDeleteCard = async cardId => {
    try {
      await api.delete(`/cards/${cardId}`);
      setCards(p => p.filter(c => c._id !== cardId));
      setDeck(p => p ? { ...p, totalCards: Math.max(0, p.totalCards - 1) } : p);
      toast.success('Card deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = cards.filter(c => {
    const matchSearch = c.front.toLowerCase().includes(search.toLowerCase()) || c.back.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.state === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-28 w-full" />
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
    </div>
  );

  if (!deck) return null;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24,
          fontSize: 13, color: 'var(--text-muted)', background: 'none',
          border: 'none', cursor: 'pointer', padding: '4px 0',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <RiArrowLeftLine size={15} /> Back to decks
      </button>

      {/* Deck header */}
      <div style={{
        background: '#fff', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px', marginBottom: 28,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 'var(--radius-lg)', flexShrink: 0,
              background: 'var(--bg-muted)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>
              {deck.emoji}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                {deck.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 12, color: 'var(--text-muted)',
                  background: 'var(--bg-muted)', border: '1px solid var(--border)',
                  padding: '2px 10px', borderRadius: 99,
                }}>
                  {deck.totalCards} cards
                </span>
                {deck.subject && deck.subject !== 'General' && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{deck.subject}</span>
                )}
              </div>
              {deck.description && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                  {deck.description}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="primary" size="md"
            onClick={() => navigate(`/study/${deck._id}`)}
            disabled={deck.totalCards === 0}
            style={{ flexShrink: 0 }}
          >
            <RiPlayCircleLine size={15} /> Start now
          </Button>
        </div>
      </div>

      {/* Cards section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            Cards
          </span>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['all','new','learning','review','mastered'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '3px 10px', borderRadius: 99, fontSize: 12,
                border: `1px solid ${filter === f ? 'var(--black)' : 'var(--border)'}`,
                background: filter === f ? 'var(--black)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <RiSearchLine size={13} style={{
              position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-subtle)', pointerEvents: 'none',
            }} />
            <input
              placeholder="Search cards…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                height: 32, width: 170, paddingLeft: 28, paddingRight: 10,
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                background: '#fff', fontSize: 12, color: 'var(--text)',
                outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--black)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
            <RiAddLine size={13} /> Add card
          </Button>
        </div>
      </div>

      {/* Card list */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '56px 0',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          color: 'var(--text-muted)', fontSize: 14,
        }}>
          {cards.length === 0 ? 'No cards yet — add your first card!' : 'No cards match your filter.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <AnimatePresence>
            {filtered.map(card => {
              const state = STATE_STYLE[card.state] || STATE_STYLE.new;
              const typeColor = TYPE_COLORS[card.type] || '#737373';
              const isOpen = expanded === card._id;

              return (
                <motion.div
                  key={card._id} layout
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    background: '#fff', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', overflow: 'hidden',
                  }}
                >
                  {/* Row */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : card._id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    {/* Type dot */}
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: typeColor, flexShrink: 0,
                    }} />

                    <p style={{
                      flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {card.front}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 99,
                        background: state.bg, color: state.color, fontWeight: 500,
                      }}>
                        {state.label}
                      </span>
                      <RiArrowDownSLine
                        size={15}
                        style={{
                          color: 'var(--text-subtle)',
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </div>
                  </button>

                  {/* Expanded answer */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          borderTop: '1px solid var(--border)',
                          padding: '14px 16px 14px 35px',
                          display: 'flex', gap: 12, alignItems: 'flex-start',
                          background: 'var(--bg-subtle)',
                        }}>
                          <div style={{ flex: 1 }}>
                            <p style={{
                              fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)',
                              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
                            }}>
                              Answer
                            </p>
                            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
                              {card.back}
                            </p>
                            {card.hint && (
                              <p style={{
                                fontSize: 12, color: '#713f12', marginTop: 10,
                                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                                background: '#fef9c3', border: '1px solid #fef08a',
                                display: 'inline-block',
                              }}>
                                💡 {card.hint}
                              </p>
                            )}
                            <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: 'var(--text-subtle)', flexWrap: 'wrap' }}>
                              <span style={{ color: typeColor, textTransform: 'capitalize' }}>● {card.type}</span>
                              {card.totalReviews > 0 && <span>{card.correctReviews}/{card.totalReviews} correct</span>}
                              {card.interval > 0 && <span>Next review in {card.interval}d</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCard(card._id)}
                            style={{
                              width: 30, height: 30, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--text-subtle)', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-subtle)'; }}
                          >
                            <RiDeleteBinLine size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AddCardModal open={showAdd} onClose={() => setShowAdd(false)} deckId={id} onSuccess={handleCardAdded} />
    </div>
  );
}
