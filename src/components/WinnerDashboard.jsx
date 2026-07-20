import React, { useState } from 'react';

export default function WinnerDashboard({ 
  p1Money = 0, 
  p2Money = 0, 
  p1Love = 0, 
  p2Love = 0,
  p1Name = '老公',
  p2Name = '老婆',
  p1Role = 'white_dog',
  p2Role = 'brown_dog',
  currency = 'TWD',
  lovePointRate = 25,
  exchangeRates,
  showSummary = true,
  showIndividualStats = true
}) {
  const [hoveredDog, setHoveredDog] = useState(null);

  const moneyDiff = p1Money - p2Money;
  const loveDiff = p1Love - p2Love;
  
  const p1Total = p1Money + (p1Love * lovePointRate);
  const p2Total = p2Money + (p2Love * lovePointRate);
  const totalDiff = p1Total - p2Total;

  const getCurrencySymbol = (code) => {
    if (code === 'TWD') return 'NT$';
    if (code === 'SGD') return 'S$';
    if (code === 'USD') return 'US$';
    if (code === 'CNY') return '¥';
    return 'NT$';
  };

  const symbol = getCurrencySymbol(currency);

  // --- SCALE ROTATION MATH ---
  const rates = exchangeRates || { TWD: 1.0, USD: 32.5, SGD: 24.0, CNY: 4.5 };
  const rate = rates[currency] || 1.0;
  
  // Calculate tilt angle: cap at 18 degrees to prevent excessive tilt.
  // Since totalDiff is in display currency, we convert to base TWD to use normalized tilt factor.
  const diffInBase = totalDiff * (currency === 'TWD' ? 1.0 : rate);
  const maxAngle = 18;
  const scalingFactor = 0.005; // same scaling factor as money
  const calculatedAngle = diffInBase * scalingFactor;
  const angle = Math.max(-maxAngle, Math.min(maxAngle, calculatedAngle));

  const rad = (angle * Math.PI) / 180;
  const L = 95; // half-arm length
  const fx = 150; // fulcrum X
  const fy = 65;  // fulcrum Y

  // Left and right pivot points
  const lx = fx - L * Math.cos(rad);
  const ly = fy + L * Math.sin(rad); 
  const rx = fx + L * Math.cos(rad);
  const ry = fy - L * Math.sin(rad); 

  // Speeches based on who is leading total contribution
  const getP1SpeechText = () => {
    if (totalDiff > 0) {
      return p1Role === 'white_dog' ? '付出超多！汪！🐶' : '付出超多！🐻';
    } else if (totalDiff < 0) {
      return p1Role === 'white_dog' ? '多謝伴侶！🐶' : '多謝伴侶！🐻';
    } else {
      return p1Role === 'white_dog' ? '完美平衡！🐶' : '完美平衡！🐻';
    }
  };

  const getP2SpeechText = () => {
    if (totalDiff < 0) {
      return p2Role === 'white_dog' ? '付出超多！汪！🐶' : '付出超多！🐻';
    } else if (totalDiff > 0) {
      return p2Role === 'white_dog' ? '多謝伴侶！🐶' : '多謝伴侶！🐻';
    } else {
      return p2Role === 'white_dog' ? '完美平衡！🐶' : '完美平衡！🐻';
    }
  };

  // --- SVG Badge Renderers ---
  const renderWhiteDogBadge = () => (
    <svg viewBox="0 0 100 80" style={styles.dogBadgeSvg}>
      <ellipse cx="50" cy="55" rx="20" ry="15" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="3.5" />
      <circle cx="34" cy="62" r="7" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <path d="M 30 55 Q 20 50 25 42" fill="none" stroke="var(--border-color)" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="30" cy="28" rx="6" ry="10" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="3.5" />
      <ellipse cx="70" cy="28" rx="6" ry="10" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="3.5" />
      <ellipse cx="50" cy="35" rx="20" ry="17" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="3.5" />
      <circle cx="43" cy="33" r="3" fill="var(--border-color)" />
      <circle cx="57" cy="33" r="3" fill="var(--border-color)" />
      <circle cx="38" cy="37" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <circle cx="62" cy="37" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <polygon points="48,37 52,37 50,40" fill="var(--border-color)" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="68" r="6" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
    </svg>
  );

  const renderGrayDogBadge = () => (
    <svg viewBox="0 0 100 80" style={styles.dogBadgeSvg}>
      <ellipse cx="50" cy="55" rx="20" ry="15" fill="#D4A373" stroke="var(--border-color)" strokeWidth="3.5" />
      <circle cx="34" cy="62" r="7" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <path d="M 30 55 Q 20 50 25 42" fill="none" stroke="var(--border-color)" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="30" cy="28" rx="6" ry="10" fill="#D4A373" stroke="var(--border-color)" strokeWidth="3.5" />
      <ellipse cx="70" cy="28" rx="6" ry="10" fill="#D4A373" stroke="var(--border-color)" strokeWidth="3.5" />
      <ellipse cx="50" cy="35" rx="20" ry="17" fill="#D4A373" stroke="var(--border-color)" strokeWidth="3.5" />
      <circle cx="43" cy="33" r="3" fill="var(--border-color)" />
      <circle cx="57" cy="33" r="3" fill="var(--border-color)" />
      <circle cx="38" cy="37" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <circle cx="62" cy="37" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <polygon points="48,37 52,37 50,40" fill="var(--border-color)" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="68" r="6" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
    </svg>
  );

  // --- Scale Dog SVGs ---
  const renderWhiteDog = (isWinning) => (
    <g style={{ transition: 'transform 0.3s ease' }}>
      <ellipse cx="6" cy="15" rx="4" ry="7" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <ellipse cx="34" cy="15" rx="4" ry="7" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <ellipse cx="20" cy="22" rx="14" ry="12" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <circle cx="15" cy="20" r="2" fill="var(--border-color)" />
      <circle cx="25" cy="20" r="2" fill="var(--border-color)" />
      <circle cx="10" cy="24" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <circle cx="30" cy="24" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <polygon points="18,23 22,23 20,25" fill="var(--border-color)" />
      <path d="M 18 27 Q 20 29 22 27" fill="none" stroke="var(--border-color)" strokeWidth="1.5" strokeLinecap="round" />
      {isWinning && (
        <g transform="translate(10, -14)" className="animate-float">
          <path d="M10 3.22C10 3.22 9.1-1 4.5-1-1.3-1-1.3 5.4 4.5 9 10.3 12.6 10 13.5 10 13.5s-.3-.9 5.5-4.5c5.8-3.6 5.8-10 0-10C10.9-1 10 3.22 10 3.22z" fill="#FF8A8A" stroke="var(--border-color)" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );

  const renderBrownDog = (isWinning) => (
    <g style={{ transition: 'transform 0.3s ease' }}>
      <ellipse cx="6" cy="15" rx="4" ry="7" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <ellipse cx="34" cy="15" rx="4" ry="7" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <ellipse cx="20" cy="22" rx="14" ry="12" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <circle cx="15" cy="20" r="2" fill="var(--border-color)" />
      <circle cx="25" cy="20" r="2" fill="var(--border-color)" />
      <circle cx="10" cy="24" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <circle cx="30" cy="24" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <polygon points="18,23 22,23 20,25" fill="var(--border-color)" />
      <path d="M 17 26 Q 20 28 23 26" fill="none" stroke="var(--border-color)" strokeWidth="1.5" strokeLinecap="round" />
      {isWinning && (
        <g transform="translate(10, -14)" className="animate-float">
          <path d="M10 3.22C10 3.22 9.1-1 4.5-1-1.3-1-1.3 5.4 4.5 9 10.3 12.6 10 13.5 10 13.5s-.3-.9 5.5-4.5c5.8-3.6 5.8-10 0-10C10.9-1 10 3.22 10 3.22z" fill="#FFC857" stroke="var(--border-color)" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );

  const renderSpeechBubble = (x, y, text, isLeft) => (
    <g transform={`translate(${x}, ${y})`}>
      <g className="animate-pop" style={{ pointerEvents: 'none' }}>
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

  return (
    <div style={styles.container}>
      {/* 1. Difference Analysis (Top, Full Width) */}
      {showSummary && (
        <div className="comic-card WinnerDashboard-summaryCard" style={styles.summaryCard}>
          <div style={styles.banner}>
            <span style={styles.bannerText}>⚖️ 雙方付出差額分析</span>
          </div>

          {/* INTEGRATED TOTAL CONTRIBUTION BALANCE SCALE */}
          <div style={styles.scaleCardContainer}>
            <div style={styles.scaleCardLabel}>
              ⚖️ 生活總貢獻天秤 (綜合折算：金錢支出 + 家事價值)
            </div>
            <div style={styles.scaleContainer}>
              <svg viewBox="0 0 300 200" style={styles.scaleSvg}>
                {/* Pedestal */}
                <path d="M 105 180 L 195 180 L 175 160 L 125 160 Z" fill="#000000" stroke="var(--border-color)" strokeWidth="2.5" strokeLinejoin="round" />
                
                {/* Vertical post */}
                <line x1="150" y1="65" x2="150" y2="162" stroke="#000000" strokeWidth="7" strokeLinecap="round" />
                <line x1="150" y1="65" x2="150" y2="162" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="150" cy="160" r="8" fill="var(--border-color)" />

                {/* Horizontal rotating beam */}
                <line 
                  x1={lx} 
                  y1={ly} 
                  x2={rx} 
                  y2={ry} 
                  stroke="#FF9F1C" 
                  strokeWidth="7" 
                  strokeLinecap="round" 
                  style={styles.scaleTransition}
                />
                <line 
                  x1={lx} 
                  y1={ly} 
                  x2={rx} 
                  y2={ry} 
                  stroke="var(--border-color)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  style={styles.scaleTransition}
                />
                {/* Fulcrum indicator */}
                <circle cx="150" cy="65" r="7" fill="#FFE033" stroke="var(--border-color)" strokeWidth="2.5" />

                {/* LEFT PAN (Partner 1) */}
                <g style={styles.scaleTransition}>
                  <line x1={lx} y1={ly} x2={lx - 25} y2={ly + 60} stroke="var(--border-color)" strokeWidth="2" />
                  <line x1={lx} y1={ly} x2={lx + 25} y2={ly + 60} stroke="var(--border-color)" strokeWidth="2" />
                  <path d={`M ${lx - 32} ${ly + 60} C ${lx - 32} ${ly + 72}, ${lx + 32} ${ly + 72}, ${lx + 32} ${ly + 60} Z`} fill="#FFFDF9" stroke="var(--border-color)" strokeWidth="2.5" />

                  <g 
                    transform={`translate(${lx - 20}, ${ly + 20})`}
                    onMouseEnter={() => setHoveredDog('p1')}
                    onMouseLeave={() => setHoveredDog(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <g className="dog-idle-float-white">
                      {p1Role === 'white_dog' ? renderWhiteDog(totalDiff > 0) : renderBrownDog(totalDiff > 0)}
                      {hoveredDog === 'p1' && (
                        renderSpeechBubble(-30, -46, getP1SpeechText(), true)
                      )}
                    </g>
                  </g>
                </g>

                {/* RIGHT PAN (Partner 2) */}
                <g style={styles.scaleTransition}>
                  <line x1={rx} y1={ry} x2={rx - 25} y2={ry + 60} stroke="var(--border-color)" strokeWidth="2" />
                  <line x1={rx} y1={ry} x2={rx + 25} y2={ry + 60} stroke="var(--border-color)" strokeWidth="2" />
                  <path d={`M ${rx - 32} ${ry + 60} C ${rx - 32} ${ry + 72}, ${rx + 32} ${ry + 72}, ${rx + 32} ${ry + 60} Z`} fill="#FFFDF9" stroke="var(--border-color)" strokeWidth="2.5" />

                  <g 
                    transform={`translate(${rx - 20}, ${ry + 20})`}
                    onMouseEnter={() => setHoveredDog('p2')}
                    onMouseLeave={() => setHoveredDog(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <g className="dog-idle-float-brown">
                      {p2Role === 'white_dog' ? renderWhiteDog(totalDiff < 0) : renderBrownDog(totalDiff < 0)}
                      {hoveredDog === 'p2' && (
                        renderSpeechBubble(-30, -46, getP2SpeechText(), false)
                      )}
                    </g>
                  </g>
                </g>
              </svg>
            </div>
          </div>

          <div style={styles.summaryBody}>
            {/* Money Balance */}
            <div style={styles.summaryItem}>
              <span style={styles.balanceLabel}>💰 共同生活金錢差額比對</span>
              <div style={styles.balanceValueContainer}>
                {moneyDiff === 0 ? (
                  <span style={styles.balancedText}>🎉 雙方目前的金錢支出達到完美平衡！</span>
                ) : (
                  <span style={styles.imbalancedText}>
                    <strong>{moneyDiff > 0 ? p1Name : p2Name}</strong> 比對手多支出了 <strong style={styles.highlight}>{symbol} {Math.abs(moneyDiff).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</strong>
                  </span>
                )}
              </div>
            </div>
            
            <div style={styles.dividerLine} />

            {/* Chore Balance */}
            <div style={styles.summaryItem}>
              <span style={styles.balanceLabel}>🧹 家事勞動差額與價值折算</span>
              <div style={styles.balanceValueContainer}>
                {loveDiff === 0 ? (
                  <span style={styles.balancedText}>🎉 雙方付出家事勞動已完美平衡！</span>
                ) : (
                  <span style={styles.imbalancedText}>
                    <strong>{loveDiff > 0 ? p1Name : p2Name}</strong> 多付出了 <strong style={styles.highlight}>{Math.abs(loveDiff)} 點</strong> 的家事勞動 (折合 <strong style={styles.highlight}>{symbol} {(Math.abs(loveDiff) * lovePointRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</strong> 勞動價值)
                  </span>
                )}
              </div>
            </div>

            <div style={styles.dividerLine} />

            {/* Combined Net Contribution Balance */}
            <div style={styles.summaryItem}>
              <span style={styles.balanceLabel}>⚖️ 雙方金錢與家事勞動綜合折算 (生活總貢獻)</span>
              <div style={styles.balanceValueContainer}>
                {totalDiff === 0 ? (
                  <span style={styles.balancedText}>🎉 雙方金錢與勞動綜合付出已完美平衡！</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={styles.imbalancedText}>
                      <strong>{totalDiff > 0 ? p1Name : p2Name}</strong> 綜合付出（金錢 + 勞動折算）高出 <strong style={styles.highlight}>{symbol} {Math.abs(totalDiff).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</strong>
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '750', marginTop: '2px' }}>
                      💡 計算公式：實際金錢支出 + (家事勞動點數 × {symbol}{lovePointRate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / 點)
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {showIndividualStats && (
        <div className="WinnerDashboard-columnsGrid" style={styles.columnsGrid}>
          {/* P1 Column Card */}
          <div className="comic-card WinnerDashboard-statsCard" style={styles.statsCard}>
            <div style={styles.cardHeader}>
              <div style={styles.avatarWrapper}>
                {p1Role === 'white_dog' ? renderWhiteDogBadge() : renderGrayDogBadge()}
              </div>
              <span style={styles.roleName}>{p1Name}</span>
            </div>
            <div style={styles.statsBody}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>金錢累計支出</span>
                <span style={styles.statValue}>{symbol} {p1Money.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>家事勞動點數</span>
                <span style={styles.statValue}>{p1Love} 點 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>({symbol} {(p1Love * lovePointRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })})</span></span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>綜合付出價值</span>
                <span style={{ ...styles.statValue, color: 'var(--color-money-accent-hover)' }}>{symbol} {p1Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</span>
              </div>
            </div>
          </div>

          {/* P2 Column Card */}
          <div className="comic-card WinnerDashboard-statsCard" style={styles.statsCard}>
            <div style={styles.cardHeader}>
              <div style={styles.avatarWrapper}>
                {p2Role === 'white_dog' ? renderWhiteDogBadge() : renderGrayDogBadge()}
              </div>
              <span style={styles.roleName}>{p2Name}</span>
            </div>
            <div style={styles.statsBody}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>金錢累計支出</span>
                <span style={styles.statValue}>{symbol} {p2Money.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>家事勞動點數</span>
                <span style={styles.statValue}>{p2Love} 點 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>({symbol} {(p2Love * lovePointRate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })})</span></span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>綜合付出價值</span>
                <span style={{ ...styles.statValue, color: 'var(--color-money-accent-hover)' }}>{symbol} {p2Total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</span>
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
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '24px',
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--text-primary)',
    borderRadius: '10px',
    padding: '8px 16px',
    marginBottom: '16px',
    boxShadow: 'var(--shadow-xs)',
  },
  bannerText: {
    fontWeight: '900',
    fontSize: '0.95rem',
    letterSpacing: '1px',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  columnsGrid: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  statsCard: {
    flex: '1 1 240px',
    backgroundColor: '#FFFFFF',
    padding: '18px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.22s var(--ease-snappy), box-shadow 0.22s var(--ease-snappy)',
  },
  summaryCard: {
    width: '100%',
    backgroundColor: 'var(--bg-secondary)',
    backgroundImage: 'linear-gradient(rgba(214, 154, 107, 0.12) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(214, 154, 107, 0.12) 1.5px, transparent 1.5px)',
    backgroundSize: '16px 16px',
    padding: '22px 26px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.22s var(--ease-snappy), box-shadow 0.22s var(--ease-snappy)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: 'var(--border-thick)',
    paddingBottom: '10px',
  },
  avatarWrapper: {
    width: '40px',
    height: '32px',
  },
  dogBadgeSvg: {
    width: '100%',
    height: '100%',
  },
  roleName: {
    fontWeight: '900',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    letterSpacing: '0.5px',
  },
  statsBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: '800',
  },
  statValue: {
    fontSize: '1.45rem',
    fontWeight: '950',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  summaryBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  balanceLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: '900',
    letterSpacing: '0.5px',
  },
  balanceValueContainer: {
    fontSize: '1.1rem',
    color: 'var(--text-primary)',
    fontWeight: '800',
  },
  balancedText: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'var(--text-primary)',
    color: '#FFFFFF',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '900',
    border: '2.5px solid var(--border-color)',
    boxShadow: 'var(--shadow-xs)',
  },
  imbalancedText: {
    color: 'var(--text-primary)',
    fontWeight: '800',
  },
  highlight: {
    fontWeight: '950',
    color: 'var(--text-primary)',
    textDecoration: 'underline',
    fontSize: '1.25rem',
  },
  dividerLine: {
    height: '0px',
    borderTop: '2px dashed var(--border-color)',
    margin: '4px 0',
  },
  scaleCardContainer: {
    backgroundColor: '#FFFFFF',
    border: '2.5px solid var(--border-color)',
    borderRadius: '16px',
    padding: '12px 12px 6px 12px',
    marginBottom: '10px',
    boxShadow: 'var(--shadow-xs)',
  },
  scaleCardLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: '4px',
    letterSpacing: '0.5px',
  },
  scaleContainer: {
    height: '170px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0',
  },
  scaleSvg: {
    width: '100%',
    height: '100%',
    maxHeight: '170px',
  },
  scaleTransition: {
    transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  }
};
