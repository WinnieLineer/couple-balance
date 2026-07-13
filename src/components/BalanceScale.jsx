import React, { useState } from 'react';
import { Landmark, Heart } from 'lucide-react';

export default function BalanceScale({ 
  type, // 'money' or 'love'
  p1Value = 0, 
  p2Value = 0, 
  p1Name = '老公', 
  p2Name = '老婆',
  p1Role = 'white_dog',
  p2Role = 'brown_dog',
  unit = '元',
  label = '付出天秤',
  currency = 'TWD',
  onClick
}) {
  const diff = p1Value - p2Value;
  const absDiff = Math.abs(diff);

  // Exchange rates back to TWD (base currency) for normalized seesaw tilt metrics
  const EXCHANGE_RATES = {
    TWD: 1.0,
    USD: 32.5,
    SGD: 24.0,
  };

  const rate = EXCHANGE_RATES[currency] || 1.0;
  const diffInBase = type === 'money' ? diff * rate : diff;

  // Calculate tilt angle: cap at 18 degrees to prevent excessive tilt
  const maxAngle = 18;
  const scalingFactor = type === 'money' ? 0.005 : 0.1;
  const calculatedAngle = diffInBase * scalingFactor;
  const angle = Math.max(-maxAngle, Math.min(maxAngle, calculatedAngle));

  // Trigonometry for scale pivots
  const rad = (angle * Math.PI) / 180;
  const L = 95; // half-arm length
  const fx = 150; // fulcrum X
  const fy = 65;  // fulcrum Y

  // Left and right pivot points
  const lx = fx - L * Math.cos(rad);
  const ly = fy + L * Math.sin(rad); 
  const rx = fx + L * Math.cos(rad);
  const ry = fy - L * Math.sin(rad); 

  const getCurrencySymbol = (code) => {
    if (code === 'TWD') return 'NT$';
    if (code === 'SGD') return 'S$';
    if (code === 'USD') return 'US$';
    return 'NT$';
  };

  // Helper to format values
  const formatVal = (val) => {
    return type === 'money' 
      ? `${getCurrencySymbol(currency)} ${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}` 
      : `${val} 點`;
  };

  // Helper to render White Dog SVG nodes
  const renderWhiteDog = (isWinning) => (
    <g style={{ transition: 'transform 0.3s ease' }}>
      {/* Ears */}
      <ellipse cx="6" cy="15" rx="4" ry="7" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <ellipse cx="34" cy="15" rx="4" ry="7" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      {/* Head */}
      <ellipse cx="20" cy="22" rx="14" ry="12" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      {/* Eyes */}
      <circle cx="15" cy="20" r="2" fill="var(--border-color)" />
      <circle cx="25" cy="20" r="2" fill="var(--border-color)" />
      {/* Blush (Cozy pink cheek circles!) */}
      <circle cx="10" cy="24" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <circle cx="30" cy="24" r="3.5" fill="#FFB7B2" opacity="0.9" />
      {/* Nose & Mouth */}
      <polygon points="18,23 22,23 20,25" fill="var(--border-color)" />
      <path d="M 18 27 Q 20 29 22 27" fill="none" stroke="var(--border-color)" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Floating Heart if winning */}
      {isWinning && (
        <g transform="translate(10, -14)" className="animate-float">
          <path d="M10 3.22C10 3.22 9.1-1 4.5-1-1.3-1-1.3 5.4 4.5 9 10.3 12.6 10 13.5 10 13.5s-.3-.9 5.5-4.5c5.8-3.6 5.8-10 0-10C10.9-1 10 3.22 10 3.22z" fill="#FF8A8A" stroke="var(--border-color)" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );

  // Helper to render Brown Dog SVG nodes
  const renderBrownDog = (isWinning) => (
    <g style={{ transition: 'transform 0.3s ease' }}>
      {/* Ears */}
      <ellipse cx="6" cy="15" rx="4" ry="7" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <ellipse cx="34" cy="15" rx="4" ry="7" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      {/* Head */}
      <ellipse cx="20" cy="22" rx="14" ry="12" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      {/* Eyes */}
      <circle cx="15" cy="20" r="2" fill="var(--border-color)" />
      <circle cx="25" cy="20" r="2" fill="var(--border-color)" />
      {/* Blush (Cozy pink cheek circles!) */}
      <circle cx="10" cy="24" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <circle cx="30" cy="24" r="3.5" fill="#FFA4A4" opacity="0.9" />
      {/* Nose & Mouth */}
      <polygon points="18,23 22,23 20,25" fill="var(--border-color)" />
      <path d="M 17 26 Q 20 28 23 26" fill="none" stroke="var(--border-color)" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Floating Heart if winning */}
      {isWinning && (
        <g transform="translate(10, -14)" className="animate-float">
          <path d="M10 3.22C10 3.22 9.1-1 4.5-1-1.3-1-1.3 5.4 4.5 9 10.3 12.6 10 13.5 10 13.5s-.3-.9 5.5-4.5c5.8-3.6 5.8-10 0-10C10.9-1 10 3.22 10 3.22z" fill="#FFC857" stroke="var(--border-color)" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );

  const [hoveredDog, setHoveredDog] = useState(null);

  const renderSpeechBubble = (x, y, text, isLeft) => (
    <g transform={`translate(${x}, ${y})`}>
      <g className="animate-pop" style={{ pointerEvents: 'none' }}>
        {/* Speech bubble background */}
        <path 
          d={isLeft 
            ? "M 10 0 L 90 0 A 8 8 0 0 1 98 8 L 98 22 A 8 8 0 0 1 90 30 L 50 30 L 40 38 L 40 30 L 10 30 A 8 8 0 0 1 2 22 L 2 8 A 8 8 0 0 1 10 0 Z" 
            : "M 10 0 L 90 0 A 8 8 0 0 1 98 8 L 98 22 A 8 8 0 0 1 90 30 L 60 30 L 60 38 L 50 30 L 10 30 A 8 8 0 0 1 2 22 L 2 8 A 8 8 0 0 1 10 0 Z"
          }
          fill="#FFFFFF" 
          stroke="var(--border-color)" 
          strokeWidth="2.2" 
          filter="drop-shadow(2px 2px 0px var(--shadow-color))"
        />
        <text 
          x="50" 
          y="19" 
          textAnchor="middle" 
          fontSize="9.5" 
          fontWeight="850" 
          fill="var(--text-primary)"
        >
          {text}
        </text>
      </g>
    </g>
  );

  const headerBg = type === 'money' ? 'var(--color-money-bg)' : 'var(--color-love-bg)';
  const badgeColor = type === 'money' ? 'var(--color-money-accent)' : 'var(--color-love-accent)';

  return (
    <div 
      className="comic-card BalanceScale-card animate-pop" 
      style={{ ...styles.card, cursor: 'pointer' }}
      onClick={onClick}
      title={`點擊快速登記一筆${type === 'money' ? '金錢支出' : '家事心意'}付出`}
    >
      {/* Tiny decorative paper tape for stationary look */}
      <div className="paper-tape" style={{ backgroundColor: type === 'money' ? 'rgba(122, 168, 144, 0.2)' : 'rgba(255, 138, 138, 0.2)' }} />

      <div style={{ ...styles.cardHeader, backgroundColor: headerBg }}>
        <div style={{ ...styles.iconBg, borderColor: 'var(--border-color)' }}>
          {type === 'money' ? <Landmark size={20} color="var(--color-money-accent)" /> : <Heart size={20} color="var(--color-love-accent)" fill="var(--color-love-accent)" />}
        </div>
        <div>
          <h3 style={styles.label}>{label}</h3>
          <p style={styles.subtext}>雙方付出差額與天秤動態 (點擊卡片快速記帳)</p>
        </div>
      </div>

      {/* --- SVG PHYSICAL SCALE --- */}
      <div style={styles.scaleContainer}>
        <svg viewBox="0 0 300 200" style={styles.scaleSvg}>
          {/* 1. Base pedestal (Wood texture) */}
          <path d="M 105 180 L 195 180 L 175 160 L 125 160 Z" fill="#000000" stroke="var(--border-color)" strokeWidth="2.5" strokeLinejoin="round" />
          
          {/* 2. Vertical post */}
          <line x1="150" y1="65" x2="150" y2="162" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
          <line x1="150" y1="65" x2="150" y2="162" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="150" cy="160" r="8" fill="var(--border-color)" />

          {/* 3. Horizontal rotating beam */}
          <line 
            x1={lx} 
            y1={ly} 
            x2={rx} 
            y2={ry} 
            stroke="#FF9F1C" 
            strokeWidth="7" 
            strokeLinecap="round" 
            style={styles.transition}
          />
          <line 
            x1={lx} 
            y1={ly} 
            x2={rx} 
            y2={ry} 
            stroke="var(--border-color)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            style={styles.transition}
          />
          {/* Fulcrum indicator */}
          <circle cx="150" cy="65" r="7" fill="#FFE033" stroke="var(--border-color)" strokeWidth="2.5" />

          {/* --- LEFT PAN (Partner 1) --- */}
          <g style={styles.transition}>
            {/* Strings */}
            <line x1={lx} y1={ly} x2={lx - 25} y2={ly + 60} stroke="var(--border-color)" strokeWidth="2" />
            <line x1={lx} y1={ly} x2={lx + 25} y2={ly + 60} stroke="var(--border-color)" strokeWidth="2" />
            {/* Pan base plate */}
            <path d={`M ${lx - 32} ${ly + 60} C ${lx - 32} ${ly + 72}, ${lx + 32} ${ly + 72}, ${lx + 32} ${ly + 60} Z`} fill="#FFFDF9" stroke="var(--border-color)" strokeWidth="2.5" />

            {/* DYNAMIC DOG FOR P1 */}
            <g 
              transform={`translate(${lx - 20}, ${ly + 20})`}
              onMouseEnter={(e) => { e.stopPropagation(); setHoveredDog('p1'); }}
              onMouseLeave={(e) => { e.stopPropagation(); setHoveredDog(null); }}
              style={{ cursor: 'pointer' }}
            >
              <g className="dog-idle-float-white">
                {p1Role === 'white_dog' ? renderWhiteDog(diff > 0) : renderBrownDog(diff > 0)}
                {hoveredDog === 'p1' && (
                  renderSpeechBubble(-30, -46, type === 'money' ? '記帳啦！汪！🐶' : '洗碗交給我！🐶', true)
                )}
              </g>
            </g>
          </g>

          {/* --- RIGHT PAN (Partner 2) --- */}
          <g style={styles.transition}>
            {/* Strings */}
            <line x1={rx} y1={ry} x2={rx - 25} y2={ry + 60} stroke="var(--border-color)" strokeWidth="2" />
            <line x1={rx} y1={ry} x2={rx + 25} y2={ry + 60} stroke="var(--border-color)" strokeWidth="2" />
            {/* Pan base plate */}
            <path d={`M ${rx - 32} ${ry + 60} C ${rx - 32} ${ry + 72}, ${rx + 32} ${ry + 72}, ${rx + 32} ${ry + 60} Z`} fill="#FFFDF9" stroke="var(--border-color)" strokeWidth="2.5" />

            {/* DYNAMIC DOG FOR P2 */}
            <g 
              transform={`translate(${rx - 20}, ${ry + 20})`}
              onMouseEnter={(e) => { e.stopPropagation(); setHoveredDog('p2'); }}
              onMouseLeave={(e) => { e.stopPropagation(); setHoveredDog(null); }}
              style={{ cursor: 'pointer' }}
            >
              <g className="dog-idle-float-brown">
                {p2Role === 'white_dog' ? renderWhiteDog(diff < 0) : renderBrownDog(diff < 0)}
                {hoveredDog === 'p2' && (
                  renderSpeechBubble(-30, -46, type === 'money' ? '花在哪裡？🐻' : '今天搥背！🐻', false)
                )}
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* --- BALANCE STATE TEXT --- */}
      <div className="BalanceScale-infoArea" style={styles.infoArea}>
        <div style={styles.partnerScore}>
          <div className="p-name" style={styles.pName}>{p1Role === 'white_dog' ? '白狗' : '褐狗'} {p1Name}</div>
          <div className="p-val" style={styles.pVal}>{formatVal(p1Value)}</div>
        </div>

        <div className="balance-status" style={{
          ...styles.balanceStatus,
          backgroundColor: diff === 0 ? 'var(--bg-secondary)' : headerBg,
          borderColor: diff === 0 ? 'var(--border-color)' : badgeColor,
          borderStyle: diff === 0 ? 'solid' : 'dashed',
        }}>
          {diff === 0 ? (
            <div style={styles.perfectState}>完美平衡</div>
          ) : (
            <div style={styles.imbalanceState}>
              <span style={{ fontWeight: '800' }}>
                {diff > 0 ? p1Name : p2Name}
              </span>
              <span> 多付出 </span>
              <span style={styles.differenceText}>
                {type === 'money' ? `${getCurrencySymbol(currency)} ${absDiff.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}` : `${absDiff} ${unit}`}
              </span>
            </div>
          )}
        </div>

        <div style={styles.partnerScore}>
          <div className="p-name" style={{ ...styles.pName, textAlign: 'right' }}>{p2Role === 'white_dog' ? '白狗' : '褐狗'} {p2Name}</div>
          <div className="p-val" style={{ ...styles.pVal, textAlign: 'right' }}>{formatVal(p2Value)}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    border: 'var(--border-thick)',
    boxShadow: 'var(--shadow-flat)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: 'var(--border-thick)',
    padding: '14px 18px',
    margin: '-24px -24px 16px -24px',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
  },
  iconBg: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    border: '2.2px solid var(--border-color)',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-xs)',
  },
  label: {
    fontSize: '1.05rem',
    fontWeight: '900',
    color: 'var(--text-primary)',
  },
  subtext: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
  },
  scaleContainer: {
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0',
  },
  scaleSvg: {
    width: '100%',
    height: '100%',
    maxHeight: '180px',
  },
  transition: {
    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  infoArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '14px',
    borderTop: '2px dashed var(--border-color)',
    gap: '8px',
  },
  partnerScore: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pName: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
  },
  pVal: {
    fontSize: '1rem',
    fontWeight: '950',
    color: 'var(--text-primary)',
  },
  balanceStatus: {
    border: 'var(--border-thick)',
    borderRadius: '12px',
    padding: '6px 12px',
    fontSize: '0.85rem',
    textAlign: 'center',
    boxShadow: 'var(--shadow-xs)',
    transition: 'all 0.22s var(--ease-snappy)',
  },
  perfectState: {
    color: 'var(--text-primary)',
    fontWeight: '900',
  },
  imbalanceState: {
    color: 'var(--text-primary)',
    fontWeight: '700',
  },
  differenceText: {
    fontWeight: '900',
    color: 'var(--text-primary)',
    textDecoration: 'underline',
  }
};
