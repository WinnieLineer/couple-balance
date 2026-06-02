import React from 'react';
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
  currency = 'TWD'
}) {
  const diff = p1Value - p2Value;
  const absDiff = Math.abs(diff);

  // Calculate tilt angle: cap at 18 degrees to prevent excessive tilt
  const maxAngle = 18;
  const scalingFactor = type === 'money' ? 0.005 : 0.1;
  const calculatedAngle = diff * scalingFactor;
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
    <g>
      {/* Ears */}
      <ellipse cx="6" cy="15" rx="4" ry="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
      <ellipse cx="34" cy="15" rx="4" ry="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
      {/* Head */}
      <ellipse cx="20" cy="22" rx="14" ry="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
      {/* Eyes */}
      <circle cx="15" cy="20" r="2" fill="#000000" />
      <circle cx="25" cy="20" r="2" fill="#000000" />
      {/* Blush (B&W comic slash lines instead of pink circle!) */}
      <line x1="8" y1="23" x2="11" y2="25" stroke="#000000" strokeWidth="1.5" />
      <line x1="9" y1="25" x2="12" y2="27" stroke="#000000" strokeWidth="1.5" />
      <line x1="28" y1="23" x2="31" y2="25" stroke="#000000" strokeWidth="1.5" />
      <line x1="29" y1="25" x2="32" y2="27" stroke="#000000" strokeWidth="1.5" />
      {/* Nose & Mouth */}
      <polygon points="18,23 22,23 20,25" fill="#000000" />
      <path d="M 18 27 Q 20 29 22 27" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Sparkle if winning */}
      {isWinning && (
        <g transform="translate(14, -5)">
          <path d="M 5,0 L 6,3 L 9,4 L 6,5 L 5,8 L 4,5 L 1,4 L 4,3 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
        </g>
      )}
    </g>
  );

  // Helper to render Brown Dog SVG nodes
  const renderBrownDog = (isWinning) => (
    <g>
      {/* Ears */}
      <ellipse cx="6" cy="15" rx="4" ry="7" fill="var(--color-love-gray)" stroke="#000000" strokeWidth="2.5" />
      <ellipse cx="34" cy="15" rx="4" ry="7" fill="var(--color-love-gray)" stroke="#000000" strokeWidth="2.5" />
      {/* Head */}
      <ellipse cx="20" cy="22" rx="14" ry="12" fill="var(--color-love-gray)" stroke="#000000" strokeWidth="2.5" />
      {/* Eyes */}
      <circle cx="15" cy="20" r="2" fill="#000000" />
      <circle cx="25" cy="20" r="2" fill="#000000" />
      {/* Blush (B&W comic slash lines!) */}
      <line x1="8" y1="23" x2="11" y2="25" stroke="#000000" strokeWidth="1.5" />
      <line x1="9" y1="25" x2="12" y2="27" stroke="#000000" strokeWidth="1.5" />
      <line x1="28" y1="23" x2="31" y2="25" stroke="#000000" strokeWidth="1.5" />
      <line x1="29" y1="25" x2="32" y2="27" stroke="#000000" strokeWidth="1.5" />
      {/* Nose & Mouth */}
      <polygon points="18,23 22,23 20,25" fill="#000000" />
      <path d="M 17 26 Q 20 28 23 26" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Sparkle if winning */}
      {isWinning && (
        <g transform="translate(14, -5)">
          <path d="M 5,0 L 6,3 L 9,4 L 6,5 L 5,8 L 4,5 L 1,4 L 4,3 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
        </g>
      )}
    </g>
  );

  return (
    <div className="comic-card" style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.iconBg}>
          {type === 'money' ? <Landmark size={20} color="#000000" /> : <Heart size={20} color="#000000" fill="#000000" />}
        </div>
        <div>
          <h3 style={styles.label}>{label}</h3>
          <p style={styles.subtext}>雙方付出差額與天秤動態</p>
        </div>
      </div>

      {/* --- SVG PHYSICAL SCALE --- */}
      <div style={styles.scaleContainer}>
        <svg viewBox="0 0 300 200" style={styles.scaleSvg}>
          {/* 1. Base pedestal */}
          <path d="M 110 180 L 190 180 L 175 160 L 125 160 Z" fill="#000000" />
          {/* 2. Vertical post */}
          <line x1="150" y1="65" x2="150" y2="165" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
          <circle cx="150" cy="160" r="8" fill="#000000" />

          {/* 3. Horizontal rotating beam */}
          <line 
            x1={lx} 
            y1={ly} 
            x2={rx} 
            y2={ry} 
            stroke="#000000" 
            strokeWidth="5" 
            strokeLinecap="round" 
            style={styles.transition}
          />
          {/* Fulcrum indicator */}
          <circle cx="150" cy="65" r="7" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" />

          {/* --- LEFT PAN (Partner 1) --- */}
          <g style={styles.transition}>
            {/* Strings */}
            <line x1={lx} y1={ly} x2={lx - 25} y2={ly + 60} stroke="#000000" strokeWidth="2.5" />
            <line x1={lx} y1={ly} x2={lx + 25} y2={ly + 60} stroke="#000000" strokeWidth="2.5" />
            {/* Pan base plate */}
            <path d={`M ${lx - 32} ${ly + 60} C ${lx - 32} ${ly + 72}, ${lx + 32} ${ly + 72}, ${lx + 32} ${ly + 60} Z`} fill="#FFFFFF" stroke="#000000" strokeWidth="3" />

            {/* DYNAMIC DOG FOR P1 */}
            <g transform={`translate(${lx - 20}, ${ly + 20})`}>
              {p1Role === 'white_dog' ? renderWhiteDog(diff > 0) : renderBrownDog(diff > 0)}
            </g>
          </g>

          {/* --- RIGHT PAN (Partner 2) --- */}
          <g style={styles.transition}>
            {/* Strings */}
            <line x1={rx} y1={ry} x2={rx - 25} y2={ry + 60} stroke="#000000" strokeWidth="2.5" />
            <line x1={rx} y1={ry} x2={rx + 25} y2={ry + 60} stroke="#000000" strokeWidth="2.5" />
            {/* Pan base plate */}
            <path d={`M ${rx - 32} ${ry + 60} C ${rx - 32} ${ry + 72}, ${rx + 32} ${ry + 72}, ${rx + 32} ${ry + 60} Z`} fill="#FFFFFF" stroke="#000000" strokeWidth="3" />

            {/* DYNAMIC DOG FOR P2 */}
            <g transform={`translate(${rx - 20}, ${ry + 20})`}>
              {p2Role === 'white_dog' ? renderWhiteDog(diff < 0) : renderBrownDog(diff < 0)}
            </g>
          </g>
        </svg>
      </div>

      {/* --- BALANCE STATE TEXT --- */}
      <div className="BalanceScale-infoArea" style={styles.infoArea}>
        <div style={styles.partnerScore}>
          <div className="p-name" style={styles.pName}>{p1Role === 'white_dog' ? '白狗' : '灰狗'} {p1Name}</div>
          <div className="p-val" style={styles.pVal}>{formatVal(p1Value)}</div>
        </div>

        <div className="balance-status" style={styles.balanceStatus}>
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
          <div className="p-name" style={{ ...styles.pName, textAlign: 'right' }}>{p2Role === 'white_dog' ? '白狗' : '灰狗'} {p2Name}</div>
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
    border: '3px solid #000000',
    boxShadow: '4px 4px 0px #000000',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '2.5px dashed var(--border-color)',
    paddingBottom: '12px',
    marginBottom: '12px',
  },
  iconBg: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    border: '2.5px solid #000000',
    backgroundColor: 'var(--color-light-gray)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#000000',
  },
  subtext: {
    fontSize: '0.8rem',
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
    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.15)',
  },
  infoArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '12px',
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
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#000000',
  },
  balanceStatus: {
    backgroundColor: 'var(--bg-primary)',
    border: '3px solid #000000',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '0.85rem',
    textAlign: 'center',
    boxShadow: '2px 2px 0px #000000',
  },
  perfectState: {
    color: '#000000',
    fontWeight: '800',
  },
  imbalanceState: {
    color: '#000000',
    fontWeight: '700',
  },
  differenceText: {
    fontWeight: '800',
    color: '#000000',
    textDecoration: 'underline',
  }
};
