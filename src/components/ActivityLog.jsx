import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, ScrollText, Pencil, Search, X, RotateCcw } from 'lucide-react';

export default function ActivityLog({ 
  activityLog = [], 
  p1Name = '伴侶一', 
  p2Name = '伴侶二', 
  alwaysExpanded = false,
  lovePointRate = 25,
  displayCurrency = 'TWD'
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterAction, setFilterAction] = useState([]);  // [] = show all
  const [filterPerson, setFilterPerson] = useState([]);  // [] = show all
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showScrollHint, setShowScrollHint] = useState(false);
  const logRef = useRef(null);

  const checkScroll = () => {
    if (logRef.current) {
      const target = logRef.current;
      const isScrollable = target.scrollHeight > target.clientHeight;
      const isAtBottom = Math.ceil(target.scrollHeight - target.scrollTop) <= target.clientHeight + 15;
      setShowScrollHint(isScrollable && !isAtBottom);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 150);
    return () => clearTimeout(timer);
  }, [activityLog, isExpanded, filterAction, filterPerson, filterDateFrom, filterDateTo, searchText]);

  const getCurrencySymbol = (code) => {
    if (code === 'TWD') return 'NT$';
    if (code === 'SGD') return 'S$';
    if (code === 'USD') return 'US$';
    if (code === 'CNY') return '¥';
    return 'NT$';
  };

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

  // Check if any filter is active
  const hasActiveFilter =
    filterAction.length > 0 ||
    filterPerson.length > 0 ||
    filterDateFrom !== '' ||
    filterDateTo !== '' ||
    searchText.trim() !== '';

  const resetFilters = () => {
    setFilterAction([]);
    setFilterPerson([]);
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchText('');
  };

  // Toggle a chip in an array-based filter (id='all' resets to [])
  const toggleAction = (id) => {
    if (id === 'all') { setFilterAction([]); return; }
    setFilterAction(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const togglePerson = (id) => {
    if (id === 'all') { setFilterPerson([]); return; }
    setFilterPerson(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Multi-dimension filter (all conditions are AND, within each dimension it's OR)
  const filteredEntries = sorted.filter(entry => {
    // 1. Action type (multi-select OR — empty array = show all)
    if (filterAction.length > 0) {
      const actionKey = entry.action === 'open' ? 'login' : entry.action;
      if (!filterAction.includes(actionKey)) return false;
    }
    // 2. Person (multi-select OR — empty array = show all)
    if (filterPerson.length > 0) {
      if (!filterPerson.includes(entry.by)) return false;
    }
    // 3. Date range
    if (filterDateFrom || filterDateTo) {
      const entryDate = entry.timestamp ? entry.timestamp.slice(0, 10) : '';
      if (filterDateFrom && entryDate < filterDateFrom) return false;
      if (filterDateTo   && entryDate > filterDateTo)   return false;
    }
    // 4. Keyword
    if (searchText.trim() !== '') {
      const q = searchText.trim().toLowerCase();
      const byName    = getPartnerName(entry.by).toLowerCase();
      const payerName = entry.payer ? getPartnerName(entry.payer).toLowerCase() : '';
      const title     = (entry.recordTitle || '').toLowerCase();
      const value     = String(entry.recordValue || '');
      if (!(byName + payerName + title + value).includes(q)) return false;
    }
    return true;
  });

  // ─── Filter bar ────────────────────────────────────────────────
  const renderFilterBar = () => {
    const actionChips = [
      { id: 'all',   label: '全部',    activeColor: '#000',    activeBg: '#000',    activeText: '#fff' },
      { id: 'add',   label: '➕ 新增', activeColor: '#1a7a3a', activeBg: '#22c55e', activeText: '#fff' },
      { id: 'edit',  label: '✏️ 編輯', activeColor: '#1d4ed8', activeBg: '#3b82f6', activeText: '#fff' },
      { id: 'login', label: '🚪 登入', activeColor: '#6b21a8', activeBg: '#a855f7', activeText: '#fff' },
    ];
    const personChips = [
      { id: 'all', label: '👥 全員' },
      { id: 'p1',  label: `👤 ${p1Name}` },
      { id: 'p2',  label: `👤 ${p2Name}` },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>

        {/* Row 1: Action type — multi-select */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={labelStyle}>操作：</span>
          {/* '全部' clears the array */}
          <button
            type="button"
            onClick={() => toggleAction('all')}
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 900,
              borderRadius: '20px',
              border: `2px solid ${filterAction.length === 0 ? '#000' : '#ccc'}`,
              backgroundColor: filterAction.length === 0 ? '#000' : '#f5f5f5',
              color: filterAction.length === 0 ? '#fff' : '#555',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              boxShadow: filterAction.length === 0 ? '1px 2px 0px #000' : 'none',
              transform: filterAction.length === 0 ? 'translate(-1px,-1px)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            全部
          </button>
          {actionChips.filter(c => c.id !== 'all').map(chip => {
            const active = filterAction.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => toggleAction(chip.id)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  borderRadius: '20px',
                  border: `2px solid ${active ? chip.activeColor : '#ccc'}`,
                  backgroundColor: active ? chip.activeBg : '#f5f5f5',
                  color: active ? chip.activeText : '#555',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  boxShadow: active ? `1px 2px 0px ${chip.activeColor}` : 'none',
                  transform: active ? 'translate(-1px,-1px)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Row 2: Person — multi-select */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={labelStyle}>人物：</span>
          {/* '全員' clears the array */}
          <button
            type="button"
            onClick={() => togglePerson('all')}
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 900,
              borderRadius: '20px',
              border: `2px solid ${filterPerson.length === 0 ? '#000' : '#ccc'}`,
              backgroundColor: filterPerson.length === 0 ? '#FFE033' : '#f5f5f5',
              color: '#000',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              boxShadow: filterPerson.length === 0 ? '1px 2px 0px #000' : 'none',
              transform: filterPerson.length === 0 ? 'translate(-1px,-1px)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            👥 全員
          </button>
          {personChips.filter(c => c.id !== 'all').map(chip => {
            const active = filterPerson.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => togglePerson(chip.id)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  borderRadius: '20px',
                  border: `2px solid ${active ? '#000' : '#ccc'}`,
                  backgroundColor: active ? '#FFE033' : '#f5f5f5',
                  color: '#000',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  boxShadow: active ? '1px 2px 0px #000' : 'none',
                  transform: active ? 'translate(-1px,-1px)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Row 3: Date range */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={labelStyle}>🗓️ 日期：</span>
          <input
            type="date"
            value={filterDateFrom}
            onChange={e => setFilterDateFrom(e.target.value)}
            style={dateInputStyle}
          />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#888' }}>→</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={e => setFilterDateTo(e.target.value)}
            style={dateInputStyle}
          />
          {(filterDateFrom || filterDateTo) && (
            <button
              type="button"
              onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); }}
              style={clearBtnStyle}
              title="清除日期篩選"
            >
              <X size={10} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Row 4: Keyword search */}
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={12}
              strokeWidth={3}
              style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="搜尋記錄名稱、人名、金額…"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '26px',
                paddingRight: searchText ? '28px' : '8px',
                paddingTop: '5px',
                paddingBottom: '5px',
                fontSize: '0.74rem',
                fontWeight: 700,
                border: '2px solid #000',
                borderRadius: '20px',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
                style={{ ...clearBtnStyle, position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', backgroundColor: 'transparent' }}
              >
                <X size={11} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        {/* Result count + reset */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#888' }}>
            找到 <span style={{ color: '#000', fontWeight: 900 }}>{filteredEntries.length}</span> 筆 / 共 {activityLog.length} 筆
          </span>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                fontSize: '0.68rem',
                fontWeight: 900,
                border: '2px solid #000',
                borderRadius: '20px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                boxShadow: '1px 1px 0 #000',
              }}
            >
              <RotateCcw size={10} strokeWidth={3} /> 重設篩選
            </button>
          )}
        </div>
      </div>
    );
  };

  // ─── Scroll hint ─────────────────────────────────────────────────
  const renderScrollHint = () => (
    <div
      onClick={() => {
        if (logRef.current) {
          logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
        }
      }}
      style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto', cursor: 'pointer', zIndex: 100 }}
    >
      <div
        className="animate-float"
        style={{
          backgroundColor: '#000000',
          color: '#FFFFFF',
          padding: '4px 10px',
          borderRadius: '16px',
          fontSize: '0.68rem',
          fontWeight: '900',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: 'var(--shadow-sm)',
          opacity: 0.9,
          border: '2px solid var(--border-color, #000)',
        }}
      >
        <span>▼ 滑動查看日誌</span>
      </div>
    </div>
  );

  // ─── Entries ──────────────────────────────────────────────────────
  const renderEntries = () => {
    if (filteredEntries.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '24px 12px', color: '#888', fontWeight: '800', fontSize: '0.82rem' }}>
          📭 {hasActiveFilter ? '沒有符合篩選條件的日誌' : '此分類下暫無任何日誌項目'}
        </div>
      );
    }

    return filteredEntries.map((entry, idx) => {
      const isAdd  = entry.action === 'add';
      const isOpen = entry.action === 'open';
      const isEdit = entry.action === 'edit';
      const dotColor = isAdd ? '#1a7a3a' : isEdit ? '#1d4ed8' : isOpen ? '#6b21a8' : '#888';

      const valueStr =
        entry.recordType === 'money'
          ? `${entry.recordValue} ${entry.recordCurrency || 'TWD'}`
          : `${entry.recordValue} 點 (折合 ${getCurrencySymbol(displayCurrency)} ${(entry.recordValue * lovePointRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })})`;

      return (
        <div key={entry.id || idx} style={styles.entry}>
          {/* Timeline dot */}
          <div style={{ ...styles.dot, backgroundColor: dotColor, borderColor: dotColor }}>
            {isOpen ? (
              <span style={{ fontSize: '10px' }}>👋</span>
            ) : isAdd ? (
              <Plus size={10} strokeWidth={3} color="#fff" />
            ) : isEdit ? (
              <Pencil size={8} strokeWidth={3} color="#fff" />
            ) : (
              <Trash2 size={10} strokeWidth={3} color="#fff" />
            )}
          </div>

          {/* Vertical connector line */}
          {idx < filteredEntries.length - 1 && (
            <div style={{ ...styles.line, borderColor: dotColor + '44' }} />
          )}

          {/* Content */}
          <div style={styles.entryContent}>
            <div style={styles.entryMain}>
              <span style={styles.who}>{getPartnerName(entry.by)}</span>
              {entry.payer && entry.payer !== entry.by ? (
                isAdd ? (
                  <span>
                    {' '}幫{' '}
                    <span style={{ ...styles.who, color: 'var(--color-love-accent, #E22B55)' }}>
                      {getPartnerName(entry.payer)}
                    </span>
                    {' '}代登記了{' '}
                  </span>
                ) : isEdit ? (
                  <span>
                    {' '}幫{' '}
                    <span style={{ ...styles.who, color: 'var(--color-love-accent, #E22B55)' }}>
                      {getPartnerName(entry.payer)}
                    </span>
                    {' '}代編輯了{' '}
                  </span>
                ) : (
                  <span>
                    {' '}代{' '}
                    <span style={styles.who}>{getPartnerName(entry.payer)}</span>
                    {' '}刪除了{' '}
                  </span>
                )
              ) : (
                <span style={{ ...styles.action, color: dotColor }}>
                  {isOpen ? ' 登入了 ' : isAdd ? ' 新增了 ' : isEdit ? ' 編輯了 ' : ' 刪除了 '}
                </span>
              )}
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
    });
  };

  // ─── Empty state ──────────────────────────────────────────────────
  if (activityLog.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px', color: '#888', fontWeight: '800', fontSize: '0.9rem' }}>
        📭 暫無任何活動日誌
      </div>
    );
  }

  // ─── Always-expanded mode (inside SettingsModal) ──────────────────
  if (alwaysExpanded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ padding: '12px 14px 4px 14px', borderBottom: '2px dashed var(--border-color, #000)' }}>
          {renderFilterBar()}
        </div>
        {/* Wrap list + hint in a relative container so hint stays inside the list area */}
        <div style={{ position: 'relative', flex: 1 }}>
          <div
            ref={logRef}
            onScroll={checkScroll}
            style={{ ...styles.modalLogList, overflowY: 'auto', maxHeight: '320px' }}
          >
            {renderEntries()}
          </div>
          {showScrollHint && renderScrollHint()}
        </div>
      </div>
    );
  }

  // ─── Collapsible mode (main page) ────────────────────────────────
  return (
    <div style={styles.wrapper}>
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="comic-btn secondary"
        style={styles.header}
      >
        <ScrollText size={16} strokeWidth={2.5} />
        <span style={{ fontWeight: 900, fontSize: '0.92rem' }}>
          活動日誌 <span style={styles.badge}>{activityLog.length}</span>
        </span>
        <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.75rem' }}>
          （僅供查看，不可刪除）
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div style={styles.logContainer}>
          {renderFilterBar()}
          {/* Wrap list + hint in a relative container so hint stays inside the list area */}
          <div style={{ position: 'relative' }}>
            <div
              ref={logRef}
              onScroll={checkScroll}
              style={{ borderTop: '2px dashed var(--border-color, #000)', marginTop: '8px', paddingTop: '12px', maxHeight: '360px', overflowY: 'auto' }}
            >
              {renderEntries()}
            </div>
            {showScrollHint && renderScrollHint()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared sub-styles ────────────────────────────────────────────
const labelStyle = {
  fontSize: '0.68rem',
  fontWeight: 900,
  color: '#555',
  whiteSpace: 'nowrap',
};

const dateInputStyle = {
  padding: '4px 6px',
  fontSize: '0.72rem',
  fontWeight: 700,
  border: '2px solid #000',
  borderRadius: '8px',
  outline: 'none',
  fontFamily: 'inherit',
  backgroundColor: '#fff',
  cursor: 'pointer',
};

const clearBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  border: '1.5px solid #aaa',
  borderRadius: '50%',
  backgroundColor: '#eee',
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
};

const styles = {
  wrapper: { marginTop: '28px' },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 18px',
    border: '4px solid #000',
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
    border: '4px solid #000',
    marginTop: '12px',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    padding: '20px 20px 8px 20px',
    overflowY: 'auto',
    boxShadow: 'var(--shadow-flat)',
    position: 'relative',
  },
  modalLogList: {
    padding: '14px 14px 4px 14px',
    position: 'relative',
    backgroundColor: '#FFFFFF',
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
    borderLeft: '2.5px dashed #cccccc',
    zIndex: 0,
  },
  entryContent: { flex: 1, paddingTop: '2px' },
  entryMain: { fontSize: '0.85rem', fontWeight: 700, color: '#000', lineHeight: '1.5', flexWrap: 'wrap' },
  who: { fontWeight: 900, fontSize: '0.88rem' },
  action: { fontWeight: 700 },
  recordTitle: { fontWeight: 900, fontSize: '0.88rem' },
  value: { marginLeft: '4px', fontSize: '0.8rem', color: '#555', fontWeight: 700 },
  timestamp: { fontSize: '0.72rem', color: '#888888', fontWeight: 700, marginTop: '3px', fontFamily: 'monospace' },
};
