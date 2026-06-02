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
              backgroundColor: activeTab === 'money' ? '#000000' : '#FFFFFF',
              color: activeTab === 'money' ? '#FFFFFF' : '#666666',
              border: '2.5px solid #000000',
              boxShadow: activeTab === 'money' ? '2px 2px 0px #FFFFFF' : 'none',
            }}
          >
            金錢支出 ({records.filter(r => r.type === 'money').length})
          </button>
          <button
            onClick={() => setActiveTab('love')}
            className={`tab-btn HistoryList-tab ${activeTab === 'love' ? 'active' : ''}`}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === 'love' ? '#000000' : '#FFFFFF',
              color: activeTab === 'love' ? '#FFFFFF' : '#666666',
              border: '2.5px solid #000000',
              boxShadow: activeTab === 'love' ? '2px 2px 0px #FFFFFF' : 'none',
            }}
          >
            家事心意 ({records.filter(r => r.type === 'love').length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        ...styles.searchContainer,
        boxShadow: isSearchFocused ? '5px 5px 0px #000000' : '3px 3px 0px #000000',
        transform: isSearchFocused ? 'translate(-1px, -1px)' : 'translate(0, 0)',
      }}>
        <Search
          size={16}
          style={{
            ...styles.searchIcon,
            color: isSearchFocused ? '#000000' : '#888888',
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
            <Footprints size={40} color="#666666" style={{ marginBottom: '12px' }} />
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
                  borderLeft: isWhite ? '8px solid #000000' : '8px solid #D2D2D2',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {/* Left side: Avatar & Info */}
                <div className="HistoryList-itemLeft" style={styles.itemLeft}>
                  {/* Miniature Dog typographic label */}
                  <div style={{ 
                    ...styles.dogBadge, 
                    backgroundColor: isWhite ? '#FFFFFF' : '#D2D2D2',
                    borderColor: '#000000',
                    color: '#000000',
                    fontWeight: '900',
                    fontSize: '0.78rem'
                  }}>
                    {isWhite ? '白' : '灰'}
                  </div>

                  <div className="HistoryList-itemMeta" style={styles.itemMeta}>
                    <div className="HistoryList-itemTitle" style={styles.itemTitle}>{record.title}</div>
                    <div className="HistoryList-itemDetails" style={styles.itemDetails}>
                      <span style={styles.userSpan}>
                        <User size={12} style={{ marginRight: '4px' }} />
                        {name}
                      </span>
                      <span style={styles.dateSpan}>
                        <Calendar size={12} style={{ marginRight: '4px' }} />
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
                    style={styles.deleteBtn}
                    title="刪除此筆記錄"
                  >
                    <Trash2 size={13} color="#000000" />
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
    border: '3px solid #000000',
    boxShadow: '4px 4px 0px #000000',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '2.5px dashed #000000',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#000000',
    letterSpacing: '0.5px',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
  },
  tab: {
    fontSize: '0.8rem',
    padding: '6px 14px',
    borderRadius: '8px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.1s ease',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '3px solid #000000',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    padding: '10px 14px',
    marginBottom: '16px',
    transition: 'box-shadow 0.15s ease, transform 0.15s ease',
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
    color: '#000000',
    backgroundColor: 'transparent',
    minWidth: 0,
  },
  searchClearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '900',
    color: '#888888',
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
    color: '#000000',
    marginBottom: '6px',
  },
  emptySubtext: {
    fontSize: '0.8rem',
    color: '#666666',
    fontWeight: '700',
  },
  itemCard: {
    padding: '14px 18px',
    boxShadow: '3px 3px 0px #000000',
    border: '3px solid #000000',
    borderRadius: '0px', // clean layout blocks
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.15s',
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
    border: '2.5px solid #000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '1.5px 1.5px 0px #000000',
  },
  itemMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemTitle: {
    fontWeight: '800',
    fontSize: '0.98rem',
    color: '#000000',
  },
  itemDetails: {
    display: 'flex',
    gap: '12px',
    fontSize: '0.78rem',
    color: '#666666',
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
    color: '#000000',
    fontSize: '1.02rem',
  },
  convertedVal: {
    fontSize: '0.75rem',
    color: '#666666',
    fontWeight: '700',
  },
  loveVal: {
    color: '#000000',
  },
  deleteBtn: {
    padding: '6px',
    borderRadius: '8px',
    boxShadow: '1.5px 1.5px 0px #000000',
    backgroundColor: '#FFFFFF',
    border: '2px solid #000000',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
