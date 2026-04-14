import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RiRestartLine, RiArrowLeftLine, RiFireLine } from 'react-icons/ri';
import Button from '../ui/Button.jsx';

export default function SessionComplete({ stats, deckId, streak, onRestart }) {
  const navigate = useNavigate();
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  const msg = accuracy >= 90 ? '🎉 Outstanding!'
    : accuracy >= 70 ? '👏 Great work!'
    : accuracy >= 50 ? '💪 Keep it up!'
    : '🧠 Keep practicing!';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        maxWidth: 400, margin: '0 auto', textAlign: 'center',
      }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        style={{
          width: 68, height: 68, borderRadius: 'var(--radius-xl)', fontSize: 32,
          background: 'var(--bg-muted)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {msg.split(' ')[0]}
      </motion.div>

      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Session Complete</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{msg.split(' ').slice(1).join(' ')}</p>
      </div>

      {/* Stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%' }}>
        {[
          { label: 'Reviewed', value: stats.total },
          { label: 'Accuracy', value: `${accuracy}%` },
          { label: 'Mastered', value: stats.mastered },
        ].map(({ label, value }) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{
              border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              padding: '16px 12px', background: '#fff', boxShadow: 'var(--shadow-sm)',
            }}
          >
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {streak > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 99,
            background: 'var(--bg-muted)', border: '1px solid var(--border)',
            fontSize: 13, fontWeight: 500, color: 'var(--text)',
          }}
        >
          <RiFireLine size={14} style={{ color: '#f97316' }} /> {streak}-day streak!
        </motion.div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <Button variant="primary" onClick={onRestart} style={{ width: '100%', justifyContent: 'center' }}>
          <RiRestartLine size={14} /> Study again
        </Button>
        <Button variant="outline" onClick={() => navigate(`/deck/${deckId}`)} style={{ width: '100%', justifyContent: 'center' }}>
          <RiArrowLeftLine size={14} /> Back to deck
        </Button>
      </div>
    </motion.div>
  );
}
