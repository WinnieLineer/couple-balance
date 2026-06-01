import React, { useState, useEffect } from 'react';
import { Share, Download, X, AlertCircle } from 'lucide-react';

export default function PWAPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSManual, setIsIOSManual] = useState(false); // iOS Safari OR iOS Chrome/Firefox (all need manual steps)
  const [isStandalone, setIsStandalone] = useState(false);
  const [isBraveBrowser, setIsBraveBrowser] = useState(false);
  const [isUnsupported, setIsUnsupported] = useState(false); // e.g. LINE/FB webview

  useEffect(() => {
    // 1. Check if already running in standalone/installed mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    const isCooldownActive = lastDismissed && (Date.now() - parseInt(lastDismissed, 10) < 24 * 60 * 60 * 1000);
    if (isCooldownActive) return;

    // 2. Detect iOS device (iPhone / iPad / iPod)
    const isApple = /ipad|iphone|ipod/.test(ua) && !window.MSStream;
    setIsIOS(isApple);

    // 3. On iOS, ALL browsers (Safari, Chrome/crios, Firefox/fxios, etc.) need
    //    manual "Add to Home Screen" steps — iOS blocks beforeinstallprompt entirely.
    if (isApple) {
      setIsIOSManual(true);
      setIsVisible(true);
      return;
    }

    // 4. Detect Brave browser (async API check)
    const checkBrave = async () => {
      const isBraveUa = /brave|baver/.test(ua);
      const isBraveApi =
        navigator.brave &&
        typeof navigator.brave.isBrave === 'function' &&
        (await navigator.brave.isBrave());
      if (isBraveUa || isBraveApi) {
        setIsBraveBrowser(true);
        // Brave on Android/Desktop DOES fire beforeinstallprompt when shields allow it.
        // We'll wait for the event; if it never fires we show the "switch browser" prompt below.
        // Give Chrome 3s to fire the event before deciding Brave can't install.
        setTimeout(() => {
          setDeferredPrompt(prev => {
            if (!prev) {
              // No install event fired → Brave has blocked PWA install
              setIsUnsupported(true);
              setIsVisible(true);
            }
            return prev;
          });
        }, 3000);
      }
    };
    checkBrave().catch(() => {/* safe ignore */});

    // 5. Detect LINE / FB Messenger in-app webview (cannot install PWA)
    const isLineOrFb = /line|fbav|messenger/.test(ua);
    if (isLineOrFb) {
      setIsUnsupported(true);
      setIsVisible(true);
      return;
    }

    // 6. Listen for native PWA install prompt (Chrome, Edge, Samsung, Opera, some Brave)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    setIsVisible(false);
  };

  // Determine which content panel to render
  const renderContent = () => {
    // A. Native install prompt available (Android Chrome, Edge, Desktop Chrome/Edge, etc.)
    if (deferredPrompt) {
      return (
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
      );
    }

    // B. iOS device — all browsers need manual steps (Safari / Chrome / Firefox on iOS)
    if (isIOSManual) {
      return (
        <div>
          <p style={styles.desc}>
            在 iOS 裝置上，請依循以下步驟將天秤加入主畫面：
          </p>
          <div style={styles.steps}>
            <div style={styles.stepItem}>
              <div style={styles.stepNum}>1</div>
              <span>
                點擊底部工具列的「分享」按鈕{' '}
                <Share size={14} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} />
              </span>
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
          <p style={{ ...styles.desc, marginTop: '8px', fontSize: '0.72rem', color: '#888' }}>
            💡 支援 Safari、Chrome、Firefox 等所有 iOS 瀏覽器
          </p>
        </div>
      );
    }

    // C. Brave browser blocked PWA install, or LINE/FB webview
    if (isUnsupported || isBraveBrowser) {
      return (
        <div>
          <div style={styles.warningBox}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: '800', fontSize: '0.82rem', marginBottom: '2px' }}>
                {isBraveBrowser ? 'Brave (Baver) 瀏覽器不支援 PWA 直接安裝' : '目前瀏覽器不支援 PWA 安裝功能'}
              </p>
              <p style={{ fontSize: '0.75rem', lineHeight: '1.4', opacity: 0.85 }}>
                {isBraveBrowser
                  ? '由於 Brave 瀏覽器的安全盾牌限制，無法直接加到桌面。'
                  : '請不要在社群 App 內嵌視窗 (LINE/FB) 或第三方瀏覽器中開啟本站。'}
              </p>
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <p style={{ ...styles.desc, marginBottom: '8px' }}>
              {isBraveBrowser
                ? '請複製網址，更換至 Google Chrome 瀏覽器以啟用安裝：'
                : '請更換推薦瀏覽器以加成桌面 App 使用：'}
            </p>
            <div style={styles.steps}>
              {isBraveBrowser ? (
                <div style={styles.stepItem}>
                  <div style={styles.stepNum}>🤖</div>
                  <span>請點選下方複製網址，更換至 <b>Google Chrome</b> 開啟，即可看見一鍵安裝引導！🌟</span>
                </div>
              ) : (
                <>
                  <div style={styles.stepItem}>
                    <div style={styles.stepNum}>🍎</div>
                    <span><b>iPhone / iPad：</b>更換至 <b>iOS Safari</b> 開啟，點選分享即可「加入主畫面」。</span>
                  </div>
                  <div style={styles.stepItem}>
                    <div style={styles.stepNum}>🤖</div>
                    <span><b>Android / 電腦：</b>更換至 <b>Google Chrome</b> 或 <b>Edge</b> 開啟以啟用安裝功能。</span>
                  </div>
                </>
              )}
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
      );
    }

    // D. Nothing to show yet (waiting for beforeinstallprompt or detection to complete)
    return null;
  };

  // Guard: already installed or not visible
  if (isStandalone || !isVisible) return null;

  const content = renderContent();
  if (!content) return null;

  return (
    <div style={styles.floatingContainer} className="animate-pop">
      <div className="comic-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.titleArea}>
            <img
              src="./favicon.png"
              alt="Mascot"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
                border: '2px solid #000000',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                boxShadow: '1.5px 1.5px 0px #000000',
              }}
            />
            <h3 style={styles.title}>安裝 HeartSync App 📱</h3>
          </div>
          <button onClick={handleDismiss} style={styles.closeBtn} className="comic-btn secondary">
            <X size={14} />
          </button>
        </div>
        <div style={styles.content}>
          {content}
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
