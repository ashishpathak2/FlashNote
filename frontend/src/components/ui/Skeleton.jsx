import { cn } from '../../lib/utils.js';

export default function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

export function DeckCardSkeleton() {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
        <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 4, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 7 }} />
          <div className="skeleton" style={{ height: 11, width: '50%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 22, width: 72, borderRadius: 99, marginBottom: 14 }} />
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div className="skeleton" style={{ height: 11, width: 100 }} />
      </div>
    </div>
  );
}
