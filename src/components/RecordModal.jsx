import React, { useState, useEffect } from 'react';
import { X, Landmark, Heart, Sparkles, User, Tag, Plus, Check } from 'lucide-react';

const MONEY_PRESETS = [
  { tag: '買菜及日用品', val: '' },
  { tag: '水電瓦斯網路', val: '' },
  { tag: '約會美食', val: '' },
  { tag: '房租及家居費', val: '' },
  { tag: '交通及加油費', val: '' },
  { tag: '飲料點心生活', val: '' },
];

const LOVE_PRESETS = [
  { tag: '辛苦洗碗盤', points: 10 },
  { tag: '日常打掃', points: 10 },
  { tag: '烹調下廚', points: 20 },
  { tag: '按摩放鬆', points: 15 },
  { tag: '準備心意驚喜', points: 20 },
  { tag: '專車接送', points: 15 },
];

export default function RecordModal({ 
  isOpen, 
  onClose, 
  onAddRecord, 
  p1Name = '伴侶一', 
  p2Name = '伴侶二',
  p1Role = 'white_dog',
  p2Role = 'brown_dog',
  defaultByPartner = 'p1',
  defaultType = 'money',
  displayCurrency = 'TWD',
  lovePointRate = 25
}) {
  const getCurrencySymbol = (code) => {
    if (code === 'TWD') return 'NT$';
    if (code === 'SGD') return 'S$';
    if (code === 'USD') return 'US$';
    if (code === 'CNY') return '¥';
    return 'NT$';
  };
  const symbol = getCurrencySymbol(displayCurrency);

  const [recordType, setRecordType] = useState(defaultType); // 'money' or 'love'
  const [byPartner, setByPartner] = useState(defaultByPartner); // 'p1' (husband) or 'p2' (wife)
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState('TWD');
  const [error, setError] = useState('');
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isValueFocused, setIsValueFocused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setByPartner(defaultByPartner);
      setRecordType(defaultType);
    }
  }, [isOpen, defaultByPartner, defaultType]);


  if (!isOpen) return null;

  const handlePresetClick = (preset) => {
    setTitle(preset.tag);
    if (preset.points) {
      setValue(preset.points.toString());
    }
  };

  const handleQuickPoints = (points) => {
    setValue(points.toString());
  };

  const handleDivideByTwo = () => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setValue((num / 2).toString());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) {
      setError(recordType === 'money' ? '請輸入大於 0 的金額數字喔！' : '請輸入大於 0 的勞動點數喔！');
      return;
    }

    let finalTitle = title.trim();
    if (!finalTitle) {
      const now = new Date();
      const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (recordType === 'money') {
        finalTitle = `${currency} ${numVal} (${dateStr} ${timeStr})`;
      } else {
        finalTitle = `心意 ${numVal}點 (${dateStr} ${timeStr})`;
      }
    }

    onAddRecord({
      id: Date.now().toString(),
      type: recordType,
      by: byPartner,
      title: finalTitle,
      value: numVal,
      currency: recordType === 'money' ? currency : undefined,
      date: new Date().toISOString()
    });

    // Reset Form
    setTitle('');
    setValue('');
    setCurrency('TWD');
    onClose();
  };

  const isMoney = recordType === 'money';
  const activeColor = isMoney ? 'var(--color-money-accent)' : 'var(--color-love-accent)';
  const activeBg = isMoney ? 'var(--color-money-bg)' : 'var(--color-love-bg)';

  const getPartnerStyle = (key) => {
    const isSelected = byPartner === key;
    const role = key === 'p1' ? p1Role : p2Role;
    const isWhite = role === 'white_dog';
    
    if (isSelected) {
      return {
        ...styles.partnerCard,
        backgroundColor: isWhite ? '#FFFFFF' : '#F5E6D8',
        borderColor: 'var(--border-color)',
        borderWidth: '2.5px',
        transform: 'translate(-1.5px, -1.5px)',
        boxShadow: 'var(--shadow-sm)',
        opacity: 1,
      };
    }
    return {
      ...styles.partnerCard,
      backgroundColor: '#FFFFFF',
      borderColor: 'var(--border-color)',
      borderWidth: '1.8px',
      transform: 'none',
      boxShadow: 'var(--shadow-xs)',
      opacity: 0.65,
    };
  };

  return (
    <div 
      style={styles.overlay}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div className="comic-card animate-pop RecordModal-card" style={styles.modalCard}>
        {/* Decorative diagonal tape */}
        <div className="paper-tape" style={{ backgroundColor: isMoney ? 'rgba(122, 168, 144, 0.2)' : 'rgba(255, 138, 138, 0.2)' }} />

        {/* Memo Paper Header Decoration */}
        <div style={styles.memoHeader}>
          <div style={styles.binderRings}>
            <div style={styles.ring} />
            <div style={styles.ring} />
            <div style={styles.ring} />
            <div style={styles.ring} />
            <div style={styles.ring} />
          </div>
          <button onClick={onClose} style={styles.closeBtn} className="comic-btn secondary">
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <h2 className="RecordModal-title" style={styles.title}>登記生活付出項目</h2>
        
        {/* Type selector tabs */}
        <div className="RecordModal-typeSelector" style={styles.typeSelector}>
          <button 
            type="button" 
            onClick={() => { setRecordType('money'); setValue(''); setError(''); }}
            className="RecordModal-typeBtn"
            style={{ 
              ...styles.typeBtn, 
              backgroundColor: isMoney ? 'var(--color-money-bg)' : '#FFFFFF',
              borderColor: 'var(--border-color)',
              color: isMoney ? 'var(--color-money-accent-hover)' : 'var(--text-muted)',
              boxShadow: isMoney ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
              transform: isMoney ? 'translate(-1.5px, -1.5px)' : 'none',
            }}
          >
            <Landmark size={18} color={isMoney ? 'var(--color-money-accent)' : 'var(--text-muted)'} />
            <span>金錢帳單</span>
          </button>

          <button 
            type="button" 
            onClick={() => { setRecordType('love'); setValue(''); setError(''); }}
            className="RecordModal-typeBtn"
            style={{ 
              ...styles.typeBtn, 
              backgroundColor: !isMoney ? 'var(--color-love-bg)' : '#FFFFFF',
              borderColor: 'var(--border-color)',
              color: !isMoney ? 'var(--color-love-accent-hover)' : 'var(--text-muted)',
              boxShadow: !isMoney ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
              transform: !isMoney ? 'translate(-1.5px, -1.5px)' : 'none',
            }}
          >
            <Heart size={18} color={!isMoney ? 'var(--color-love-accent)' : 'var(--text-muted)'} fill={!isMoney ? 'var(--color-love-accent)' : 'none'} />
            <span>家事與勞動</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Who made the effort? */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User size={15} style={{ marginRight: '4px' }} />
              是誰為生活付出的？
            </label>
            <div className="RecordModal-partnerSelector" style={styles.partnerSelector}>
              <div 
                onClick={() => setByPartner('p1')}
                style={getPartnerStyle('p1')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{p1Role === 'white_dog' ? '🐶' : '🐻'}</span>
                  <span className="RecordModal-partnerName" style={styles.partnerName}>{p1Name}</span>
                </div>
                {byPartner === 'p1' && <Check size={16} color="var(--border-color)" strokeWidth={3.5} />}
              </div>

              <div 
                onClick={() => setByPartner('p2')}
                style={getPartnerStyle('p2')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{p2Role === 'white_dog' ? '🐶' : '🐻'}</span>
                  <span className="RecordModal-partnerName" style={styles.partnerName}>{p2Name}</span>
                </div>
                {byPartner === 'p2' && <Check size={16} color="var(--border-color)" strokeWidth={3.5} />}
              </div>
            </div>
          </div>

          {/* Description Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Tag size={15} style={{ marginRight: '4px' }} />
              付出項目描述
            </label>
            <input 
              type="text" 
              placeholder={isMoney ? '例如：買全聯菜肉、繳電費...' : '例如：掃地洗衣服、搥背...' }
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              onFocus={() => setIsTitleFocused(true)}
              onBlur={() => setIsTitleFocused(false)}
              style={{
                borderColor: isTitleFocused ? activeColor : 'var(--border-color)',
                boxShadow: isTitleFocused ? `0 0 0 3.5px ${isMoney ? 'rgba(122,168,144,0.25)' : 'rgba(255,138,138,0.25)'}` : 'none',
                transition: 'all 0.15s ease',
              }}
              className="comic-input" 
              maxLength="30"
            />
          </div>

          {/* Quick presets */}
          <div style={styles.formGroup}>
            <label style={styles.presetLabel}>推薦常用項目：</label>
            <div style={styles.presetsList}>
              {(isMoney ? MONEY_PRESETS : LOVE_PRESETS).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(item)}
                  className="RecordModal-presetTag"
                  style={{
                    ...styles.presetTag,
                    backgroundColor: '#FFFFFF',
                    borderColor: 'var(--border-color)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = activeBg;
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = '3.5px 3.5px 0px var(--shadow-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '2.5px 2.5px 0px var(--shadow-color)';
                  }}
                >
                  {item.tag}
                  {item.points && <span style={styles.presetPoints}>+{item.points}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Currency selection for money */}
          {isMoney && (
            <div style={styles.formGroup}>
              <label style={styles.label}>
                交易幣別
              </label>
              <div className="RecordModal-currencyRow" style={styles.currencyRow}>
                {[
                  { code: 'TWD', name: 'TWD (NT$)' },
                  { code: 'SGD', name: 'SGD (S$)' },
                  { code: 'USD', name: 'USD (US$)' },
                  { code: 'CNY', name: 'CNY (¥)' }
                ].map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency(curr.code)}
                    className="RecordModal-currencyBtn"
                    style={{
                      ...styles.currencyBtn,
                      backgroundColor: currency === curr.code ? 'var(--text-primary)' : '#FFFFFF',
                      color: currency === curr.code ? '#FFFFFF' : 'var(--text-primary)',
                      border: '2px solid var(--border-color)',
                      boxShadow: currency === curr.code ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                      transform: currency === curr.code ? 'translate(-1px, -1px)' : 'none',
                    }}
                  >
                    {curr.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount / Hearts value */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              {isMoney ? '付出金額' : `勞動點數 (折合 ${symbol} ${((parseFloat(value) || 0) * lovePointRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })})`}
            </label>
            <div style={styles.valueInputRow}>
              <input 
                type="number" 
                placeholder={isMoney ? `${currency === 'TWD' ? 'NT$' : currency === 'SGD' ? 'S$' : 'US$'} 金額` : '點數值'} 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                onFocus={() => setIsValueFocused(true)}
                onBlur={() => setIsValueFocused(false)}
                style={{
                  borderColor: isValueFocused ? activeColor : 'var(--border-color)',
                  boxShadow: isValueFocused ? `0 0 0 3.5px ${isMoney ? 'rgba(122,168,144,0.25)' : 'rgba(255,138,138,0.25)'}` : 'none',
                  transition: 'all 0.15s ease',
                  flex: 1,
                }}
                className="comic-input" 
                min="1"
                step="any"
              />
              <button
                type="button"
                onClick={handleDivideByTwo}
                className="comic-btn secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  fontWeight: '900',
                  border: '2px solid #000000',
                  boxShadow: 'var(--shadow-xs)',
                  whiteSpace: 'nowrap',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="數值除以二"
              >
                ÷ 2
              </button>
              {isMoney && (
                <span style={styles.unitText}>
                  {currency === 'TWD' ? '元 (TWD)' : currency === 'SGD' ? '元 (SGD)' : '元 (USD)'}
                </span>
              )}
            </div>

            {/* Quick point triggers for chores */}
            {!isMoney && (
              <div style={styles.quickPointsRow}>
                {[5, 10, 15, 20, 30].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => handleQuickPoints(pts)}
                    className="RecordModal-quickPointBtn"
                    style={{
                      ...styles.quickPointBtn,
                      borderColor: 'var(--border-color)',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-love-bg)';
                      e.currentTarget.style.transform = 'translate(-1px, -1px)';
                      e.currentTarget.style.boxShadow = '3px 3px 0px var(--shadow-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '2px 2px 0px var(--shadow-color)';
                    }}
                  >
                    +{pts} 點
                  </button>
                ))}
              </div>
            )}

            {/* HEART POINT COZY EVALUATION GUIDE */}
            {!isMoney && (
              <div style={styles.guideWrapper}>
                <details style={styles.guideDetails}>
                  <summary style={styles.guideSummary}>
                    不知道點數如何評估？點我看「勞動與家事對照折算表」
                  </summary>
                  <div style={styles.guideContent}>
                    <div style={styles.guideRow}><strong>+5 點 (輕微勞動，折合 {symbol} {5 * lovePointRate})</strong>：倒垃圾、順手倒溫水、買咖啡、洗水果</div>
                    <div style={styles.guideRow}><strong>+10 點 (日常勞動，折合 {symbol} {10 * lovePointRate})</strong>：辛苦洗碗、吸地拖地、洗曬衣服、整理房間</div>
                    <div style={styles.guideRow}><strong>+20 點 (深度勞動，折合 {symbol} {20 * lovePointRate})</strong>：親自下廚做飯、專車接送、搥背按摩半小時</div>
                    <div style={styles.guideRow}><strong>+30 點 (史詩勞動，折合 {symbol} {30 * lovePointRate})</strong>：大掃除整理全家、生病通宵照顧、驚喜手工禮</div>
                  </div>
                </details>
              </div>
            )}
          </div>

          {error && <div style={styles.errorText}>{error}</div>}

          {/* Action row */}
          <div className="RecordModal-actionRow" style={styles.actionRow}>
            <button 
              type="button" 
              onClick={onClose} 
              className="comic-btn secondary"
              style={{ flex: 1, borderColor: 'var(--border-color)' }}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="comic-btn"
              style={{ 
                flex: 2, 
                backgroundColor: activeColor, 
                borderColor: 'var(--border-color)',
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isMoney ? 'var(--color-money-accent-hover)' : 'var(--color-love-accent-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = activeColor;
              }}
            >
              <Plus size={16} strokeWidth={3} />
              <span>完成儲存</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 30, 20, 0.4)',
    backdropFilter: 'blur(12px) saturate(110%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '24px 16px 40px 16px',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  modalCard: {
    maxWidth: '480px',
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: '28px 24px 24px 24px',
    position: 'relative',
    flexShrink: 0,
    backgroundImage: 'linear-gradient(rgba(44, 30, 20, 0.03) 1px, transparent 1px)',
    backgroundSize: '100% 28px',
    boxShadow: 'var(--shadow-lg)',
    border: 'var(--border-thick)',
    borderRadius: '22px',
  },
  memoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    height: '24px',
  },
  binderRings: {
    display: 'flex',
    gap: '24px',
    marginLeft: '20px',
    marginTop: '-48px',
  },
  ring: {
    width: '14px',
    height: '28px',
    borderRadius: '8px',
    border: '2px solid var(--border-color)',
    backgroundColor: '#F5D061', /* Matte gold color rings */
    boxShadow: 'var(--shadow-xs)',
  },
  closeBtn: {
    padding: '4px',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-xs)',
    border: '2px solid var(--border-color)',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    transition: 'transform 0.15s var(--ease-snappy), box-shadow 0.15s var(--ease-snappy)',
  },
  title: {
    fontSize: '1.45rem',
    fontWeight: '950',
    textAlign: 'center',
    marginBottom: '20px',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  typeSelector: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  typeBtn: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '14px',
    border: '2.5px solid var(--border-color)',
    fontFamily: 'inherit',
    fontWeight: '800',
    fontSize: '0.92rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'transform 0.2s var(--ease-snappy), box-shadow 0.2s var(--ease-snappy), background-color 0.15s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.88rem',
    fontWeight: '900',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  partnerSelector: {
    display: 'flex',
    gap: '12px',
  },
  partnerCard: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none',
    transition: 'all 0.2s var(--ease-snappy)',
  },
  dogIndicator: {
    fontSize: '1.2rem',
  },
  partnerName: {
    fontWeight: '800',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  presetLabel: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
  },
  presetsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  presetTag: {
    background: '#FFFFFF',
    border: '1.8px solid var(--border-color)',
    borderRadius: '10px',
    padding: '5px 10px',
    fontSize: '0.8rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '2.5px 2.5px 0px var(--shadow-color)',
    transition: 'transform 0.18s var(--ease-snappy), box-shadow 0.18s var(--ease-snappy), background-color 0.15s ease',
  },
  presetPoints: {
    backgroundColor: 'var(--bg-primary)',
    border: '1.5px solid var(--border-color)',
    padding: '1px 5px',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '900',
  },
  valueInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  unitText: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  quickPointsRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '4px',
  },
  quickPointBtn: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: '10px',
    backgroundColor: '#FFFFFF',
    fontFamily: 'inherit',
    fontWeight: '800',
    fontSize: '0.78rem',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'transform 0.18s var(--ease-snappy), box-shadow 0.18s var(--ease-snappy), background-color 0.15s ease',
  },
  errorText: {
    color: 'var(--text-primary)',
    backgroundColor: '#FFFFFF',
    padding: '10px 14px',
    borderRadius: '12px',
    border: '2.5px solid var(--border-color)',
    fontSize: '0.85rem',
    fontWeight: '900',
    boxShadow: 'var(--shadow-xs)',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
  },
  guideWrapper: {
    marginTop: '10px',
    width: '100%',
  },
  guideDetails: {
    backgroundColor: '#FFFFFF',
    border: '2px dashed var(--border-color)',
    borderRadius: '12px',
    padding: '10px 14px',
    cursor: 'pointer',
  },
  guideSummary: {
    fontSize: '0.78rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    outline: 'none',
    userSelect: 'none',
  },
  guideContent: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    cursor: 'default',
    borderTop: '1.5px dashed var(--border-color)',
    paddingTop: '8px',
  },
  guideRow: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: '1.45',
    textAlign: 'left',
  },
  currencyRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  currencyBtn: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '10px',
    fontFamily: 'inherit',
    fontWeight: '700',
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'transform 0.18s var(--ease-snappy), background-color 0.15s ease, box-shadow 0.18s var(--ease-snappy)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
