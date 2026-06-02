import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, ScrollText } from 'lucide-react';

export default function ActivityLog({ activityLog = [], p1Name = '伴侶一', p2Name = '伴侶二' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (activityLog.length === 0) return null;

  const formatTime = (isoStr) => {
    try {
      const d = new Date(isoStr);
      const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return `${date} ${time}`;
    } catch {
      return isoStr;
    }
  };

  const getPartnerName = (by) => (by === 'p1' ? p1Name : p2Name);

  // Most recent first
  const sorted = [...activityLog].reverse();

  return (
    <div style={styles.wrapper}>
      {/* Header toggle */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="comic-btn secondary"
        style={styles.header}
      >
        <ScrollText size={16} strokeWidth={2.5} />
        <span style={{ fontWeight: 900, fontSize: '0.92rem' }}>
          活動紀錄 <span style={styles.badge}>{activityLog.length}</span>
        </span>
        <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.75rem' }}>
          （僅記錄，不可刪除）
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Log entries */}
      {isExpanded && (
        <div style={styles.logContainer}>
          {sorted.map((entry, idx) => {
            const isAdd = entry.action === 'add';
            const isOpen = entry.action === 'open';
            const valueStr =
              entry.recordType === 'money'
                ? `${entry.recordValue} ${entry.recordCurrency || 'TWD'}`
                : `${entry.recordValue} 點`;

            return (
              <div key={entry.id || idx} style={styles.entry}>
                {/* Timeline dot */}
                <div style={{ ...styles.dot, backgroundColor: isAdd || isOpen ? '#000' : '#888' }}>
                  {isOpen ? (
                    <span style={{ fontSize: '10px' }}>👋</span>
                  ) : isAdd ? (
                    <Plus size={10} strokeWidth={3} color="#fff" />
                  ) : (
                    <Trash2 size={10} strokeWidth={3} color="#fff" />
                  )}
                </div>

                {/* Vertical line (not on last item) */}
                {idx < sorted.length - 1 && <div style={styles.line} />}

                {/* Content */}
                <div style={styles.entryContent}>
                  <div style={styles.entryMain}>
                    <span style={styles.who}>{getPartnerName(entry.by)}</span>
                    <span style={{ ...styles.action, color: isAdd || isOpen ? '#000' : '#888' }}>
                      {isOpen ? ' 登入了 ' : isAdd ? ' 新增了 ' : ' 刪除了 '}
                    </span>
                    {isOpen ? (
                      <span style={styles.recordTitle}>「HeartSync 天秤」</span>
                    ) : (
                      <>
                        <span style={styles.recordTitle}>「{entry.recordTitle}」</span>
                        <span style={styles.value}>
                          {entry.recordType === 'money' ? '💸' : '💝'} {valueStr}
                        </span>
                      </>
                    )}
                  </div>
                  <div style={styles.timestamp}>{formatTime(entry.timestamp)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: '28px',
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 18px',
    border: '3px solid #000',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    boxShadow: 'var(--shadow-flat)',
    borderRadius: '12px',
  },
  badge: {
    display: 'inline-block',
    background: '#000',
    color: '#fff',
    borderRadius: '999px',
    padding: '1px 8px',
    fontSize: '0.72rem',
    fontWeight: 900,
    marginLeft: '4px',
    lineHeight: '1.4',
  },
  logContainer: {
    border: '3px solid #000',
    marginTop: '12px',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    padding: '20px 20px 8px 20px',
    maxHeight: '400px',
    overflowY: 'auto',
    boxShadow: 'var(--shadow-flat)',
    position: 'relative',
  },
  entry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    position: 'relative',
    paddingBottom: '14px',
  },
  dot: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '2.5px solid #000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
    marginTop: '2px',
  },
  line: {
    position: 'absolute',
    left: '11px',
    top: '26px',
    bottom: '0',
    width: '0px',
    borderLeft: '2.5px dashed #000000',
    zIndex: 0,
  },
  entryContent: {
    flex: 1,
    paddingTop: '2px',
  },
  entryMain: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#000',
    lineHeight: '1.5',
    flexWrap: 'wrap',
  },
  who: {
    fontWeight: 900,
    fontSize: '0.88rem',
  },
  action: {
    fontWeight: 700,
  },
  recordTitle: {
    fontWeight: 900,
    fontSize: '0.88rem',
  },
  value: {
    marginLeft: '4px',
    fontSize: '0.8rem',
    color: '#555',
    fontWeight: 700,
  },
  timestamp: {
    fontSize: '0.72rem',
    color: '#888888',
    fontWeight: 700,
    marginTop: '3px',
    fontFamily: 'monospace',
  },
};
