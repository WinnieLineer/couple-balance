import React, { useState, useRef } from 'react';
import { Trash2, Calendar, User, Footprints, Search } from 'lucide-react';

const EXCHANGE_RATES = {
  TWD: 1.0,
  USD: 32.5,
  SGD: 24.0,
};

const convertValue = (val, from = 'TWD', to = 'TWD') => {
  const fromRate = EXCHANGE_RATES[from] || 1.0;
  const toRate = EXCHANGE_RATES[to] || 1.0;
  return (val * fromRate) / toRate;
};

export default function HistoryList({ 
  records = [], 
  onDeleteRecord, 
  p1Name = '伴侶一', 
  p2Name = '伴侶二',
  p1Role = 'white_dog',
  p2Role = 'brown_dog',
  displayCurrency = 'TWD'
}) {
  const [activeTab, setActiveTab] = useState('money'); // 'money' or 'love'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter records based on tab and search query
  const filteredRecords = records
    .filter(r => r.type === activeTab)
    .filter(r => searchQuery.trim() === '' || r.title.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const getCurrencySymbol = (code) => {
    if (code === 'TWD') return 'NT$';
    if (code === 'SGD') return 'S$';
    if (code === 'USD') return 'US$';
    return 'NT$';
  };

  return (
    <div className="comic-card" style={styles.container}>
      {/* Tab Selectors inside the history panel */}
      <div className="HistoryList-header" style={styles.header}>
        <h3 className="HistoryList-title" style={styles.title}>付出足跡歷史紀錄</h3>
        
        <div className="HistoryList-tabContainer" style={styles.tabContainer}>
          <button
            onClick={() => setActiveTab('money')}
            className={`tab-btn HistoryList-tab ${activeTab === 'money' ? 'active' : ''}`}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === 'money' ? 'var(--color-money-accent)' : '#FFFFFF',
              color: activeTab === 'money' ? '#FFFFFF' : 'var(--text-muted)',
              borderColor: 'var(--border-color)',
              boxShadow: activeTab === 'money' ? 'var(--shadow-xs)' : 'none',
              transform: activeTab === 'money' ? 'translate(-1px, -1px)' : 'none',
            }}
          >
            金錢支出 ({records.filter(r => r.type === 'money').length})
          </button>
          <button
            onClick={() => setActiveTab('love')}
            className={`tab-btn HistoryList-tab ${activeTab === 'love' ? 'active' : ''}`}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === 'love' ? 'var(--color-love-accent)' : '#FFFFFF',
              color: activeTab === 'love' ? '#FFFFFF' : 'var(--text-muted)',
              borderColor: 'var(--border-color)',
              boxShadow: activeTab === 'love' ? 'var(--shadow-xs)' : 'none',
              transform: activeTab === 'love' ? 'translate(-1px, -1px)' : 'none',
            }}
          >
            家事心意 ({records.filter(r => r.type === 'love').length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        ...styles.searchContainer,
        borderColor: 'var(--border-color)',
        boxShadow: isSearchFocused ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
        transform: isSearchFocused ? 'translate(-1.5px, -1.5px)' : 'translate(0, 0)',
      }}>
        <Search
          size={16}
          style={{
            ...styles.searchIcon,
            color: isSearchFocused ? 'var(--text-primary)' : 'var(--text-subtle)',
          }}
        />
        <input
          type="text"
          placeholder="🔍 搜尋付出項目名稱..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={styles.searchInput}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={styles.searchClearBtn}
            title="清除搜尋"
          >
            ✕
          </button>
        )}
      </div>

      {/* History Items list */}
      <div style={styles.listWrapper}>
        {filteredRecords.length === 0 ? (
          <div style={styles.emptyState}>
            <Footprints size={40} color="var(--text-subtle)" style={{ marginBottom: '12px' }} />
            <p style={styles.emptyText}>暫無付出歷史足跡</p>
            <p style={styles.emptySubtext}>點擊下方的「新增生活記錄」來留下點滴紀錄吧</p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isP1 = record.by === 'p1';
            const name = isP1 ? p1Name : p2Name;
            const role = isP1 ? p1Role : p2Role;
            const isWhite = role === 'white_dog';

            // Money conversions display
            const origCurrency = record.currency || 'TWD';
            const showConverted = record.type === 'money' && origCurrency !== displayCurrency;
            const convertedVal = showConverted ? convertValue(record.value, origCurrency, displayCurrency) : 0;
            
            return (
              <div 
                key={record.id} 
                className="comic-card animate-pop HistoryList-itemCard" 
                style={{ 
                  ...styles.itemCard,
                  borderLeft: isWhite ? '8px solid var(--border-color)' : '8px solid var(--color-warm-gold)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {/* Left side: Avatar & Info */}
                <div className="HistoryList-itemLeft" style={styles.itemLeft}>
                  {/* Miniature Dog typographic label */}
                  <div 
                    title={isWhite ? '白狗角色' : '褐狗角色'}
                    style={{ 
                      ...styles.dogBadge, 
                      backgroundColor: isWhite ? '#FFFFFF' : '#F5E6D8',
                      borderColor: 'var(--border-color)',
                    }} 
                  >
                    <span style={{ fontSize: '0.85rem' }}>{isWhite ? '🐶' : '🐻'}</span>
                  </div>

                  <div className="HistoryList-itemMeta" style={styles.itemMeta}>
                    <div className="HistoryList-itemTitle" style={styles.itemTitle}>{record.title}</div>
                    <div className="HistoryList-itemDetails" style={styles.itemDetails}>
                      <span style={styles.userSpan}>
                        <User size={12} style={{ marginRight: '4px', color: 'var(--text-subtle)' }} />
                        {name}
                      </span>
                      <span style={styles.dateSpan}>
                        <Calendar size={12} style={{ marginRight: '4px', color: 'var(--text-subtle)' }} />
                        {formatDate(record.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Value & Delete */}
                <div className="HistoryList-itemRight" style={styles.itemRight}>
                  <div style={styles.valueText}>
                    {record.type === 'money' ? (
                      <div style={styles.moneyContainer}>
                        <span className="HistoryList-moneyVal" style={styles.moneyVal}>{getCurrencySymbol(origCurrency)} {record.value.toLocaleString()}</span>
                        {showConverted && (
                          <span className="HistoryList-convertedVal" style={styles.convertedVal}>
                            ({getCurrencySymbol(displayCurrency)} {convertedVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="HistoryList-loveVal" style={styles.loveVal}>+{record.value} 點</span>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    className="comic-btn secondary"
                    style={{ ...styles.deleteBtn, borderColor: 'var(--border-color)' }}
                    title="刪除此筆記錄"
                  >
                    <Trash2 size={13} color="var(--border-color)" />
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
    backgroundColor: '#FFFFFF',
    padding: '24px',
    border: 'var(--border-thick)',
    boxShadow: 'var(--shadow-flat)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '2px dashed var(--border-color)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '0.5px',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
  },
  tab: {
    fontSize: '0.8rem',
    padding: '6px 14px',
    borderRadius: '10px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s var(--ease-snappy)',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: 'var(--border-thick)',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    padding: '10px 14px',
    marginBottom: '16px',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    cursor: 'text',
  },
  searchIcon: {
    flexShrink: 0,
    transition: 'color 0.15s ease',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.88rem',
    fontWeight: '700',
    fontFamily: 'inherit',
    color: 'var(--text-primary)',
    backgroundColor: 'transparent',
    minWidth: 0,
  },
  searchClearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '900',
    color: 'var(--text-subtle)',
    padding: '0 2px',
    lineHeight: 1,
    flexShrink: 0,
    transition: 'color 0.1s ease',
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
    fontWeight: '800',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  emptySubtext: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
  },
  itemCard: {
    padding: '14px 18px',
    boxShadow: 'var(--shadow-sm)',
    border: 'var(--border-thick)',
    borderRadius: '14px', /* Rounded paper slip card feel */
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.22s var(--ease-snappy), box-shadow 0.22s var(--ease-snappy)',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flex: 1,
  },
  dogBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '2px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-xs)',
  },
  itemMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemTitle: {
    fontWeight: '800',
    fontSize: '0.98rem',
    color: 'var(--text-primary)',
  },
  itemDetails: {
    display: 'flex',
    gap: '12px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
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
    gap: '14px',
  },
  valueText: {
    fontWeight: '800',
    fontSize: '1.05rem',
  },
  moneyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  moneyVal: {
    color: 'var(--text-primary)',
    fontSize: '1.02rem',
  },
  convertedVal: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
  },
  loveVal: {
    color: 'var(--text-primary)',
  },
  deleteBtn: {
    padding: '6px',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-xs)',
    backgroundColor: '#FFFFFF',
    border: '1.8px solid var(--border-color)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s var(--ease-snappy), box-shadow 0.15s var(--ease-snappy)',
  }
};
