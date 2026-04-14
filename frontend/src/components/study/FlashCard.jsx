import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiLightbulbLine, RiRefreshLine } from 'react-icons/ri';

const TYPE_META = {
  concept:      { label: 'Concept',      bg: '#f5f3ff', color: '#6d28d9' },
  definition:   { label: 'Definition',   bg: '#eff6ff', color: '#1d4ed8' },
  example:      { label: 'Example',      bg: '#f0fdf4', color: '#15803d' },
  relationship: { label: 'Relationship', bg: '#fdf2f8', color: '#be185d' },
  'edge-case':  { label: 'Edge Case',    bg: '#fff7ed', color: '#c2410c' },
  formula:      { label: 'Formula',      bg: '#fefce8', color: '#a16207' },
};

const RATINGS = [
  { label: 'Again',  sub: "Didn't know",  quality: 0, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  { label: 'Hard',   sub: 'Took a while', quality: 1, color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
  { label: 'Good',   sub: 'Got it right', quality: 3, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  { label: 'Easy',   sub: 'Knew it well', quality: 5, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
];

export default function FlashCard({ card, cardIndex, totalCards, onAnswer, accentColor }) {
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [leaving, setLeaving]   = useState(false);

  useEffect(() => { setFlipped(false); setShowHint(false); setLeaving(false); }, [card._id]);

  const type   = TYPE_META[card.type] || TYPE_META.concept;
  const ghosts = Math.min(2, totalCards - cardIndex - 1);

  const handleRate = q => {
    setLeaving(true);
    setTimeout(() => onAnswer(q), 240);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>

      {/* Stack */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
        {/* Ghost 2 — furthest back */}
        {ghosts >= 2 && (
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)', height: '100%',
            background: '#f5f5f5', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', zIndex: 0,
          }} />
        )}
        {/* Ghost 1 */}
        {ghosts >= 1 && (
          <div style={{
            position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)',
            width: 'calc(100% - 20px)', height: '100%',
            background: '#fafafa', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', zIndex: 1,
          }} />
        )}

        {/* Active card */}
        <motion.div
          key={card._id}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={leaving ? { opacity: 0, y: -24, scale: 0.98 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: leaving ? 0.2 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <div className="flip-scene" style={{ height: 400 }}>
            <div className={`flip-card ${flipped ? 'is-flipped' : ''}`} onClick={() => !leaving && setFlipped(f => !f)}>

              {/* ── FRONT ── */}
              <div className="flip-face" style={{
                background: '#fff',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
                padding: '28px 28px 22px',
                justifyContent: 'space-between',
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                    textTransform: 'uppercase', color: type.color,
                    background: type.bg, padding: '3px 10px', borderRadius: 99,
                  }}>
                    {type.label}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                    {cardIndex + 1} / {totalCards}
                  </span>
                </div>

                {/* Question text */}
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '16px 0',
                }}>
                  <p style={{
                    fontSize: 18, fontWeight: 500, lineHeight: 1.55,
                    color: 'var(--text)', textAlign: 'center',
                  }}>
                    {card.front}
                  </p>
                </div>

                {/* Bottom row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  {card.hint ? (
                    <button
                      onClick={e => { e.stopPropagation(); setShowHint(h => !h); }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12,
                        color: showHint ? '#713f12' : 'var(--text-muted)',
                        background: showHint ? '#fef9c3' : 'var(--bg-muted)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                        padding: '4px 10px', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <RiLightbulbLine size={12} /> Hint
                    </button>
                  ) : <span />}
                  <span style={{
                    fontSize: 12, color: 'var(--text-subtle)',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>
                    <RiRefreshLine size={11} /> tap to reveal
                  </span>
                </div>

                {/* Hint reveal */}
                <AnimatePresence>
                  {showHint && card.hint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        marginTop: 14, padding: '10px 14px', overflow: 'hidden',
                        borderRadius: 'var(--radius-md)',
                        background: '#fef9c3', border: '1px solid #fef08a',
                        fontSize: 13, color: '#713f12', lineHeight: 1.5,
                      }}
                    >
                      💡 {card.hint}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom accent */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 3, background: 'var(--black)',
                  borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                }} />
              </div>

              {/* ── BACK ── */}
              <div className="flip-face flip-back" style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
                padding: '28px 28px 22px',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                    textTransform: 'uppercase', color: 'var(--text-subtle)',
                  }}>
                    Answer
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                    {cardIndex + 1} / {totalCards}
                  </span>
                </div>

                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '16px 0', overflowY: 'auto',
                }}>
                  <p style={{
                    fontSize: 15, lineHeight: 1.75, color: 'var(--text)',
                    textAlign: 'center',
                  }}>
                    {card.back}
                  </p>
                </div>

                {card.tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginBottom: 10 }}>
                    {card.tags.map(t => (
                      <span key={t} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 99,
                        background: 'var(--bg-muted)', border: '1px solid var(--border)',
                        color: 'var(--text-subtle)',
                      }}>{t}</span>
                    ))}
                  </div>
                )}

                <p style={{ fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center' }}>
                  How well did you know this?
                </p>

                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 3, background: 'var(--black)',
                  borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                }} />
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons */}
      <AnimatePresence>
        {flipped && !leaving && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            style={{ width: '100%', maxWidth: 440 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {RATINGS.map(({ label, sub, quality, color, bg, border }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleRate(quality)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '12px 8px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${border}`, background: bg, cursor: 'pointer', gap: 3,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-subtle)', textAlign: 'center', lineHeight: 1.3 }}>
                    {sub}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
