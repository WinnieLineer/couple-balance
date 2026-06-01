import React, { useState } from 'react';
import { Settings, RefreshCw, Cloud, CloudOff, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export default function GistSyncPanel({ 
  syncConfig, 
  saveConfig, 
  syncStatus, 
  onPull, 
  onPush, 
  isSyncing,
  offlineMode,
  partners,
  onUpdatePartners
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Show onboarding wizard if nicknames haven't been set yet in localStorage
  const [showWizard, setShowWizard] = useState(!localStorage.getItem('partners_config'));

  // Wizard state for custom names and roles
  const [p1Name, setP1Name] = useState(partners.p1.name || '老公');
  const [p2Name, setP2Name] = useState(partners.p2.name || '老婆');
  const [p1Role, setP1Role] = useState(partners.p1.role || 'white_dog');
  const [p2Role, setP2Role] = useState(partners.p2.role || 'brown_dog');

  // Toggle roles (which dog represents who)
  const handleSwapRoles = () => {
    const tempRole = p1Role;
    setP1Role(p2Role);
    setP2Role(tempRole);
  };

  const getCustomPartnersPayload = () => {
    return {
      p1: { name: p1Name.trim() || '老公', role: p1Role },
      p2: { name: p2Name.trim() || '老婆', role: p2Role }
    };
  };

  // Complete onboarding and start App
  const handleStart = () => {
    const customPartners = getCustomPartnersPayload();
    onUpdatePartners(customPartners);
    setShowWizard(false);
  };

  // Save changes from collapsed settings panel
  const handleSaveSettings = () => {
    const customPartners = getCustomPartnersPayload();
    onUpdatePartners(customPartners);
    setIsOpen(false);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* --- INITIAL NICKNAMES WIZARD (FOR NEW USERS) --- */}
      {showWizard && (
        <div style={styles.wizardOverlay}>
          <div className="comic-card animate-float" style={styles.wizardCard}>
            <div style={styles.wizardHeader}>
              <div style={styles.dogContainer}>
                {/* SVG AUTHENTIC MALTESE FLUFFY DOGS HUGGING */}
                <svg viewBox="0 0 100 50" style={styles.wizardDogsSvg}>
                  {/* Left fluffy white dog */}
                  <ellipse cx="18" cy="24" rx="7" ry="10" fill="#FFFFFF" stroke="#5D4A3E" strokeWidth="2.5" />
                  <ellipse cx="42" cy="24" rx="7" ry="10" fill="#FFFFFF" stroke="#5D4A3E" strokeWidth="2.5" />
                  <ellipse cx="30" cy="30" rx="16" ry="13" fill="#FFFFFF" stroke="#5D4A3E" strokeWidth="2.5" />
                  <circle cx="25" cy="28" r="2.2" fill="#5D4A3E" />
                  <circle cx="35" cy="28" r="2.2" fill="#5D4A3E" />
                  <ellipse cx="20" cy="32" rx="2.5" ry="1.5" fill="#FFC4C4" />
                  <ellipse cx="40" cy="32" rx="2.5" ry="1.5" fill="#FFC4C4" />
                  <ellipse cx="30" cy="31" rx="2" ry="1.2" fill="#5D4A3E" />
                  <path d="M 28,34 Q 30,36 32,34" fill="none" stroke="#5D4A3E" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Right golden-brown puppy */}
                  <path d="M 58,22 Q 52,26 56,38 Q 60,42 62,34 Z" fill="#E5A96E" stroke="#5D4A3E" strokeWidth="2.5" />
                  <path d="M 82,22 Q 88,26 84,38 Q 80,42 78,34 Z" fill="#E5A96E" stroke="#5D4A3E" strokeWidth="2.5" />
                  <ellipse cx="70" cy="30" rx="15" ry="13" fill="#E5A96E" stroke="#5D4A3E" strokeWidth="2.5" />
                  <circle cx="65" cy="28" r="2.2" fill="#5D4A3E" />
                  <circle cx="75" cy="28" r="2.2" fill="#5D4A3E" />
                  <ellipse cx="61" cy="32" rx="2.5" ry="1.5" fill="#FF8B8B" />
                  <ellipse cx="79" cy="32" rx="2.5" ry="1.5" fill="#FF8B8B" />
                  <ellipse cx="70" cy="31" rx="2" ry="1.2" fill="#5D4A3E" />
                  <path d="M 67,33 Q 70,37 73,33 Z" fill="#C0392B" stroke="#5D4A3E" strokeWidth="1.5" />

                  {/* Red Heart */}
                  <path d="M 50,33 Q 47,28 43,29 Q 39,31 43,37 L 50,44 L 57,37 Q 61,31 57,29 Q 53,28 50,33 Z" fill="#FF8B8B" stroke="#5D4A3E" strokeWidth="2" className="animate-float" />
                </svg>
              </div>
              <h2 style={styles.wizardTitle}>🤍 歡迎來到 HeartSync 🤍</h2>
              <p style={styles.wizardSubtitle}>設定您們的專屬暱稱與代表的線條小狗，開啟雙向奔赴的心意平衡之旅！</p>
            </div>

            <div style={styles.wizardBody}>
              <div style={styles.wizardSection}>
                <h3 style={styles.sectionHeader}>🐶 設定雙方暱稱與小狗角色</h3>
                
                <div style={styles.namesRow}>
                  {/* Partner 1 Input */}
                  <div style={styles.inputCol}>
                    <label style={styles.label}>
                      伴侶一 姓名
                      <span style={{ fontSize: '0.75rem', color: p1Role === 'white_dog' ? 'var(--text-muted)' : 'var(--color-brown)', marginLeft: '6px', fontWeight: '700' }}>
                        ({p1Role === 'white_dog' ? '🤍 白色小狗' : '棕色小狗'})
                      </span>
                    </label>
                    <input 
                      type="text" 
                      value={p1Name} 
                      onChange={(e) => setP1Name(e.target.value)} 
                      className="comic-input" 
                      placeholder="例如：老公、小明..."
                    />
                  </div>

                  {/* Swap Button */}
                  <div style={styles.swapCol}>
                    <button 
                      type="button" 
                      onClick={handleSwapRoles} 
                      className="comic-btn secondary"
                      style={styles.swapBtn}
                      title="互換代表小狗"
                    >
                      <ArrowLeftRight size={16} />
                    </button>
                  </div>

                  {/* Partner 2 Input */}
                  <div style={styles.inputCol}>
                    <label style={styles.label}>
                      伴侶二 姓名
                      <span style={{ fontSize: '0.75rem', color: p2Role === 'white_dog' ? 'var(--text-muted)' : 'var(--color-brown)', marginLeft: '6px', fontWeight: '700' }}>
                        ({p2Role === 'white_dog' ? '🤍 白色小狗' : '棕色小狗'})
                      </span>
                    </label>
                    <input 
                      type="text" 
                      value={p2Name} 
                      onChange={(e) => setP2Name(e.target.value)} 
                      className="comic-input" 
                      placeholder="例如：老婆、小美..."
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleStart} 
                className="comic-btn pink" 
                style={{ width: '100%', marginTop: '10px', padding: '12px 16px', fontSize: '1.05rem' }}
              >
                🤍 開始體驗 HeartSync ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING STATUS & SETTINGS TOGGLE BAR --- */}
      <div style={styles.statusContainer}>
        <div style={styles.statusBadges}>
          {syncConfig.token && syncConfig.gistId && !offlineMode ? (
            <div style={{ ...styles.badge, backgroundColor: '#E1ECC8' }}>
              <Cloud size={16} />
              <span>雲端已同步</span>
              <span style={styles.dotPulse} />
            </div>
          ) : (
            <div style={{ ...styles.badge, backgroundColor: '#FFF0B5' }}>
              <CloudOff size={16} />
              <span>本機離線模式</span>
            </div>
          )}

          {/* Sync Status Texts */}
          <span style={styles.syncStatusText}>
            狀態: {isSyncing ? '✨ 正在同步心意...' : syncStatus}
          </span>
        </div>

        <div style={styles.buttonGroup}>
          {syncConfig.token && syncConfig.gistId && !offlineMode && (
            <button 
              onClick={onPull} 
              className="comic-btn secondary" 
              disabled={isSyncing}
              style={styles.actionBtn}
              title="手動下拉最新數據"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin-slow' : ''} />
              <span>手動同步</span>
            </button>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="comic-btn secondary"
            style={styles.actionBtn}
          >
            <span>修改角色暱稱</span>
          </button>
        </div>
      </div>

      {/* --- COLLAPSIBLE SETTINGS PANEL (NAMES & ROLES ONLY) --- */}
      {isOpen && (
        <div className="comic-card" style={styles.settingsPanel}>
          <h3 style={styles.panelTitle}>🐾 雙方暱稱與角色設定</h3>
          
          <div style={{ ...styles.wizardSection, border: 'none', padding: 0, boxShadow: 'none' }}>
            <div style={styles.namesRow}>
              <div style={styles.inputCol}>
                <label style={styles.label}>伴侶一 姓名 ({p1Role === 'white_dog' ? '🤍 白狗' : '棕狗'})</label>
                <input 
                  type="text" 
                  value={p1Name} 
                  onChange={(e) => setP1Name(e.target.value)} 
                  className="comic-input" 
                />
              </div>

              <div style={styles.swapCol}>
                <button 
                  type="button" 
                  onClick={handleSwapRoles} 
                  className="comic-btn secondary"
                  style={styles.swapBtn}
                >
                  <ArrowLeftRight size={16} />
                </button>
              </div>

              <div style={styles.inputCol}>
                <label style={styles.label}>伴侶二 姓名 ({p2Role === 'white_dog' ? '🤍 白狗' : '棕狗'})</label>
                <input 
                  type="text" 
                  value={p2Name} 
                  onChange={(e) => setP2Name(e.target.value)} 
                  className="comic-input" 
                />
              </div>
            </div>
          </div>

          <div style={styles.panelActions}>
            <button 
              onClick={handleSaveSettings} 
              className="comic-btn pink" 
              style={{ marginLeft: 'auto', width: '100%', marginTop: '16px' }}
            >
              儲存並更新角色
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wizardOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(93, 74, 62, 0.4)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  wizardCard: {
    maxWidth: '520px',
    width: '100%',
    maxHeight: '92vh',
    overflowY: 'auto',
    backgroundColor: '#FAF6EE',
    padding: '24px',
  },
  wizardHeader: {
    textAlign: 'center',
    marginBottom: '16px',
  },
  dogContainer: {
    width: '140px',
    height: '70px',
    margin: '0 auto 6px auto',
  },
  wizardDogsSvg: {
    width: '100%',
    height: '100%',
  },
  wizardTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#5D4A3E',
    marginBottom: '6px',
  },
  wizardSubtitle: {
    fontSize: '0.9rem',
    color: '#8E7E73',
    lineHeight: '1.4',
  },
  wizardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  wizardSection: {
    backgroundColor: '#FFFFFF',
    border: '3px solid #5D4A3E',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '3px 3px 0px #5D4A3E',
  },
  sectionHeader: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#5D4A3E',
    marginBottom: '12px',
    borderBottom: '2px dashed var(--border-color)',
    paddingBottom: '8px',
  },
  namesRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
  },
  inputCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  swapCol: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2px',
  },
  swapBtn: {
    padding: '10px',
    borderRadius: '12px',
    boxShadow: '2px 2px 0px #5D4A3E',
    backgroundColor: '#FAF6EE',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#5D4A3E',
    display: 'flex',
    alignItems: 'center',
  },
  statusContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '3px solid #5D4A3E',
    borderRadius: '16px',
    padding: '8px 16px',
    boxShadow: '2px 2px 0px #5D4A3E',
    flexWrap: 'wrap',
    gap: '12px',
  },
  statusBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '99px',
    fontSize: '0.85rem',
    fontWeight: '700',
    border: '2px solid #5D4A3E',
    position: 'relative',
  },
  dotPulse: {
    width: '6px',
    height: '6px',
    backgroundColor: '#4E9F3D',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pulse 1.5s infinite',
  },
  syncStatusText: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#8E7E73',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '6px 12px',
    fontSize: '0.85rem',
    borderRadius: '10px',
    boxShadow: '2px 2px 0px #5D4A3E',
  },
  settingsPanel: {
    marginTop: '12px',
    animation: 'pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  panelTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    marginBottom: '14px',
    color: '#5D4A3E',
  },
  panelActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '16px',
  }
};
