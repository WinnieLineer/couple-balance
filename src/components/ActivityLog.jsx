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
          修改紀錄 <span style={styles.badge}>{activityLog.length}</span>
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
            const valueStr =
              entry.recordType === 'money'
                ? `${entry.recordValue} ${entry.recordCurrency || 'TWD'}`
                : `${entry.recordValue} 點`;

            return (
              <div key={entry.id || idx} style={styles.entry}>
                {/* Timeline dot */}
                <div style={{ ...styles.dot, backgroundColor: isAdd ? '#000' : '#888' }}>
                  {isAdd
                    ? <Plus size={10} strokeWidth={3} color="#fff" />
                    : <Trash2 size={10} strokeWidth={3} color="#fff" />}
                </div>

                {/* Vertical line (not on last item) */}
                {idx < sorted.length - 1 && <div style={styles.line} />}

                {/* Content */}
                <div style={styles.entryContent}>
                  <div style={styles.entryMain}>
                    <span style={styles.who}>{getPartnerName(entry.by)}</span>
                    <span style={{ ...styles.action, color: isAdd ? '#000' : '#888' }}>
                      {isAdd ? ' 新增了 ' : ' 刪除了 '}
                    </span>
                    <span style={styles.recordTitle}>「{entry.recordTitle}」</span>
                    <span style={styles.value}>
                      {entry.recordType === 'money' ? '💸' : '💝'} {valueStr}
                    </span>
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
    padding: '10px 14px',
    border: '2.5px solid #000',
    backgroundColor: '#FAFAFA',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    boxShadow: '3px 3px 0 #000',
  },
  badge: {
    display: 'inline-block',
    background: '#000',
    color: '#fff',
    borderRadius: '999px',
    padding: '0 7px',
    fontSize: '0.72rem',
    fontWeight: 900,
    marginLeft: '4px',
    lineHeight: '1.5',
  },
  logContainer: {
    border: '2.5px solid #000',
    borderTop: 'none',
    backgroundColor: '#fff',
    padding: '16px 16px 8px 16px',
    maxHeight: '400px',
    overflowY: 'auto',
    boxShadow: '3px 3px 0 #000',
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
    border: '2px solid #000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
    marginTop: '2px',
  },
  line: {
    position: 'absolute',
    left: '10px',
    top: '24px',
    bottom: '0',
    width: '2px',
    backgroundColor: '#DDD',
    zIndex: 0,
  },
  entryContent: {
    flex: 1,
    paddingTop: '2px',
  },
  entryMain: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#000',
    lineHeight: '1.5',
    flexWrap: 'wrap',
  },
  who: {
    fontWeight: 900,
    fontSize: '0.85rem',
  },
  action: {
    fontWeight: 700,
  },
  recordTitle: {
    fontWeight: 900,
    fontSize: '0.85rem',
  },
  value: {
    marginLeft: '4px',
    fontSize: '0.78rem',
    color: '#555',
    fontWeight: 700,
  },
  timestamp: {
    fontSize: '0.7rem',
    color: '#999',
    fontWeight: 700,
    marginTop: '3px',
    fontFamily: 'monospace',
  },
};
