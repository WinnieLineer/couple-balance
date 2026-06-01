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

  // White Dog SVG Badge (Quiet, B&W outline style)
  const renderWhiteDogBadge = () => (
    <svg viewBox="0 0 100 80" style={styles.dogBadgeSvg}>
      <ellipse cx="50" cy="55" rx="20" ry="15" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" />
      <circle cx="34" cy="62" r="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
      <path d="M 30 55 Q 20 50 25 42" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="30" cy="28" rx="6" ry="10" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" />
      <ellipse cx="70" cy="28" rx="6" ry="10" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" />
      <ellipse cx="50" cy="35" rx="20" ry="17" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" />
      <circle cx="43" cy="33" r="3" fill="#000000" />
      <circle cx="57" cy="33" r="3" fill="#000000" />
      <polygon points="48,37 52,37 50,40" fill="#000000" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="68" r="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
    </svg>
  );

  // Gray Dog SVG Badge (Quiet, B&W line-art style)
  const renderGrayDogBadge = () => (
    <svg viewBox="0 0 100 80" style={styles.dogBadgeSvg}>
      <ellipse cx="50" cy="55" rx="20" ry="15" fill="#D2D2D2" stroke="#000000" strokeWidth="3.5" />
      <circle cx="34" cy="62" r="7" fill="#D2D2D2" stroke="#000000" strokeWidth="2.5" />
      <path d="M 30 55 Q 20 50 25 42" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="30" cy="28" rx="6" ry="10" fill="#D2D2D2" stroke="#000000" strokeWidth="3.5" />
      <ellipse cx="70" cy="28" rx="6" ry="10" fill="#D2D2D2" stroke="#000000" strokeWidth="3.5" />
      <ellipse cx="50" cy="35" rx="20" ry="17" fill="#D2D2D2" stroke="#000000" strokeWidth="3.5" />
      <circle cx="43" cy="33" r="3" fill="#000000" />
      <circle cx="57" cy="33" r="3" fill="#000000" />
      <polygon points="48,37 52,37 50,40" fill="#000000" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="44" cy="68" r="6" fill="#D2D2D2" stroke="#000000" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#D2D2D2" stroke="#000000" strokeWidth="2.5" />
    </svg>
  );

  return (
    <div className="comic-card" style={styles.container}>
      <div style={styles.banner}>
        <span style={styles.bannerText}>生活付出數據總覽看板</span>
      </div>

      <div style={styles.columnsGrid}>
        {/* P1 Column Card */}
        <div style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <div style={styles.avatarWrapper}>
              {p1Role === 'white_dog' ? renderWhiteDogBadge() : renderGrayDogBadge()}
            </div>
            <span style={styles.roleName}>{p1Name} (白狗)</span>
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

        {/* Middle Summary Card */}
        <div style={styles.summaryCard}>
          <h4 style={styles.summaryTitle}>雙方付出差額分析</h4>
          <div style={styles.summaryBody}>
            {/* Money Balance */}
            <div style={styles.summaryItem}>
              <span style={styles.balanceLabel}>💰 金錢差額</span>
              <span style={styles.balanceValue}>
                {moneyDiff === 0 ? (
                  <span style={styles.balanced}>完美平衡</span>
                ) : (
                  <span>
                    {moneyDiff > 0 ? p1Name : p2Name} 多支出 <strong style={styles.highlight}>{symbol} {Math.abs(moneyDiff).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</strong>
                  </span>
                )}
              </span>
            </div>
            {/* Chore Balance */}
            <div style={styles.summaryItem}>
              <span style={styles.balanceLabel}>💖 家事差額</span>
              <span style={styles.balanceValue}>
                {loveDiff === 0 ? (
                  <span style={styles.balanced}>完美平衡</span>
                ) : (
                  <span>
                    {loveDiff > 0 ? p1Name : p2Name} 多付出 <strong style={styles.highlight}>{Math.abs(loveDiff)} 點</strong>
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* P2 Column Card */}
        <div style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <div style={styles.avatarWrapper}>
              {p2Role === 'white_dog' ? renderWhiteDogBadge() : renderGrayDogBadge()}
            </div>
            <span style={styles.roleName}>{p2Name} (灰狗)</span>
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
    backgroundColor: '#FFFFFF',
    marginBottom: '24px',
    padding: '24px',
    border: '3px solid #000000',
    boxShadow: '4px 4px 0px #000000',
    borderRadius: '0px',
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: '0px',
    padding: '8px 16px',
    marginBottom: '24px',
  },
  bannerText: {
    fontWeight: '800',
    fontSize: '0.95rem',
    letterSpacing: '1.5px',
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
    border: '3px solid #000000',
    boxShadow: '3px 3px 0px #000000',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  summaryCard: {
    flex: '1 1 280px',
    backgroundColor: '#F4F4F3',
    border: '3px solid #000000',
    boxShadow: '3px 3px 0px #000000',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '2px solid #000000',
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
    fontSize: '0.95rem',
    color: '#000000',
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
    color: '#666666',
    fontWeight: '800',
  },
  statValue: {
    fontSize: '1.2rem',
    fontWeight: '900',
    color: '#000000',
  },
  summaryTitle: {
    fontSize: '0.9rem',
    fontWeight: '900',
    color: '#000000',
    borderBottom: '2px dashed #000000',
    paddingBottom: '10px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  summaryBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  balanceLabel: {
    fontSize: '0.75rem',
    color: '#666666',
    fontWeight: '800',
  },
  balanceValue: {
    fontSize: '0.92rem',
    fontWeight: '700',
    color: '#000000',
  },
  balanced: {
    color: '#000000',
    fontWeight: '900',
  },
  highlight: {
    fontWeight: '900',
    color: '#000000',
    textDecoration: 'underline',
  }
};
