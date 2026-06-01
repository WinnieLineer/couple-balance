import React from 'react';
import { Sparkles, Trophy, Heart, Flame } from 'lucide-react';

export default function WinnerDashboard({ 
  p1Money = 0, 
  p2Money = 0, 
  p1Love = 0, 
  p2Love = 0,
  p1Name = '老公',
  p2Name = '老婆',
  p1Role = 'white_dog',
  p2Role = 'brown_dog'
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
    statusTitle = `👑 ${p2Name} 是宇宙無敵受寵王！ 👑`;
    statusDesc = `${p1Name} 默默包辦了金錢與家事，簡直是模範奉獻小狗！快給他一個大大的擁抱～`;
    dialogP1 = '為了寶貝的笑容，我辛苦一點也超幸福的！汪嗚！💦🐾';
    dialogP2 = '哼哼～我是被愛包圍的幸福女皇！謝謝親愛的！💖✨';
  } else if (moneyDiff < 0 && loveDiff < 0) {
    // Partner 2 did more and spent more
    winner = 'p1'; // P1 is pampered / spoiled!
    stateType = 'p1_spoiled';
    statusTitle = `👑 ${p1Name} 是宇宙無敵受寵王！ 👑`;
    statusDesc = `${p2Name} 默默包辦了金錢與家事，簡直是模範奉獻小狗！快去幫她搥搥背～`;
    dialogP1 = '耶～我是最幸福的國王！謝謝親愛的！抱一個！👑🐶';
    dialogP2 = '看你開心的樣子，我付出的汗水和金錢都值了！汪！💖✨';
  } else if ((moneyDiff > 0 && loveDiff < 0) || (moneyDiff < 0 && loveDiff > 0)) {
    // Split! One spent more, one did more chores
    winner = 'both';
    stateType = 'split';
    statusTitle = '🤝 默契金牌！最強生活合夥人 🤝';
    const moneyLeader = moneyDiff > 0 ? p1Name : p2Name;
    const choreLeader = loveDiff > 0 ? p1Name : p2Name;
    statusDesc = `太讚了！由 ${moneyLeader} 主攻生活經濟 💰，${choreLeader} 主攻溫馨家事 🧹。分工合作，完美互補！`;
    dialogP1 = '你出資、我出力，我們的生活天秤超級穩！🐾';
    dialogP2 = '沒錯！強強聯手，這就是我們完美的共同生活方式！💖';
  } else {
    // Perfect tie
    winner = 'both';
    stateType = 'harmony';
    statusTitle = '🌸 心有靈犀！神仙眷侶平衡大師 🌸';
    statusDesc = '太不可思議了！你們的金錢與家事付出達到近乎完美的平衡！這絕對是靈魂伴侶的最高境界！';
    dialogP1 = '我們居然剛好一模一樣！這就是心意相通嗎？';
    dialogP2 = '天啊～太有默契了！小白和小棕永遠在一起！💖';
  }

  // White Dog SVG Nodes
  const renderWhiteDogSvg = (isSpoiled, isDevoted) => (
    <svg viewBox="0 0 100 80" style={styles.dogSvg}>
      {/* Body */}
      <ellipse cx="50" cy="55" rx="20" ry="15" fill="#FFFFFF" stroke="#5D4A3E" strokeWidth="3" />
      {/* Back leg & tail */}
      <circle cx="34" cy="62" r="7" fill="#FFFFFF" stroke="#5D4A3E" strokeWidth="2.5" />
      <path d="M 30 55 Q 20 50 25 42" fill="none" stroke="#5D4A3E" strokeWidth="3" strokeLinecap="round" />
      
      {/* Ears */}
      <ellipse cx="30" cy="28" rx="6" ry="10" fill="#FFFFFF" stroke="#5D4A3E" strokeWidth="3" />
      <ellipse cx="70" cy="28" rx="6" ry="10" fill="#FFFFFF" stroke="#5D4A3E" strokeWidth="3" />
      {/* Head */}
      <ellipse cx="50" cy="35" rx="20" ry="17" fill="#FFFFFF" stroke="#5D4A3E" strokeWidth="3" />
      {/* Eyes */}
      <circle cx="43" cy="33" r="3" fill="#5D4A3E" />
      <circle cx="57" cy="33" r="3" fill="#5D4A3E" />
      {/* Blush */}
      <circle cx="35" cy="39" r="3" fill="#FFC4C4" />
      <circle cx="65" cy="39" r="3" fill="#FFC4C4" />
      {/* Nose & Mouth */}
      <polygon points="48,37 52,37 50,40" fill="#5D4A3E" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="#5D4A3E" strokeWidth="2" strokeLinecap="round" />
      {/* Front paws */}
      <circle cx="44" cy="68" r="6" fill="#FFFFFF" stroke="#5D4A3E" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#FFFFFF" stroke="#5D4A3E" strokeWidth="2.5" />
      
      {/* Sweat droplet if devoting */}
      {isDevoted && (
        <path d="M 72 20 Q 75 25 72 27 Q 70 25 72 20" fill="#D7E9F7" stroke="#5D4A3E" strokeWidth="1.5" />
      )}
    </svg>
  );

  // Brown Dog SVG Nodes
  const renderBrownDogSvg = (isSpoiled, isDevoted) => (
    <svg viewBox="0 0 100 80" style={styles.dogSvg}>
      {/* Body */}
      <ellipse cx="50" cy="55" rx="20" ry="15" fill="#E5A96E" stroke="#5D4A3E" strokeWidth="3" />
      {/* Back leg & tail */}
      <circle cx="34" cy="62" r="7" fill="#E5A96E" stroke="#5D4A3E" strokeWidth="2.5" />
      <path d="M 30 55 Q 20 50 25 42" fill="none" stroke="#5D4A3E" strokeWidth="3" strokeLinecap="round" />
      
      {/* Ears */}
      <ellipse cx="30" cy="28" rx="6" ry="10" fill="#E5A96E" stroke="#5D4A3E" strokeWidth="3" />
      <ellipse cx="70" cy="28" rx="6" ry="10" fill="#E5A96E" stroke="#5D4A3E" strokeWidth="3" />
      {/* Head */}
      <ellipse cx="50" cy="35" rx="20" ry="17" fill="#E5A96E" stroke="#5D4A3E" strokeWidth="3" />
      {/* Eyes */}
      <circle cx="43" cy="33" r="3" fill="#5D4A3E" />
      <circle cx="57" cy="33" r="3" fill="#5D4A3E" />
      {/* Blush */}
      <circle cx="35" cy="39" r="3" fill="#FF8B8B" />
      <circle cx="65" cy="39" r="3" fill="#FF8B8B" />
      {/* Nose & Mouth */}
      <polygon points="48,37 52,37 50,40" fill="#5D4A3E" />
      <path d="M 47 43 Q 50 46 53 43" fill="none" stroke="#5D4A3E" strokeWidth="2" strokeLinecap="round" />
      {/* Front paws */}
      <circle cx="44" cy="68" r="6" fill="#E5A96E" stroke="#5D4A3E" strokeWidth="2.5" />
      <circle cx="56" cy="68" r="6" fill="#E5A96E" stroke="#5D4A3E" strokeWidth="2.5" />
      
      {/* Sweat droplet if devoting */}
      {isDevoted && (
        <path d="M 72 20 Q 75 25 72 27 Q 70 25 72 20" fill="#D7E9F7" stroke="#5D4A3E" strokeWidth="1.5" />
      )}
    </svg>
  );

  return (
    <div className="comic-card" style={styles.container}>
      {/* Sparkly header banner */}
      <div style={styles.banner}>
        <Sparkles size={18} color="var(--text-primary)" className="animate-spin-slow" />
        <span style={styles.bannerText}>🏆 共同生活心意分析看板 🏆</span>
        <Sparkles size={18} color="var(--text-primary)" className="animate-spin-slow" />
      </div>

      <div style={styles.dashboardBody}>
        {/* Adorable Visual Display */}
        <div style={styles.visualRow}>
          {/* Partner 1 Dog */}
          <div style={styles.dogWrapper}>
            <div style={styles.nameTag}>{p1Role === 'white_dog' ? '🤍' : '🤎'} {p1Name}</div>
            
            <div style={{
              ...styles.dogAvatar,
              transform: stateType === 'p1_spoiled' ? 'scale(1.15) translateY(-5px)' : 'scale(1)',
              filter: stateType === 'p2_spoiled' ? 'grayscale(15%) opacity(85%)' : 'none'
            }} className={stateType === 'p1_spoiled' ? 'animate-float' : ''}>
              {/* Crown for crowned spoiled dog */}
              {stateType === 'p1_spoiled' && (
                <div style={styles.crown}>👑</div>
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
            <div style={{ ...styles.vsCircle, backgroundColor: stateType === 'split' ? 'var(--color-green)' : 'var(--color-pink)' }}>
              {stateType === 'split' ? <Flame size={20} color="var(--text-primary)" /> : <Heart size={20} color="var(--text-primary)" fill="var(--text-primary)" />}
            </div>
            <div style={styles.vsLine} />
          </div>

          {/* Partner 2 Dog */}
          <div style={styles.dogWrapper}>
            <div style={{ ...styles.nameTag, alignSelf: 'flex-end' }}>{p2Role === 'white_dog' ? '🤍' : '🤎'} {p2Name}</div>
            
            <div style={{
              ...styles.dogAvatar,
              transform: stateType === 'p2_spoiled' ? 'scale(1.15) translateY(-5px)' : 'scale(1)',
              filter: stateType === 'p1_spoiled' ? 'grayscale(15%) opacity(85%)' : 'none'
            }} className={stateType === 'p2_spoiled' ? 'animate-float' : ''}>
              {/* Crown for crowned spoiled dog */}
              {stateType === 'p2_spoiled' && (
                <div style={styles.crownRight}>👑</div>
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
            <Trophy size={18} color="var(--text-primary)" />
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
    backgroundColor: '#FFFDF9',
    marginBottom: '24px',
    padding: '20px',
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#FFEFA6',
    border: '2.5px solid var(--text-primary)',
    borderRadius: '12px',
    padding: '6px 16px',
    marginBottom: '20px',
    boxShadow: '2px 2px 0px var(--text-primary)',
  },
  bannerText: {
    fontWeight: '700',
    fontSize: '0.95rem',
    letterSpacing: '1px',
    color: 'var(--text-primary)',
  },
  dashboardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  visualRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  dogWrapper: {
    flex: 1,
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  nameTag: {
    backgroundColor: 'var(--text-primary)',
    color: '#FFFFFF',
    padding: '4px 12px',
    borderRadius: '99px',
    fontSize: '0.85rem',
    fontWeight: '700',
    border: '2px solid #5D4A3E',
    boxShadow: '1.5px 1.5px 0px #5D4A3E',
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
  crown: {
    position: 'absolute',
    top: '-15px',
    left: '20px',
    fontSize: '1.8rem',
    transform: 'rotate(-15deg)',
    zIndex: 10,
    animation: 'float 3s ease-in-out infinite',
  },
  crownRight: {
    position: 'absolute',
    top: '-15px',
    right: '20px',
    fontSize: '1.8rem',
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
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2.5px solid var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '2px 2px 0px var(--text-primary)',
    zIndex: 2,
  },
  vsLine: {
    width: '2px',
    height: '50px',
    borderLeft: '2px dashed var(--border-color)',
    marginTop: '-10px',
  },
  bubble: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    border: '2.5px solid var(--text-primary)',
    borderRadius: '16px',
    padding: '10px 14px',
    boxShadow: '3.5px 3.5px 0px var(--text-primary)',
    maxWidth: '220px',
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
    borderBottom: '10px solid var(--text-primary)',
  },
  bubbleRight: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    border: '2.5px solid var(--text-primary)',
    borderRadius: '16px',
    padding: '10px 14px',
    boxShadow: '3.5px 3.5px 0px var(--text-primary)',
    maxWidth: '220px',
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
    borderBottom: '10px solid var(--text-primary)',
  },
  bubbleText: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
    textAlign: 'center',
  },
  awardCard: {
    backgroundColor: '#FFFFFF',
    border: '2.5px solid var(--text-primary)',
    borderRadius: '16px',
    padding: '12px 18px',
    boxShadow: '2.5px 2.5px 0px var(--text-primary)',
  },
  awardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  statusTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  statusDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    fontWeight: '600',
  }
};
