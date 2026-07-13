import React from 'react';

export default function WinnerDashboard({ 
  p1Money = 0, 
  p2Money = 0, 
  p1Love = 0, 
  p2Love = 0,
  p1Name = '老公',
  p2Name = '老婆',
  p1Role = 'white_dog',
  p2Role = 'brown_dog',
  currency = 'TWD'
}) {
  const moneyDiff = p1Money - p2Money;
  const loveDiff = p1Love - p2Love;

  const getCurrencySymbol = (code) => {
    if (code === 'TWD') return 'NT$';
    if (code === 'SGD') return 'S$';
    if (code === 'USD') return 'US$';
    return 'NT$';
  };

  const symbol = getCurrencySymbol(currency);

  // White Dog SVG Badge (Quiet, B&W outline style with blush)
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
      {/* Cheeks */}
      <circle cx="38" cy="37" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <circle cx="62" cy="37" r="3.5" fill="#FFB7B2" opacity="0.9" />
      <polygon points="48,37 52,37 50,40" fill="var(--border-color)" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="68" r="6" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#FFFFFF" stroke="var(--border-color)" strokeWidth="2.5" />
    </svg>
  );

  // Gray Dog SVG Badge (Quiet, B&W line-art style with blush and caramel fill)
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
      {/* Cheeks */}
      <circle cx="38" cy="37" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <circle cx="62" cy="37" r="3.5" fill="#FFA4A4" opacity="0.9" />
      <polygon points="48,37 52,37 50,40" fill="var(--border-color)" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="var(--border-color)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="68" r="6" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#D4A373" stroke="var(--border-color)" strokeWidth="2.5" />
    </svg>
  );

  return (
    <div style={styles.container}>
      {/* 1. Difference Analysis (Top, Full Width) */}
      <div className="comic-card WinnerDashboard-summaryCard" style={styles.summaryCard}>
        <div style={styles.banner}>
          <span style={styles.bannerText}>⚖️ 雙方付出差額分析</span>
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
            <span style={styles.balanceLabel}>🧹 家事與心意點數差額比對</span>
            <div style={styles.balanceValueContainer}>
              {loveDiff === 0 ? (
                <span style={styles.balancedText}>🎉 雙方付出心意點數已完美平衡！</span>
              ) : (
                <span style={styles.imbalancedText}>
                  <strong>{loveDiff > 0 ? p1Name : p2Name}</strong> 多付出了 <strong style={styles.highlight}>{Math.abs(loveDiff)} 點</strong> 的溫馨關懷
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side-by-side Individual Stats (Bottom) */}
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
              <span style={styles.statLabel}>家事心意點數</span>
              <span style={styles.statValue}>{p1Love} 點</span>
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
              <span style={styles.statLabel}>家事心意點數</span>
              <span style={styles.statValue}>{p2Love} 點</span>
            </div>
          </div>
        </div>
      </div>
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
  }
};
