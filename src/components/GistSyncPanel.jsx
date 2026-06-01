import React, { useState } from 'react';
import { Settings, RefreshCw, Cloud, CloudOff, ArrowLeftRight, Check } from 'lucide-react';

export default function GistSyncPanel({ 
  syncConfig, 
  saveConfig, 
  syncStatus, 
  onPull, 
  onPush, 
  isSyncing,
  offlineMode,
  partners,
  onUpdatePartners,
  myIdentity = 'p1',
  onUpdateMyIdentity
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
            <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '3px solid #000000', paddingBottom: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', border: '3px solid #000000', borderRadius: '50%', marginBottom: '12px', fontSize: '1.4rem', boxShadow: '2px 2px 0px #000000', backgroundColor: '#FFFFFF' }}>
                🤍
              </div>
              <h2 style={styles.wizardTitle}>歡迎來到 HeartSync</h2>
              <p style={styles.wizardSubtitle}>設定您們的代表名稱，開啟共同生活付出的極簡天秤紀錄之旅。</p>
            </div>

            <div style={styles.wizardBody}>
              <div style={styles.wizardSection}>
                <h3 style={styles.sectionHeader}>設定伴侶名稱與小狗角色</h3>
                
                <div style={styles.namesRow}>
                  {/* Partner 1 Input */}
                  <div style={styles.inputCol}>
                    <label style={styles.label}>
                      伴侶一 姓名
                      <span style={{ fontSize: '0.75rem', color: '#666666', marginLeft: '6px', fontWeight: '800' }}>
                        ({p1Role === 'white_dog' ? '白狗' : '灰狗'})
                      </span>
                    </label>
                    <input 
                      type="text" 
                      value={p1Name} 
                      onChange={(e) => setP1Name(e.target.value)} 
                      className="comic-input" 
                      placeholder="例如：小明、伴侶A..."
                    />
                  </div>

                  {/* Swap Button */}
                  <div style={styles.swapCol}>
                    <button 
                      type="button" 
                      onClick={handleSwapRoles} 
                      className="comic-btn secondary"
                      style={styles.swapBtn}
                      title="互換代表角色"
                    >
                      <ArrowLeftRight size={16} />
                    </button>
                  </div>

                  {/* Partner 2 Input */}
                  <div style={styles.inputCol}>
                    <label style={styles.label}>
                      伴侶二 姓名
                      <span style={{ fontSize: '0.75rem', color: '#666666', marginLeft: '6px', fontWeight: '800' }}>
                        ({p2Role === 'white_dog' ? '白狗' : '灰狗'})
                      </span>
                    </label>
                    <input 
                      type="text" 
                      value={p2Name} 
                      onChange={(e) => setP2Name(e.target.value)} 
                      className="comic-input" 
                      placeholder="例如：小美、伴侶B..."
                    />
                  </div>
                </div>

                {/* Who am I device selection */}
                <div style={{ marginTop: '20px' }}>
                  <label style={styles.label}>這台裝置主要使用者是誰？（預設為該使用者記帳）</label>
                  <div style={styles.identityRow}>
                    <button
                      type="button"
                      onClick={() => onUpdateMyIdentity('p1')}
                      style={{
                        ...styles.identityBtn,
                        backgroundColor: myIdentity === 'p1' ? '#000000' : '#FFFFFF',
                        color: myIdentity === 'p1' ? '#FFFFFF' : '#000000',
                      }}
                    >
                      {p1Name} ({p1Role === 'white_dog' ? '白狗' : '灰狗'})
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateMyIdentity('p2')}
                      style={{
                        ...styles.identityBtn,
                        backgroundColor: myIdentity === 'p2' ? '#000000' : '#FFFFFF',
                        color: myIdentity === 'p2' ? '#FFFFFF' : '#000000',
                      }}
                    >
                      {p2Name} ({p2Role === 'white_dog' ? '白狗' : '灰狗'})
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleStart} 
                className="comic-btn" 
                style={{ width: '100%', marginTop: '10px', padding: '12px 16px', fontSize: '1.05rem', backgroundColor: '#000000', color: '#FFFFFF' }}
              >
                開始體驗 HeartSync
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING STATUS & SETTINGS TOGGLE BAR --- */}
      <div style={styles.statusContainer}>
        <div style={styles.statusBadges}>
          {syncConfig.token && syncConfig.gistId && !offlineMode ? (
            <div style={{ ...styles.badge, backgroundColor: '#FFFFFF' }}>
              <Cloud size={16} />
              <span>雲端已連線</span>
              <span style={styles.dotPulse} />
            </div>
          ) : (
            <div style={{ ...styles.badge, backgroundColor: '#FFFFFF' }}>
              <CloudOff size={16} />
              <span>離線體驗中</span>
            </div>
          )}

          {/* Sync Status Texts */}
          <span style={styles.syncStatusText}>
            {isSyncing ? '正在同步中...' : syncStatus}
          </span>
        </div>

        <div style={styles.buttonGroup}>
          {syncConfig.token && syncConfig.gistId && !offlineMode && (
            <button 
              onClick={onPull} 
              className="comic-btn secondary" 
              disabled={isSyncing}
              style={styles.actionBtn}
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
            <span>修改暱稱與使用者</span>
          </button>
        </div>
      </div>

      {/* --- COLLAPSIBLE SETTINGS PANEL --- */}
      {isOpen && (
        <div className="comic-card" style={styles.settingsPanel}>
          <h3 style={styles.panelTitle}>雙方暱稱與角色設定</h3>
          
          <div style={{ ...styles.wizardSection, border: 'none', padding: 0, boxShadow: 'none' }}>
            <div style={styles.namesRow}>
              <div style={styles.inputCol}>
                <label style={styles.label}>伴侶一 姓名 ({p1Role === 'white_dog' ? '白狗' : '灰狗'})</label>
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
                <label style={styles.label}>伴侶二 姓名 ({p2Role === 'white_dog' ? '白狗' : '灰狗'})</label>
                <input 
                  type="text" 
                  value={p2Name} 
                  onChange={(e) => setP2Name(e.target.value)} 
                  className="comic-input" 
                />
              </div>
            </div>

            {/* Who am I device selection */}
            <div style={{ marginTop: '20px' }}>
              <label style={styles.label}>這台裝置主要使用者是誰？（預設為該使用者記帳）</label>
              <div style={styles.identityRow}>
                <button
                  type="button"
                  onClick={() => onUpdateMyIdentity('p1')}
                  style={{
                    ...styles.identityBtn,
                    backgroundColor: myIdentity === 'p1' ? '#000000' : '#FFFFFF',
                    color: myIdentity === 'p1' ? '#FFFFFF' : '#000000',
                  }}
                >
                  {p1Name} ({p1Role === 'white_dog' ? '白狗' : '灰狗'})
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateMyIdentity('p2')}
                  style={{
                    ...styles.identityBtn,
                    backgroundColor: myIdentity === 'p2' ? '#000000' : '#FFFFFF',
                    color: myIdentity === 'p2' ? '#FFFFFF' : '#000000',
                  }}
                >
                  {p2Name} ({p2Role === 'white_dog' ? '白狗' : '灰狗'})
                </button>
              </div>
            </div>
          </div>

          <div style={styles.panelActions}>
            <button 
              onClick={handleSaveSettings} 
              className="comic-btn" 
              style={{ marginLeft: 'auto', width: '100%', marginTop: '16px', backgroundColor: '#000000', color: '#FFFFFF' }}
            >
              儲存並更新
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
    backgroundColor: '#FFFFFF',
    padding: '28px',
    border: '3px solid #000000',
    boxShadow: '8px 8px 0px #000000',
  },
  wizardHeader: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  dogContainer: {
    width: '140px',
    height: '70px',
    margin: '0 auto 8px auto',
  },
  wizardDogsSvg: {
    width: '100%',
    height: '100%',
  },
  wizardTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#000000',
    marginBottom: '8px',
    letterSpacing: '0.5px',
  },
  wizardSubtitle: {
    fontSize: '0.9rem',
    color: '#666666',
    lineHeight: '1.5',
    fontWeight: '700',
  },
  wizardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  wizardSection: {
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    borderRadius: '0px',
    padding: '20px',
    boxShadow: '4px 4px 0px #000000',
  },
  sectionHeader: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#000000',
    marginBottom: '16px',
    borderBottom: '2px dashed #000000',
    paddingBottom: '8px',
  },
  namesRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
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
    boxShadow: '2px 2px 0px #000000',
    backgroundColor: '#FFFFFF',
    border: '2.5px solid #000000',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
  },
  statusContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    borderRadius: '0px',
    padding: '8px 16px',
    boxShadow: '3px 3px 0px #000000',
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
    padding: '4px 12px',
    borderRadius: '0px',
    fontSize: '0.8rem',
    fontWeight: '800',
    border: '2.5px solid #000000',
    position: 'relative',
  },
  dotPulse: {
    width: '6px',
    height: '6px',
    backgroundColor: '#000000',
    borderRadius: '50%',
    display: 'inline-block',
  },
  syncStatusText: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#666666',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '6px 14px',
    fontSize: '0.82rem',
    borderRadius: '8px',
    boxShadow: '2px 2px 0px #000000',
    backgroundColor: '#FFFFFF',
    border: '2.5px solid #000000',
  },
  settingsPanel: {
    marginTop: '12px',
    border: '3px solid #000000',
    boxShadow: '4px 4px 0px #000000',
    borderRadius: '0px',
  },
  panelTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    marginBottom: '16px',
    color: '#000000',
  },
  panelActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '16px',
  },
  identityRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
  },
  identityBtn: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    fontFamily: 'inherit',
    fontWeight: '800',
    fontSize: '0.82rem',
    cursor: 'pointer',
    border: '2.5px solid #000000',
    boxShadow: '2px 2px 0px #000000',
    transition: 'all 0.1s ease',
  }
};
