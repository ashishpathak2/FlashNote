import { useState } from 'react';
import { RiAddLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import api from '../../lib/api.js';

const TYPES = ['concept','definition','example','relationship','edge-case','formula'];

function Textarea({ label, value, onChange, rows = 3, placeholder, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        rows={rows} placeholder={placeholder}
        style={{
          width: '100%', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)', background: '#fff',
          padding: '10px 12px', fontSize: 13, color: 'var(--text)',
          outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.6,
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--black)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.06)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

export default function AddCardModal({ open, onClose, deckId, onSuccess }) {
  const [front, setFront]     = useState('');
  const [back, setBack]       = useState('');
  const [hint, setHint]       = useState('');
  const [type, setType]       = useState('concept');
  const [loading, setLoading] = useState(false);

  const reset = () => { setFront(''); setBack(''); setHint(''); setType('concept'); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!front.trim() || !back.trim()) return toast.error('Front and back are required');
    setLoading(true);
    try {
      const { data } = await api.post('/cards', { deckId, front: front.trim(), back: back.trim(), hint: hint.trim(), type });
      toast.success('Card added!');
      onSuccess(data);
      reset();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add card'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add card" width={500}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Textarea label="Front" value={front} onChange={setFront} placeholder="Question or prompt…" rows={3} required />
        <Textarea label="Back" value={back} onChange={setBack} placeholder="Answer or explanation…" rows={4} required />
        <Textarea label="Hint" value={hint} onChange={setHint} placeholder="Optional hint to help recall…" rows={2} />

        {/* Type selector */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
            Card type
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
                border: `1px solid ${type === t ? 'var(--black)' : 'var(--border)'}`,
                background: type === t ? 'var(--black)' : 'transparent',
                color: type === t ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s', textTransform: 'capitalize',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <Button variant="outline" onClick={handleClose} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}
            disabled={!front.trim() || !back.trim()} style={{ flex: 1 }}>
            <RiAddLine size={14} /> Add card
          </Button>
        </div>
      </div>
    </Modal>
  );
}
