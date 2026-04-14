import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiUploadCloud2Line, RiFilePdfLine, RiCloseLine,
  RiSparklingLine, RiRefreshLine, RiErrorWarningLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import api from '../../lib/api.js';

export default function UploadPDFModal({ open, onClose, onSuccess }) {
  const [file, setFile]       = useState(null);
  const [title, setTitle]     = useState('');
  const [desc, setDesc]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [step, setStep]       = useState('idle'); // idle | uploading | parsing | generating | done | failed

  const onDrop = useCallback(accepted => {
    if (accepted[0]) { setFile(accepted[0]); setError(''); setStep('idle'); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024,
    onDropRejected: rejected => {
      const err = rejected[0]?.errors?.[0];
      if (err?.code === 'file-too-large') setError('File is too large. Maximum size is 25 MB.');
      else setError('Only PDF files are accepted.');
    },
  });

  const reset = () => {
    setFile(null); setTitle(''); setDesc('');
    setError(''); setStep('idle');
  };
  const handleClose = () => { if (!loading) { reset(); onClose(); } };

  const handleSubmit = async () => {
    if (!file)         return setError('Please select a PDF file.');
    if (!title.trim()) return setError('Please enter a title for this deck.');

    setLoading(true);
    setError('');
    setStep('uploading');

    try {
      const fd = new FormData();
      fd.append('pdf', file);
      fd.append('title', title.trim());
      fd.append('description', desc.trim());

      setStep('generating');

      const { data } = await api.post('/decks/upload-pdf', fd, {
        timeout: 120000, // 2 min timeout on client side
        onUploadProgress: () => setStep('parsing'),
      });

      setStep('done');
      toast.success(`✨ Created ${data.cardCount} cards!`);
      onSuccess(data.deck);
      handleClose();

    } catch (e) {
      setStep('failed');
      const msg = e.response?.data?.message || e.message || 'Something went wrong. Please try again.';
      console.error('[UploadPDF] Error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = {
    uploading:  'Uploading PDF…',
    parsing:    'Reading PDF content…',
    generating: 'AI is generating cards… (this may take 30–60s)',
    done:       'Done!',
    failed:     'Failed',
    idle:       'Generate cards',
  };

  return (
    <Modal open={open} onClose={handleClose} title="Upload PDF" width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--black)' : file ? '#16a34a' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '28px 24px',
            background: isDragActive ? 'var(--bg-muted)' : file ? '#f0fdf4' : 'var(--bg-subtle)',
            cursor: loading ? 'default' : 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <input {...getInputProps()} disabled={loading} />

          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RiFilePdfLine size={20} style={{ color: '#16a34a' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{file.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!loading && (
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); setStep('idle'); setError(''); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: 'var(--text-muted)', background: 'none',
                    border: 'none', cursor: 'pointer', padding: '2px 0',
                  }}
                >
                  <RiCloseLine size={13} /> Remove
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: 'var(--bg-muted)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RiUploadCloud2Line size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                  {isDragActive ? 'Drop the PDF here' : 'Drag & drop your PDF here'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                  or{' '}
                  <span style={{ fontWeight: 500, color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                    click to browse
                  </span>
                  {' '}· Max 25 MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Inputs */}
        <Input
          label="Deck title"
          placeholder="e.g. Chapter 3 — Quadratic Equations"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={loading}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
            Description
            <span style={{ fontWeight: 400, color: 'var(--text-subtle)', marginLeft: 5 }}>(optional)</span>
          </label>
          <textarea
            placeholder="What does this deck cover?"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={2}
            disabled={loading}
            style={{
              width: '100%', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', background: loading ? 'var(--bg-muted)' : '#fff',
              padding: '10px 12px', fontSize: 13, color: 'var(--text)',
              outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { if (!loading) { e.target.style.borderColor = 'var(--black)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.06)'; }}}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Loading progress */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                overflow: 'hidden', padding: '12px 14px',
                background: 'var(--bg-muted)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid var(--border-strong)',
                borderTopColor: 'var(--black)',
                animation: 'spin 0.8s linear infinite', flexShrink: 0,
              }} />
              <p style={{ fontSize: 13, color: 'var(--text)' }}>{stepLabel[step]}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error with retry */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                padding: '12px 14px',
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: step === 'failed' ? 10 : 0 }}>
                <RiErrorWarningLine size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#dc2626', lineHeight: 1.5 }}>{error}</p>
              </div>
              {step === 'failed' && (
                <button
                  onClick={() => { setError(''); setStep('idle'); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 500, color: '#dc2626',
                    background: 'none', border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-sm)', padding: '4px 10px',
                    cursor: 'pointer', marginTop: 4,
                  }}
                >
                  <RiRefreshLine size={12} /> Try again
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>


        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" onClick={handleClose} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Please wait…' : 'Cancel'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || !file || !title.trim()}
            style={{ flex: 1 }}
          >
            {!loading && <RiSparklingLine size={14} />}
            {loading ? stepLabel[step] : 'Generate cards'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
