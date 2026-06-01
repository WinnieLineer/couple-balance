import React, { useState, useEffect } from 'react';
import { Share, Download, X, HelpCircle, AlertCircle } from 'lucide-react';

export default function PWAPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone/installed mode
    const standaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true;
    setIsStandalone(standaloneMode);

    // 2. Detect OS / Browser type
    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /ipad|iphone|ipod/.test(ua) && !window.MSStream;
    setIsIOS(isApple);

    const safariMatched = /safari/.test(ua) && !/chrome|crios|fxios|mqqbrowser|samsungbrowser|opera/.test(ua);
    setIsSafari(safariMatched);

    // 3. Listen for native PWA install prompt (Chrome, Edge, Brave, Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto-trigger prompt display if not installed already
      if (!standaloneMode) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. For iOS Safari (which doesn't support beforeinstallprompt but can be installed manually)
    // We show the custom prompt once per day if they are not standalone
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    const isCooldownActive = lastDismissed && (Date.now() - parseInt(lastDismissed, 10) < 24 * 60 * 60 * 1000);

    if (!standaloneMode && isApple && !isCooldownActive) {
      // iOS Safari manual prompt display
      setIsVisible(true);
    }

    // 5. For other non-installable mobile browsers (e.g. Line, Messenger Webview, Chrome on iOS, Firefox on iOS)
    // We show a warning suggesting to switch to native browsers
    const isLineOrFb = /line|fbav|messenger/.test(ua);
    if (!standaloneMode && (isLineOrFb || (isApple && !safariMatched)) && !isCooldownActive) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('PWA: User accepted install');
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    setIsVisible(false);
  };

  // If already standalone, do not show PWA prompt
  if (isStandalone || !isVisible) return null;

  return (
    <div style={styles.floatingContainer} className="animate-pop">
      <div className="comic-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.titleArea}>
            <svg viewBox="0 0 160 80" style={styles.titleIcon}>
              {/* White fluffy dog head peeking */}
              <path 
                d="M 35,65 C 26,60 16,45 22,25 C 25,12 38,7 53,14 C 63,4 83,4 93,14 C 108,7 120,12 123,25 C 129,45 119,60 109,65 Z" 
                fill="#FFFFFF" 
                stroke="#000000" 
                strokeWidth="3.5" 
                strokeLinejoin="round" 
              />
              <path d="M 24,20 Q 18,15 22,8 Q 28,2 34,12" fill="none" stroke="#000000" strokeWidth="3.5" />
              <path d="M 120,20 Q 126,15 122,8 Q 116,2 110,12" fill="none" stroke="#000000" strokeWidth="3.5" />
              <circle cx="53" cy="36" r="3.2" fill="#000000" />
              <circle cx="91" cy="36" r="3.2" fill="#000000" />
              <ellipse cx="72" cy="39" rx="3.8" ry="2.6" fill="#000000" />
              <path d="M 58,46 Q 65,51 72,46 Q 79,51 86,46" fill="none" stroke="#000000" strokeWidth="3.5" />
              <line x1="2" y1="76" x2="158" y2="76" stroke="#000000" strokeWidth="4.5" />
              <path d="M 26,76 C 26,66 44,66 44,76" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" />
              <path d="M 100,76 C 100,66 118,66 118,76" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" />
            </svg>
            <h3 style={styles.title}>安裝 HeartSync App 📱</h3>
          </div>
          <button onClick={handleDismiss} style={styles.closeBtn} className="comic-btn secondary">
            <X size={14} />
          </button>
        </div>

        <div style={styles.content}>
          {deferredPrompt ? (
            /* 1. Natively installable browser (Chrome, Edge, Android Chrome, Desktop) */
            <div>
              <p style={styles.desc}>
                將 HeartSync 加到主畫面，即可享有全螢幕獨立運行、秒速開啟的極致記帳體驗！
              </p>
              <button 
                onClick={handleInstallClick} 
                className="comic-btn"
                style={styles.actionBtn}
              >
                <Download size={16} strokeWidth={3} />
                <span>立即安裝至桌面</span>
              </button>
            </div>
          ) : isIOS && isSafari ? (
            /* 2. iOS Safari manual flow */
            <div>
              <p style={styles.desc}>
                在 iOS 裝置上，請依循以下步驟將天秤加入主畫面：
              </p>
              <div style={styles.steps}>
                <div style={styles.stepItem}>
                  <div style={styles.stepNum}>1</div>
                  <span>點擊下方選單的「分享」按鈕 <Share size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /></span>
                </div>
                <div style={styles.stepItem}>
                  <div style={styles.stepNum}>2</div>
                  <span>在選單中滾動並選擇「加入主畫面」📱</span>
                </div>
                <div style={styles.stepItem}>
                  <div style={styles.stepNum}>3</div>
                  <span>點擊右上角的「新增」即可完成安裝！✨</span>
                </div>
              </div>
            </div>
          ) : (
            /* 3. Non-installable environment (iOS Chrome/Firefox, Line/FB Webview, etc.) */
            <div>
              <div style={styles.warningBox}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontWeight: '800', fontSize: '0.82rem', marginBottom: '2px' }}>
                    目前瀏覽器不支援 PWA 安裝功能
                  </p>
                  <p style={{ fontSize: '0.75rem', lineHeight: '1.4', opacity: 0.85 }}>
                    請不要在社群 App 內嵌視窗 (LINE/FB) 或第三方瀏覽器中開啟本站。
                  </p>
                </div>
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <p style={{ ...styles.desc, marginBottom: '8px' }}>
                  請更換推薦瀏覽器以加成桌面 App 使用：
                </p>
                <div style={styles.steps}>
                  <div style={styles.stepItem}>
                    <div style={styles.stepNum}>🍎</div>
                    <span><b>iPhone / iPad：</b>請複製網址並更換至 <b>iOS Safari</b> 瀏覽器開啟，點選分享即可「加入主畫面」。</span>
                  </div>
                  <div style={styles.stepItem}>
                    <div style={styles.stepNum}>🤖</div>
                    <span><b>Android / 電腦：</b>請複製網址並更換至 <b>Google Chrome</b> 或 <b>Edge</b> 瀏覽器開啟以啟用安裝功能。</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('網址已成功複製到剪貼簿，快去換瀏覽器貼上吧！');
                  }}
                  className="comic-btn secondary"
                  style={{ ...styles.actionBtn, marginTop: '12px', width: '100%', justifyContent: 'center' }}
                >
                  📋 複製網址以更換瀏覽器
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  floatingContainer: {
    position: 'fixed',
    bottom: '88px', // Float right above the mobile main bottom FloatingBtn wrapper
    right: '16px',
    left: '16px',
    maxWidth: '380px',
    zIndex: 99999,
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    boxShadow: '6px 6px 0px #000000',
    padding: '16px',
    borderRadius: '0px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2.5px solid #000000',
    paddingBottom: '8px',
    marginBottom: '10px',
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  titleIcon: {
    width: '45px',
    height: '24px',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: '900',
    color: '#000000',
  },
  closeBtn: {
    padding: '3px',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '1.5px 1.5px 0 #000000',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  desc: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#666666',
    lineHeight: '1.5',
  },
  actionBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '10px 14px',
    fontSize: '0.88rem',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    marginTop: '6px',
    boxShadow: '3px 3px 0 #000000',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '6px',
    textAlign: 'left',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.78rem',
    fontWeight: '700',
    lineHeight: '1.4',
    color: '#000000',
  },
  stepNum: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #000000',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    fontWeight: '900',
    flexShrink: 0,
    marginTop: '2px',
  },
  warningBox: {
    display: 'flex',
    gap: '8px',
    padding: '8px 10px',
    backgroundColor: '#FFD2D2',
    border: '2px solid #000000',
    color: '#000000',
    textAlign: 'left',
  }
};
