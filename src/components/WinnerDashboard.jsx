import React from 'react';
import { Trophy, Heart, Flame } from 'lucide-react';

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
  const moneyDiff = p1Money - p2Money; // > 0 means p1 spent more
  const loveDiff = p1Love - p2Love;   // > 0 means p1 did more chores

  // State determinations
  let statusTitle = '';
  let statusDesc = '';
  let dialogP1 = '';
  let dialogP2 = '';
  let winner = null; // 'p1', 'p2', or 'both' (tie/split)
  let stateType = 'harmony'; // 'p1_spoiled', 'p2_spoiled', 'split', 'harmony'

  if (moneyDiff > 0 && loveDiff > 0) {
    // Partner 1 did more and spent more
    winner = 'p2'; // P2 is pampered / spoiled!
    stateType = 'p2_spoiled';
    statusTitle = `${p2Name} 目前備受寵愛`;
    statusDesc = `${p1Name} 默默包辦了金錢與家事，簡直是模範奉獻代表！快給他一個溫馨的感謝吧。`;
    dialogP1 = '默默為我們的生活付出，看到你的笑容我就感到非常值得。';
    dialogP2 = '能感受到你無比真摯的心意與照顧，謝謝你為我們做的一切。';
  } else if (moneyDiff < 0 && loveDiff < 0) {
    // Partner 2 did more and spent more
    winner = 'p1'; // P1 is pampered / spoiled!
    stateType = 'p1_spoiled';
    statusTitle = `${p1Name} 目前備受寵愛`;
    statusDesc = `${p2Name} 默默包辦了金錢與家事，簡直是模範奉獻代表！快去幫她搥搥背表達心意吧。`;
    dialogP1 = '能感受到你無比真摯的心意與照顧，謝謝你為我們做的一切。';
    dialogP2 = '默默為我們的生活付出，看到你的笑容我就感到非常值得。';
  } else if ((moneyDiff > 0 && loveDiff < 0) || (moneyDiff < 0 && loveDiff > 0)) {
    // Split! One spent more, one did more chores
    winner = 'both';
    stateType = 'split';
    statusTitle = '生活分工默契無間';
    const moneyLeader = moneyDiff > 0 ? p1Name : p2Name;
    const choreLeader = loveDiff > 0 ? p1Name : p2Name;
    statusDesc = `目前由 ${moneyLeader} 主力負責生活開銷，${choreLeader} 主力打理溫馨家事，相互扶持，完美互補！`;
    dialogP1 = '你出資、我出力，我們的生活維持著完美的默契平衡。';
    dialogP2 = '沒錯！相互配合，這就是我們最舒適、最自在的共同生活型態。';
  } else {
    // Perfect tie
    winner = 'both';
    stateType = 'harmony';
    statusTitle = '生活心意完美平衡';
    statusDesc = '太令人高興了！你們在金錢與家事上的付出達到了高度理想的平衡，互相為彼此著想，是絕佳的伴侶。';
    dialogP1 = '我們在生活的各項付出上剛好一致，真的是太有默契了。';
    dialogP2 = '是的，互相體貼、平分秋色，這就是我們攜手經營生活的最佳證明。';
  }

  // Beautiful Minimal Custom SVG Crown instead of cartoon emoji
  const renderCrownSvg = () => (
    <svg viewBox="0 0 40 30" style={styles.crownSvgElement}>
      <path 
        d="M 5,25 L 5,10 L 13,18 L 20,7 L 27,18 L 35,10 L 35,25 Z" 
        fill="#FFFFFF" 
        stroke="#000000" 
        strokeWidth="3" 
        strokeLinejoin="round" 
      />
      <circle cx="5" cy="8" r="2" fill="#000000" />
      <circle cx="20" cy="5" r="2" fill="#000000" />
      <circle cx="35" cy="8" r="2" fill="#000000" />
      <line x1="2" y1="25" x2="38" y2="25" stroke="#000000" strokeWidth="2.5" />
    </svg>
  );

  // White Dog SVG Nodes (Black & White line-art sketch style)
  const renderWhiteDogSvg = (isWinning, isDevoted) => (
    <svg viewBox="0 0 100 80" style={styles.dogSvg}>
      {/* Body */}
      <ellipse cx="50" cy="55" rx="20" ry="15" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />
      {/* Back leg & tail */}
      <circle cx="34" cy="62" r="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
      <path d="M 30 55 Q 20 50 25 42" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
      
      {/* Ears */}
      <ellipse cx="30" cy="28" rx="6" ry="10" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />
      <ellipse cx="70" cy="28" rx="6" ry="10" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />
      {/* Head */}
      <ellipse cx="50" cy="35" rx="20" ry="17" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />
      {/* Eyes */}
      <circle cx="43" cy="33" r="3" fill="#000000" />
      <circle cx="57" cy="33" r="3" fill="#000000" />
      {/* Blush (Elegant black lines/slashes instead of pink!) */}
      <line x1="32" y1="39" x2="35" y2="41" stroke="#000000" strokeWidth="1.5" />
      <line x1="33" y1="41" x2="36" y2="43" stroke="#000000" strokeWidth="1.5" />
      <line x1="64" y1="39" x2="67" y2="41" stroke="#000000" strokeWidth="1.5" />
      <line x1="65" y1="41" x2="68" y2="43" stroke="#000000" strokeWidth="1.5" />
      {/* Nose & Mouth */}
      <polygon points="48,37 52,37 50,40" fill="#000000" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      {/* Front paws */}
      <circle cx="44" cy="68" r="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
      
      {/* Sweat droplet if devoting (B&W minimal line representation) */}
      {isDevoted && (
        <path d="M 72 20 Q 75 25 72 27 Q 70 25 72 20" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
      )}
    </svg>
  );

  // Brown Dog SVG Nodes (Chic Designer Gray (#D2D2D2) line-art sketch style)
  const renderBrownDogSvg = (isWinning, isDevoted) => (
    <svg viewBox="0 0 100 80" style={styles.dogSvg}>
      {/* Body */}
      <ellipse cx="50" cy="55" rx="20" ry="15" fill="#D2D2D2" stroke="#000000" strokeWidth="3" />
      {/* Back leg & tail */}
      <circle cx="34" cy="62" r="7" fill="#D2D2D2" stroke="#000000" strokeWidth="2.5" />
      <path d="M 30 55 Q 20 50 25 42" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
      
      {/* Ears */}
      <ellipse cx="30" cy="28" rx="6" ry="10" fill="#D2D2D2" stroke="#000000" strokeWidth="3" />
      <ellipse cx="70" cy="28" rx="6" ry="10" fill="#D2D2D2" stroke="#000000" strokeWidth="3" />
      {/* Head */}
      <ellipse cx="50" cy="35" rx="20" ry="17" fill="#D2D2D2" stroke="#000000" strokeWidth="3" />
      {/* Eyes */}
      <circle cx="43" cy="33" r="3" fill="#000000" />
      <circle cx="57" cy="33" r="3" fill="#000000" />
      {/* Blush (B&W slashes) */}
      <line x1="32" y1="39" x2="35" y2="41" stroke="#000000" strokeWidth="1.5" />
      <line x1="33" y1="41" x2="36" y2="43" stroke="#000000" strokeWidth="1.5" />
      <line x1="64" y1="39" x2="67" y2="41" stroke="#000000" strokeWidth="1.5" />
      <line x1="65" y1="41" x2="68" y2="43" stroke="#000000" strokeWidth="1.5" />
      {/* Nose & Mouth */}
      <polygon points="48,37 52,37 50,40" fill="#000000" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      {/* Front paws */}
      <circle cx="44" cy="68" r="6" fill="#D2D2D2" stroke="#000000" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#D2D2D2" stroke="#000000" strokeWidth="2.5" />
      
      {/* Sweat droplet if devoting */}
      {isDevoted && (
        <path d="M 72 20 Q 75 25 72 27 Q 70 25 72 20" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
      )}
    </svg>
  );

  return (
    <div className="comic-card" style={styles.container}>
      {/* Sleek Minimal High-Contrast B&W Banner */}
      <div style={styles.banner}>
        <span style={styles.bannerText}>生活付出心意分析看板</span>
      </div>

      <div style={styles.dashboardBody}>
        {/* Designer Visual Display */}
        <div style={styles.visualRow}>
          {/* Partner 1 Dog */}
          <div style={styles.dogWrapper}>
            <div style={styles.nameTag}>
              {p1Role === 'white_dog' ? '白狗' : '灰狗'} {p1Name}
            </div>
            
            <div style={{
              ...styles.dogAvatar,
              transform: stateType === 'p1_spoiled' ? 'scale(1.15) translateY(-5px)' : 'scale(1)',
              filter: stateType === 'p2_spoiled' ? 'grayscale(30%) opacity(80%)' : 'none'
            }} className={stateType === 'p1_spoiled' ? 'animate-float' : ''}>
              
              {/* Custom SVG crown instead of emoji */}
              {stateType === 'p1_spoiled' && (
                <div style={styles.crownContainer}>
                  {renderCrownSvg()}
                </div>
              )}
              
              {p1Role === 'white_dog' 
                ? renderWhiteDogSvg(stateType === 'p1_spoiled', stateType === 'p2_spoiled') 
                : renderBrownDogSvg(stateType === 'p1_spoiled', stateType === 'p2_spoiled')
              }
            </div>
            
            {/* Dialogue Bubble */}
            <div style={styles.bubble}>
              <div style={styles.bubbleArrowLeft} />
              <p style={styles.bubbleText}>{dialogP1}</p>
            </div>
          </div>

          {/* Verses indicator in middle */}
          <div style={styles.versusColumn}>
            <div style={styles.vsCircle}>
              {stateType === 'split' ? (
                <Flame size={18} color="#FFFFFF" strokeWidth={2.5} />
              ) : (
                <Heart size={18} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.5} />
              )}
            </div>
            <div style={styles.vsLine} />
          </div>

          {/* Partner 2 Dog */}
          <div style={styles.dogWrapper}>
            <div style={{ ...styles.nameTag, alignSelf: 'flex-end' }}>
              {p2Role === 'white_dog' ? '白狗' : '灰狗'} {p2Name}
            </div>
            
            <div style={{
              ...styles.dogAvatar,
              transform: stateType === 'p2_spoiled' ? 'scale(1.15) translateY(-5px)' : 'scale(1)',
              filter: stateType === 'p1_spoiled' ? 'grayscale(30%) opacity(80%)' : 'none'
            }} className={stateType === 'p2_spoiled' ? 'animate-float' : ''}>
              
              {/* Custom SVG crown instead of emoji */}
              {stateType === 'p2_spoiled' && (
                <div style={styles.crownContainerRight}>
                  {renderCrownSvg()}
                </div>
              )}
              
              {p2Role === 'white_dog' 
                ? renderWhiteDogSvg(stateType === 'p2_spoiled', stateType === 'p1_spoiled') 
                : renderBrownDogSvg(stateType === 'p2_spoiled', stateType === 'p1_spoiled')
              }
            </div>
            
            {/* Dialogue Bubble */}
            <div style={styles.bubbleRight}>
              <div style={styles.bubbleArrowRight} />
              <p style={styles.bubbleText}>{dialogP2}</p>
            </div>
          </div>
        </div>

        {/* Textual Evaluation and Award */}
        <div style={styles.awardCard}>
          <div style={styles.awardHeader}>
            <Trophy size={18} color="#000000" strokeWidth={2.5} />
            <h4 style={styles.statusTitle}>{statusTitle}</h4>
          </div>
          <p style={styles.statusDesc}>{statusDesc}</p>
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
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: '8px',
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
  dashboardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  visualRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px',
  },
  dogWrapper: {
    flex: 1,
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  nameTag: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    padding: '4px 14px',
    borderRadius: '0px', // Straight architect styling
    fontSize: '0.8rem',
    fontWeight: '800',
    border: '2px solid #000000',
    letterSpacing: '0.5px',
  },
  dogAvatar: {
    width: '120px',
    height: '96px',
    position: 'relative',
    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  dogSvg: {
    width: '100%',
    height: '100%',
  },
  crownContainer: {
    position: 'absolute',
    top: '-20px',
    left: '20px',
    transform: 'rotate(-15deg)',
    zIndex: 10,
    animation: 'float 3s ease-in-out infinite',
  },
  crownContainerRight: {
    position: 'absolute',
    top: '-20px',
    right: '20px',
    transform: 'rotate(15deg)',
    zIndex: 10,
    animation: 'float 3s ease-in-out infinite',
    animationDelay: '1.5s',
  },
  versusColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '90px',
    justifyContent: 'center',
  },
  vsCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '3px solid #000000',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  vsLine: {
    width: '2px',
    height: '50px',
    borderLeft: '2px dashed #000000',
    marginTop: '-10px',
  },
  bubble: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    borderRadius: '0px', // pure block style
    padding: '10px 14px',
    boxShadow: '4px 4px 0px #000000',
    maxWidth: '230px',
  },
  bubbleArrowLeft: {
    content: '""',
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderBottom: '10px solid #000000',
  },
  bubbleRight: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    borderRadius: '0px',
    padding: '10px 14px',
    boxShadow: '4px 4px 0px #000000',
    maxWidth: '230px',
  },
  bubbleArrowRight: {
    content: '""',
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderBottom: '10px solid #000000',
  },
  bubbleText: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#000000',
    lineHeight: '1.5',
    textAlign: 'center',
  },
  awardCard: {
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    borderRadius: '0px',
    padding: '16px 20px',
    boxShadow: '3px 3px 0px #000000',
  },
  awardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  statusTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#000000',
    letterSpacing: '0.5px',
  },
  statusDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    fontWeight: '700',
  }
};
