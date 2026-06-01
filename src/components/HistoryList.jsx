import React, { useState } from 'react';
import { Trash2, Calendar, User, DollarSign, Heart, Footprints } from 'lucide-react';

export default function HistoryList({ 
  records = [], 
  onDeleteRecord, 
  p1Name = '老公', 
  p2Name = '老婆' 
}) {
  const [activeTab, setActiveTab] = useState('money'); // 'money' or 'love'

  // Filter records based on tab
  const filteredRecords = records
    .filter(r => r.type === activeTab)
    // Newest first
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="comic-card" style={styles.container}>
      {/* Tab Selectors inside the history panel */}
      <div style={styles.header}>
        <h3 style={styles.title}>🐾 付出足跡歷史紀錄</h3>
        
        <div style={styles.tabContainer}>
          <button
            onClick={() => setActiveTab('money')}
            className={`tab-btn ${activeTab === 'money' ? 'active' : ''}`}
            style={styles.tab}
          >
            💰 金錢支出 ({records.filter(r => r.type === 'money').length})
          </button>
          <button
            onClick={() => setActiveTab('love')}
            className={`tab-btn ${activeTab === 'love' ? 'active' : ''}`}
            style={styles.tab}
          >
            💝 家事心意 ({records.filter(r => r.type === 'love').length})
          </button>
        </div>
      </div>

      {/* History Items list */}
      <div style={styles.listWrapper}>
        {filteredRecords.length === 0 ? (
          <div style={styles.emptyState}>
            <Footprints size={48} color="var(--text-muted)" style={{ marginBottom: '10px' }} className="animate-float" />
            <p style={styles.emptyText}>還沒有這類的付出足跡汪！</p>
            <p style={styles.emptySubtext}>快點擊下方的「新增生活記錄」來踏出第一步吧 🐾</p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isP1 = record.by === 'p1';
            const name = isP1 ? p1Name : p2Name;
            
            return (
              <div 
                key={record.id} 
                className="comic-card animate-pop" 
                style={{ 
                  ...styles.itemCard,
                  borderLeft: isP1 ? '8px solid var(--color-yellow)' : '8px solid var(--color-pink)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {/* Left side: Avatar & Info */}
                <div style={styles.itemLeft}>
                  {/* Miniature Dog badge */}
                  <div style={{ 
                    ...styles.dogBadge, 
                    backgroundColor: isP1 ? '#FFFFFF' : 'var(--color-brown)',
                    borderColor: 'var(--text-primary)'
                  }}>
                    🐶
                  </div>

                  <div style={styles.itemMeta}>
                    <div style={styles.itemTitle}>{record.title}</div>
                    <div style={styles.itemDetails}>
                      <span style={styles.userSpan}>
                        <User size={12} style={{ marginRight: '2px' }} />
                        {name}
                      </span>
                      <span style={styles.dateSpan}>
                        <Calendar size={12} style={{ marginRight: '2px' }} />
                        {formatDate(record.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Value & Delete */}
                <div style={styles.itemRight}>
                  <div style={{ 
                    ...styles.valueText, 
                    color: record.type === 'money' ? 'var(--text-primary)' : 'var(--text-primary)' 
                  }}>
                    {record.type === 'money' ? (
                      <span style={styles.moneyVal}>NT$ {record.value.toLocaleString()}</span>
                    ) : (
                      <span style={styles.loveVal}>+{record.value} 💖</span>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    className="comic-btn secondary"
                    style={styles.deleteBtn}
                    title="刪除此筆記錄"
                  >
                    <Trash2 size={14} color="#C0392B" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#FFFDF9',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '2.5px dashed var(--border-color)',
    paddingBottom: '16px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
  },
  tab: {
    fontSize: '0.85rem',
    padding: '6px 12px',
    borderRadius: '10px',
  },
  listWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontWeight: '700',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  emptySubtext: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  itemCard: {
    padding: '12px 16px',
    boxShadow: '2px 2px 0px #5D4A3E',
    border: '2.5px solid #5D4A3E',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.15s',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  dogBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    boxShadow: '1px 1px 0px var(--text-primary)',
  },
  itemMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemTitle: {
    fontWeight: '700',
    fontSize: '0.98rem',
    color: 'var(--text-primary)',
  },
  itemDetails: {
    display: 'flex',
    gap: '12px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  userSpan: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  dateSpan: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  valueText: {
    fontWeight: '700',
    fontSize: '1.05rem',
  },
  moneyVal: {
    color: 'var(--text-primary)',
  },
  loveVal: {
    color: 'var(--text-primary)',
  },
  deleteBtn: {
    padding: '6px',
    borderRadius: '8px',
    boxShadow: '1.5px 1.5px 0px #5D4A3E',
    backgroundColor: '#FFFFFF',
  }
};
