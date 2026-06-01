import React, { useState, useEffect } from 'react';
import { X, Landmark, Heart, Sparkles, User, Tag, Plus, Check } from 'lucide-react';

const MONEY_PRESETS = [
  { tag: '買菜與日用品', val: '' },
  { tag: '水電瓦斯網路', val: '' },
  { tag: '約會大餐', val: '' },
  { tag: '房租與家居費', val: '' },
  { tag: '交通與加油費', val: '' },
  { tag: '零食飲料生活', val: '' },
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
  defaultByPartner = 'p1'
}) {
  const [recordType, setRecordType] = useState('money'); // 'money' or 'love'
  const [byPartner, setByPartner] = useState(defaultByPartner); // 'p1' (husband) or 'p2' (wife)
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState('TWD');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setByPartner(defaultByPartner);
    }
  }, [isOpen, defaultByPartner]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('請寫下一點簡短項目描述喔！');
      return;
    }

    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) {
      setError(recordType === 'money' ? '請輸入大於 0 的金額數字喔！' : '請輸入大於 0 的心意點數喔！');
      return;
    }

    onAddRecord({
      id: Date.now().toString(),
      type: recordType,
      by: byPartner,
      title: title.trim(),
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

  return (
    <div style={styles.overlay}>
      <div className="comic-card animate-float RecordModal-card" style={styles.modalCard}>
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
            <X size={16} />
          </button>
        </div>

        <h2 className="RecordModal-title" style={styles.title}>新增生活付出記錄</h2>
        
        {/* Type selector tabs */}
        <div className="RecordModal-typeSelector" style={styles.typeSelector}>
          <button 
            type="button" 
            onClick={() => { setRecordType('money'); setValue(''); setError(''); }}
            className="RecordModal-typeBtn"
            style={{ 
              ...styles.typeBtn, 
              backgroundColor: recordType === 'money' ? 'var(--color-light-gray)' : '#FFFFFF',
              borderColor: 'var(--text-primary)'
            }}
          >
            <Landmark size={18} />
            <span>金錢帳單</span>
          </button>

          <button 
            type="button" 
            onClick={() => { setRecordType('love'); setValue(''); setError(''); }}
            className="RecordModal-typeBtn"
            style={{ 
              ...styles.typeBtn, 
              backgroundColor: recordType === 'love' ? 'var(--color-light-gray)' : '#FFFFFF',
              borderColor: 'var(--text-primary)'
            }}
          >
            <Heart size={18} fill={recordType === 'love' ? 'var(--text-primary)' : 'none'} />
            <span>家事與心意</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Who made the effort? */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User size={15} style={{ marginRight: '4px' }} />
              誰為生活付出了呢？
            </label>
            <div className="RecordModal-partnerSelector" style={styles.partnerSelector}>
              <div 
                onClick={() => setByPartner('p1')}
                className="RecordModal-partnerCard"
                style={{ 
                  ...styles.partnerCard, 
                  backgroundColor: byPartner === 'p1' ? 'var(--bg-primary)' : '#FFFFFF',
                  borderColor: byPartner === 'p1' ? 'var(--text-primary)' : 'var(--border-color)',
                  borderWidth: byPartner === 'p1' ? '3px' : '2px'
                }}
              >
                <span className="RecordModal-partnerName" style={styles.partnerName}>{p1Name} ({p1Role === 'white_dog' ? '白狗' : '灰狗'})</span>
                {byPartner === 'p1' && <Check size={16} color="var(--text-primary)" strokeWidth={3} />}
              </div>

              <div 
                onClick={() => setByPartner('p2')}
                className="RecordModal-partnerCard"
                style={{ 
                  ...styles.partnerCard, 
                  backgroundColor: byPartner === 'p2' ? 'var(--bg-primary)' : '#FFFFFF',
                  borderColor: byPartner === 'p2' ? 'var(--text-primary)' : 'var(--border-color)',
                  borderWidth: byPartner === 'p2' ? '3px' : '2px'
                }}
              >
                <span className="RecordModal-partnerName" style={styles.partnerName}>{p2Name} ({p2Role === 'white_dog' ? '白狗' : '灰狗'})</span>
                {byPartner === 'p2' && <Check size={16} color="var(--text-primary)" strokeWidth={3} />}
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
              placeholder={recordType === 'money' ? '例如：買全聯菜肉、繳電費...' : '例如：掃地洗衣服、搥背...' }
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="comic-input" 
              maxLength="30"
            />
          </div>

          {/* Quick presets */}
          <div style={styles.formGroup}>
            <label style={styles.presetLabel}>推薦快捷標籤：</label>
            <div style={styles.presetsList}>
              {(recordType === 'money' ? MONEY_PRESETS : LOVE_PRESETS).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(item)}
                  className="RecordModal-presetTag"
                  style={styles.presetTag}
                >
                  {item.tag}
                  {item.points && <span style={styles.presetPoints}>+{item.points}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Currency selection for money */}
          {recordType === 'money' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>
                交易幣別
              </label>
              <div className="RecordModal-currencyRow" style={styles.currencyRow}>
                {[
                  { code: 'TWD', name: 'TWD (NT$)' },
                  { code: 'SGD', name: 'SGD (S$)' },
                  { code: 'USD', name: 'USD (US$)' }
                ].map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency(curr.code)}
                    className="RecordModal-currencyBtn"
                    style={{
                      ...styles.currencyBtn,
                      backgroundColor: currency === curr.code ? '#000000' : '#FFFFFF',
                      color: currency === curr.code ? '#FFFFFF' : '#000000',
                      border: '2.5px solid #000000',
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
              {recordType === 'money' ? '付出金額' : '努力點數 (心意值)'}
            </label>
            <div style={styles.valueInputRow}>
              <input 
                type="number" 
                placeholder={recordType === 'money' ? `${currency === 'TWD' ? 'NT$' : currency === 'SGD' ? 'S$' : 'US$'} 金額` : '點數值'} 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                className="comic-input" 
                min="1"
                step="any"
              />
              {recordType === 'money' && (
                <span style={styles.unitText}>
                  {currency === 'TWD' ? '元 (TWD)' : currency === 'SGD' ? '元 (SGD)' : '元 (USD)'}
                </span>
              )}
            </div>

            {/* Quick point triggers for chores */}
            {recordType === 'love' && (
              <div style={styles.quickPointsRow}>
                {[5, 10, 15, 20, 30].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => handleQuickPoints(pts)}
                    className="RecordModal-quickPointBtn"
                    style={styles.quickPointBtn}
                  >
                    +{pts} 點
                  </button>
                ))}
              </div>
            )}

            {/* HEART POINT COZY EVALUATION GUIDE */}
            {recordType === 'love' && (
              <div style={styles.guideWrapper}>
                <details style={styles.guideDetails}>
                  <summary style={styles.guideSummary}>
                    不知道點數如何評估？點我看對照指南
                  </summary>
                  <div style={styles.guideContent}>
                    <div style={styles.guideRow}><strong>+5 點 (輕微心意)</strong>：倒垃圾、順手倒溫水、買咖啡、洗水果</div>
                    <div style={styles.guideRow}><strong>+10 點 (日常付出)</strong>：辛苦洗碗、吸地拖地、洗曬衣服、整理房間</div>
                    <div style={styles.guideRow}><strong>+20 點 (深度奉獻)</strong>：親自下廚做飯、專車接送、搥背按摩半小時</div>
                    <div style={styles.guideRow}><strong>+30 點 (史詩級寵愛)</strong>：大掃除整理全家、生病通宵照顧、驚喜手工禮</div>
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
              style={{ flex: 1 }}
            >
              取消
            </button>
            <button 
              type="submit" 
              className={`comic-btn ${recordType === 'love' ? 'pink' : ''}`}
              style={{ flex: 2 }}
            >
              <Plus size={16} />
              <span>儲存紀錄</span>
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
    backgroundColor: 'rgba(93, 74, 62, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modalCard: {
    maxWidth: '480px',
    width: '100%',
    backgroundColor: '#FFFDF9', // Memo pad yellow-ish white
    padding: '24px',
    position: 'relative',
    backgroundImage: 'linear-gradient(rgba(93, 74, 62, 0.05) 1px, transparent 1px)',
    backgroundSize: '100% 28px', // lined notebook paper style!
    boxShadow: '8px 8px 0px #5D4A3E',
  },
  memoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    height: '24px',
  },
  binderRings: {
    display: 'flex',
    gap: '24px',
    marginLeft: '20px',
    marginTop: '-44px', // Float ring decoration
  },
  ring: {
    width: '14px',
    height: '28px',
    borderRadius: '8px',
    border: '3px solid #5D4A3E',
    backgroundColor: '#E8E2D5',
    boxShadow: '1.5px 1.5px 0px #5D4A3E',
  },
  closeBtn: {
    padding: '4px',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '2px 2px 0px #5D4A3E',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '18px',
    color: 'var(--text-primary)',
  },
  typeSelector: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  typeBtn: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '12px',
    border: '3px solid #5D4A3E',
    fontFamily: 'inherit',
    fontWeight: '700',
    fontSize: '0.92rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '2px 2px 0px #5D4A3E',
    color: '#5D4A3E',
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
    fontWeight: '700',
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
    padding: '10px',
    borderRadius: '12px',
    border: '2px solid var(--border-color)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none',
    transition: 'all 0.1s ease',
  },
  dogIndicator: {
    fontSize: '1.2rem',
  },
  partnerName: {
    fontWeight: '700',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  presetLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
  },
  presetsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  presetTag: {
    background: '#FFFFFF',
    border: '2.5px solid var(--text-primary)',
    borderRadius: '10px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '1.5px 1.5px 0px var(--text-primary)',
    transition: 'transform 0.1s',
  },
  presetPoints: {
    backgroundColor: 'var(--color-pink)',
    padding: '1px 4px',
    borderRadius: '6px',
    fontSize: '0.75rem',
  },
  valueInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  unitText: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  quickPointsRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '4px',
  },
  quickPointBtn: {
    flex: 1,
    padding: '4px 6px',
    borderRadius: '8px',
    border: '2px solid #5D4A3E',
    backgroundColor: '#FFFFFF',
    fontFamily: 'inherit',
    fontWeight: '700',
    fontSize: '0.78rem',
    cursor: 'pointer',
    color: '#5D4A3E',
    boxShadow: '1.5px 1.5px 0px #5D4A3E',
    transition: 'transform 0.1s',
  },
  errorText: {
    color: '#D8000C',
    backgroundColor: '#FFD2D2',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '2px solid #D8000C',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
  },
  // Guide styles
  guideWrapper: {
    marginTop: '10px',
    width: '100%',
  },
  guideDetails: {
    backgroundColor: '#FAF6EE',
    border: '2px dashed #E5A96E',
    borderRadius: '10px',
    padding: '8px 12px',
    cursor: 'pointer',
  },
  guideSummary: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#5D4A3E',
    outline: 'none',
    userSelect: 'none',
  },
  guideContent: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    cursor: 'default',
    borderTop: '1px dashed #E5A96E',
    paddingTop: '6px',
  },
  guideRow: {
    fontSize: '0.75rem',
    color: '#8E7E73',
    lineHeight: '1.4',
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
    boxShadow: '2px 2px 0px #000000',
    transition: 'transform 0.1s, background-color 0.1s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
