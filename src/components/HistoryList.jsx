import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Calendar, Footprints, Search, Coins, Heart, Users, Pencil } from 'lucide-react';

export default function HistoryList({ 
  records = [], 
  onDeleteRecord, 
  onEditRecord,
  p1Name = '伴侶一', 
  p2Name = '伴侶二',
  p1Role = 'white_dog',
  p2Role = 'brown_dog',
  displayCurrency = 'TWD',
  lovePointRate = 25,
  exchangeRates,
  activeTab = 'all',
  onActiveTabChange
}) {
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState(null);
  const [filterPartner, setFilterPartner] = useState('all'); // 'all' | 'p1' | 'p2'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const listRef = useRef(null);

  const checkScroll = () => {
    if (listRef.current) {
      const target = listRef.current;
      const isScrollable = target.scrollHeight > target.clientHeight;
      const isAtBottom = Math.ceil(target.scrollHeight - target.scrollTop) <= target.clientHeight + 15;
      setShowScrollHint(isScrollable && !isAtBottom);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 150);
    return () => clearTimeout(timer);
  }, [records, searchQuery, activeTab, filterPartner]);

  const convertValueLocal = (val, from = 'TWD', to = 'TWD') => {
    const rates = exchangeRates || { TWD: 1.0, USD: 32.5, SGD: 24.0, CNY: 4.5 };
    const fromRate = rates[from] || 1.0;
    const toRate = rates[to] || 1.0;
    return (val * fromRate) / toRate;
  };

  const getCurrencySymbol = (code) => {
    if (code === 'TWD') return 'NT$';
    if (code === 'SGD') return 'S$';
    if (code === 'USD') return 'US$';
    if (code === 'CNY') return '¥';
    return 'NT$';
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  const getGroupKey = (isoString) => {
    try {
      const d = new Date(isoString);
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}/${month}/${date} (${days[d.getDay()]})`;
    } catch (e) {
      return '其他日期';
    }
  };

  // Filter and sort records
  const filteredRecords = records
    .filter(r => {
      if (activeTab === 'all') return true;
      return r.type === activeTab;
    })
    .filter(r => {
      if (filterPartner === 'all') return true;
      return r.by === filterPartner;
    })
    .filter(r => {
      if (!searchQuery.trim()) return true;
      return r.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group records by day
  const groupKeys = [];
  const groups = {};
  filteredRecords.forEach(record => {
    const key = getGroupKey(record.date);
    if (!groups[key]) {
      groups[key] = [];
      groupKeys.push(key);
    }
    groups[key].push(record);
  });

  // Calculate day totals for summary
  const getDaySummary = (dayRecords) => {
    let moneySum = 0;
    let loveSum = 0;
    dayRecords.forEach(r => {
      if (r.type === 'money') {
        const cur = r.currency || 'TWD';
        moneySum += convertValueLocal(r.value, cur, displayCurrency);
      } else {
        loveSum += r.value;
      }
    });

    const parts = [];
    if (moneySum > 0) {
      parts.push(`${getCurrencySymbol(displayCurrency)} ${Math.round(moneySum).toLocaleString()}`);
    }
    if (loveSum > 0) {
      parts.push(`❤️ ${loveSum}點`);
    }
    return parts.join(' | ') || '無付出';
  };

  return (
    <div className="comic-card" style={styles.container}>
      <h3 style={styles.title}>生活付出足跡明細</h3>

      {/* FILTER BUTTONS & SELECTORS */}
      <div style={styles.filterSection}>
        {/* Category Filter */}
        <div style={styles.filterRow}>
          <span style={styles.filterLabel}>篩選分類</span>
          <div style={styles.btnGroup}>
            {[
              { id: 'all', label: '全部', icon: <Footprints size={12} /> },
              { id: 'money', label: '金錢支出', icon: <Coins size={12} /> },
              { id: 'love', label: '家事勞動', icon: <Heart size={12} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => onActiveTabChange(tab.id)}
                className="comic-btn secondary"
                style={{
                  ...styles.filterBtn,
                  backgroundColor: activeTab === tab.id ? '#000000' : '#FFFFFF',
                  color: activeTab === tab.id ? '#FFFFFF' : '#000000',
                  borderColor: 'var(--border-color)',
                  transform: activeTab === tab.id ? 'translate(-1px, -1px)' : 'none',
                  boxShadow: activeTab === tab.id ? 'var(--shadow-xs)' : 'none',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Partner Filter */}
        <div style={styles.filterRow}>
          <span style={styles.filterLabel}>付出對象</span>
          <div style={styles.btnGroup}>
            {[
              { id: 'all', label: '所有人', icon: <Users size={12} /> },
              { id: 'p1', label: `${p1Name} ${p1Role === 'white_dog' ? '🐶' : '🐻'}`, icon: null },
              { id: 'p2', label: `${p2Name} ${p2Role === 'white_dog' ? '🐶' : '🐻'}`, icon: null },
            ].map(partner => (
              <button
                key={partner.id}
                onClick={() => setFilterPartner(partner.id)}
                className="comic-btn secondary"
                style={{
                  ...styles.filterBtn,
                  backgroundColor: filterPartner === partner.id ? '#000000' : '#FFFFFF',
                  color: filterPartner === partner.id ? '#FFFFFF' : '#000000',
                  borderColor: 'var(--border-color)',
                  transform: filterPartner === partner.id ? 'translate(-1px, -1px)' : 'none',
                  boxShadow: filterPartner === partner.id ? 'var(--shadow-xs)' : 'none',
                }}
              >
                {partner.icon}
                <span>{partner.label}</span>
              </button>
            ))}
          </div>
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
          placeholder="🔍 輸入描述搜尋付出足跡..."
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

      {/* List Wrapper */}
      <div 
        ref={listRef}
        onScroll={checkScroll}
        style={styles.listWrapper}
      >
        {groupKeys.length === 0 ? (
          <div style={styles.emptyState}>
            <Footprints size={40} color="var(--text-subtle)" style={{ marginBottom: '12px' }} />
            <p style={styles.emptyText}>尚未有符合的付出足跡</p>
            <p style={styles.emptySubtext}>嘗試調整篩選條件，或在下方登記生活付出吧！</p>
          </div>
        ) : (
          groupKeys.map(dayKey => {
            const dayRecords = groups[dayKey];
            return (
              <div key={dayKey} style={styles.dayGroup}>
                {/* Day Header Block */}
                <div style={styles.dayHeader}>
                  <div style={styles.dayDate}>
                    <Calendar size={14} style={{ marginRight: '6px' }} />
                    <span>{dayKey}</span>
                  </div>
                  <div style={styles.dayTotal}>
                    <span>日小計：</span>
                    <span style={{ fontWeight: '800' }}>{getDaySummary(dayRecords)}</span>
                  </div>
                </div>

                {/* Day Rows Container */}
                <div style={styles.dayRows}>
                  {dayRecords.map((record, index) => {
                    const isP1 = record.by === 'p1';
                    const name = isP1 ? p1Name : p2Name;
                    const role = isP1 ? p1Role : p2Role;
                    const isWhite = role === 'white_dog';

                    // Money conversions display
                    const origCurrency = record.currency || 'TWD';
                    const showConverted = record.type === 'money' && origCurrency !== displayCurrency;
                    const convertedVal = showConverted ? convertValueLocal(record.value, origCurrency, displayCurrency) : 0;

                    return (
                      <div 
                        key={record.id} 
                        onClick={() => setSelectedRecordForDetail(record)}
                        style={{
                          ...styles.recordRow,
                          borderBottom: index === dayRecords.length - 1 ? 'none' : '1.5px dashed var(--border-color)',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer'
                        }}
                      >
                        {/* Left Info */}
                        <div style={styles.rowLeft}>
                          {/* Avatar Badge */}
                          <div 
                            title={`${name} (${isWhite ? '白狗' : '褐狗'})`}
                            style={{ 
                              ...styles.dogBadge, 
                              backgroundColor: isWhite ? '#FFFFFF' : '#F5E6D8',
                              borderColor: 'var(--border-color)',
                            }} 
                          >
                            <span style={{ fontSize: '0.85rem' }}>{isWhite ? '🐶' : '🐻'}</span>
                          </div>

                          <div style={styles.rowMeta}>
                            <div style={styles.rowTitle}>{record.title}</div>
                            <div style={styles.rowDetails}>
                              <span style={styles.timeSpan}>{formatDate(record.date)}</span>
                              <span style={{ color: 'var(--text-subtle)' }}>•</span>
                              <span style={styles.nameSpan}>{name}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Amount & Delete */}
                        <div style={styles.rowRight}>
                          <div style={styles.rowAmountContainer}>
                            {record.type === 'money' ? (
                              <>
                                <span style={styles.amountMoney}>
                                  {getCurrencySymbol(origCurrency)} {record.value.toLocaleString()}
                                </span>
                                {showConverted && (
                                  <span style={styles.amountConverted}>
                                    ({getCurrencySymbol(displayCurrency)} {convertedVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })})
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <span style={styles.amountLove}>
                                  +{record.value} 點
                                </span>
                                <span style={styles.amountConverted}>
                                  ({getCurrencySymbol(displayCurrency)} {(record.value * lovePointRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })})
                                </span>
                              </>
                            )}
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); onEditRecord(record); }}
                            className="comic-btn secondary"
                            style={{ ...styles.rowDeleteBtn, marginRight: '4px' }}
                            title="編輯此筆明細"
                          >
                            <Pencil size={13} color="var(--border-color)" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteRecord(record.id); }}
                            className="comic-btn secondary"
                            style={styles.rowDeleteBtn}
                            title="刪除此筆明細"
                          >
                            <Trash2 size={13} color="var(--border-color)" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
      {showScrollHint && (
        <div 
          onClick={() => {
            if (listRef.current) {
              listRef.current.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }
          }}
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            zIndex: 100
          }}
        >
          <div 
            className="animate-float" 
            style={{
              backgroundColor: '#000000',
              color: '#FFFFFF',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: 'var(--shadow-sm)',
              opacity: 0.95,
              border: '2.5px solid var(--border-color, #000)'
            }}
          >
            <span>▼ 滑動查看更多明細</span>
          </div>
        </div>
      )}

      {selectedRecordForDetail && (
        <div 
          className="modal-backdrop" 
          onClick={() => setSelectedRecordForDetail(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(26, 21, 18, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div 
            className="comic-card animate-pop" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              position: 'relative',
              border: 'var(--border-thick)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-flat)',
            }}
          >
            {/* Tape decoration */}
            <div 
              className="paper-tape" 
              style={{ 
                backgroundColor: selectedRecordForDetail.type === 'money' ? 'rgba(122, 168, 144, 0.2)' : 'rgba(255, 138, 138, 0.2)',
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%) rotate(-2deg)',
                width: '120px',
                height: '24px',
                zIndex: 2,
              }} 
            />

            <button 
              onClick={() => setSelectedRecordForDetail(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: '2px solid #000',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: '900',
                backgroundColor: '#fff',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '950', marginBottom: '18px', borderBottom: '2.5px solid #000', paddingBottom: '8px', color: 'var(--text-primary)' }}>
              🔍 生活付出詳細資料
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800' }}>付出項目描述：</span>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedRecordForDetail.title}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800' }}>付出者：</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{selectedRecordForDetail.by === 'p1' ? p1Name : p2Name}</span>
                    <span>{ (selectedRecordForDetail.by === 'p1' ? p1Role : p2Role) === 'white_dog' ? '🐶' : '🐻' }</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800' }}>付出類型：</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', marginTop: '2px' }}>
                    {selectedRecordForDetail.type === 'money' ? '💰 金錢支出' : '🧹 家事勞動'}
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800' }}>付出值 (折算金額)：</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '950', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedRecordForDetail.type === 'money' ? (
                    `${getCurrencySymbol(selectedRecordForDetail.currency || 'TWD')} ${selectedRecordForDetail.value.toLocaleString()}`
                  ) : (
                    `+${selectedRecordForDetail.value} 點 (折合 ${getCurrencySymbol(displayCurrency)} ${(selectedRecordForDetail.value * lovePointRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })})`
                  )}
                </div>
              </div>

              <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '750' }}>🕒 紀錄日期時間：</span>
                  <span style={{ fontWeight: '800', fontFamily: 'monospace' }}>
                    {new Date(selectedRecordForDetail.date).toLocaleString('zh-TW', { hour12: false })}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '750' }}>👤 誰登記的：</span>
                  <span style={{ fontWeight: '800' }}>
                    {selectedRecordForDetail.recordedBy 
                      ? (selectedRecordForDetail.recordedBy === 'p1' ? p1Name : p2Name) 
                      : (selectedRecordForDetail.by === 'p1' ? p1Name : p2Name)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '750' }}>📍 登記地點：</span>
                  <span style={{ fontWeight: '800' }}>
                    {selectedRecordForDetail.recordedAt || '本機定位 (未提供)'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '750' }}>📱 登記裝置：</span>
                  <span style={{ fontWeight: '800' }}>
                    {selectedRecordForDetail.recordedDevice || '行動/桌面裝置'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '750' }}>🌐 登記來源環境：</span>
                  <span style={{ fontWeight: '800', fontFamily: 'monospace' }}>
                    {selectedRecordForDetail.recordedHost || '本地環境'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#FFFFFF',
    padding: '24px',
    border: 'var(--border-thick)',
    boxShadow: 'var(--shadow-flat)',
    position: 'relative',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '900',
    color: 'var(--text-primary)',
    letterSpacing: '0.5px',
    marginBottom: '18px',
    borderBottom: '2.5px solid #000000',
    paddingBottom: '10px',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
    backgroundColor: '#FAF8F5',
    padding: '12px',
    borderRadius: '12px',
    border: '2px solid #000000',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: '#333333',
    width: '64px',
    flexShrink: 0,
  },
  btnGroup: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '5px 12px',
    fontSize: '0.78rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s var(--ease-snappy)',
    boxShadow: 'none',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: 'var(--border-thick)',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    padding: '10px 14px',
    marginBottom: '18px',
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
    gap: '16px',
    maxHeight: '500px',
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
    fontWeight: '900',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  emptySubtext: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '750',
  },
  dayGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    backgroundColor: '#FAF5ED',
    border: '2px solid #000000',
    borderRadius: '10px',
    fontSize: '0.82rem',
    fontWeight: '800',
  },
  dayDate: {
    display: 'flex',
    alignItems: 'center',
    color: '#000000',
  },
  dayTotal: {
    fontSize: '0.78rem',
    color: '#555555',
  },
  dayRows: {
    border: '2px solid #000000',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-xs)',
  },
  recordRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    transition: 'background-color 0.18s ease',
  },
  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
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
    flexShrink: 0,
  },
  rowMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  rowTitle: {
    fontWeight: '800',
    fontSize: '0.92rem',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowDetails: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
  },
  timeSpan: {
    color: 'var(--text-muted)',
  },
  nameSpan: {
    color: '#555555',
  },
  rowRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  rowAmountContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  amountMoney: {
    color: 'var(--text-primary)',
    fontWeight: '900',
    fontSize: '0.95rem',
  },
  amountLove: {
    color: 'var(--color-love-accent-hover)',
    fontWeight: '900',
    fontSize: '0.95rem',
  },
  amountConverted: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
  },
  rowDeleteBtn: {
    padding: '6px',
    borderRadius: '8px',
    boxShadow: 'none',
    backgroundColor: '#FFFFFF',
    border: '1.8px solid var(--border-color)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s var(--ease-snappy)',
  }
};
