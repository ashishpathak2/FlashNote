import { useState } from 'react';
import { RiAddLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import api from '../../lib/api.js';

const EMOJIS = ['📚','🧠','⚡','🎯','🔬','📐','🌍','💡','🧪','📖','🏛️','🎨','🔭','🧮','📊','🚀','💻','🌿'];

export default function CreateDeckModal({ open, onClose, onSuccess }) {
  const [title, setTitle]     = useState('');
  const [subject, setSubject] = useState('');
  const [desc, setDesc]       = useState('');
  const [emoji, setEmoji]     = useState('📚');
  const [loading, setLoading] = useState(false);

  const reset = () => { setTitle(''); setSubject(''); setDesc(''); setEmoji('📚'); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/decks', {
        title: title.trim(), description: desc.trim(),
        subject: subject.trim() || 'General', emoji,
      });
      toast.success('Deck created!');
      onSuccess(data);
      handleClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create deck'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={handleClose} title="New deck">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Emoji picker */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
            Icon
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${emoji === e ? 'var(--black)' : 'var(--border)'}`,
                background: emoji === e ? 'var(--bg-muted)' : '#fff',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <Input label="Title" placeholder="e.g. French Revolution" value={title} onChange={e => setTitle(e.target.value)} required />
        <Input label="Subject" placeholder="e.g. History" value={subject} onChange={e => setSubject(e.target.value)} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Description</label>
          <textarea
            placeholder="Optional description…"
            value={desc} onChange={e => setDesc(e.target.value)} rows={2}
            style={{
              width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
              background: '#fff', padding: '10px 12px', fontSize: 13, color: 'var(--text)',
              outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--black)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <Button variant="outline" onClick={handleClose} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={!title.trim()} style={{ flex: 1 }}>
            <RiAddLine size={14} /> Create deck
          </Button>
        </div>
      </div>
    </Modal>
  );
}
