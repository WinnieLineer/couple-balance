import React, { useState } from 'react';
import { Settings, RefreshCw, Cloud, CloudOff, Database, Sparkles, Lock, AlertCircle, CheckCircle2, HelpCircle, ArrowLeftRight, HelpCircle as Help } from 'lucide-react';
import { createSecretGist } from '../utils/githubGist';

export default function GistSyncPanel({ 
  syncConfig, 
  saveConfig, 
  syncStatus, 
  onPull, 
  onPush, 
  isSyncing,
  offlineMode,
  setOfflineMode,
  partners,
  onUpdatePartners
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(syncConfig.token || '');
  const [gistId, setGistId] = useState(syncConfig.gistId || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Magic: One-click create secret Gist
  const handleAutoCreateGist = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!token.trim()) {
      setErrorMsg('⚠️ 請先在下方輸入您的 GitHub Token 才能為您自動新建喔！');
      return;
    }
    
    setIsLoading(true);

    try {
      const customPartners = getCustomPartnersPayload();
      
      const initialDb = {
        meta: {
          created_at: new Date().toISOString(),
          version: '1.0'
        },
        records: [],
        partners: customPartners
      };

      const newGistId = await createSecretGist(token.trim(), initialDb);
      setGistId(newGistId);
      
      // Update parent partners state first
      onUpdatePartners(customPartners);
      // Save sync details
      saveConfig(token.trim(), newGistId, customPartners);
      
      setSuccessMsg('🎉 建立成功！已自動為您在 GitHub 建立祕密 Gist 並完成對接！');
      setOfflineMode(false);
    } catch (err) {
      setErrorMsg(`❌ 建立失敗：${err.message || '請確認 Token 是否具備 "gist" 權限'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!token.trim() || !gistId.trim()) {
      setErrorMsg('⚠️ 請同時填入 Token 與 Gist ID，或點擊「一鍵新建」喔！');
      return;
    }
    
    const customPartners = getCustomPartnersPayload();
    onUpdatePartners(customPartners);
    saveConfig(token.trim(), gistId.trim(), customPartners);
    
    setSuccessMsg('💾 設定與角色已儲存並成功連接！');
    setOfflineMode(false);
  };

  const handleOfflineModeSelect = () => {
    const customPartners = getCustomPartnersPayload();
    onUpdatePartners(customPartners);
    
    // Save locally
    localStorage.setItem('partners_config', JSON.stringify(customPartners));
    setOfflineMode(true);
    setIsOpen(false);
  };

  // If no sync details and NOT explicitly using offline mode, show the cute Setup Wizard
  // Also check if Vite has pre-injected secrets (if so, skip wizard entirely!)
  const isEnvSecretInjected = !!(import.meta.env.VITE_GIST_TOKEN && import.meta.env.VITE_GIST_ID);
  const showWizard = !isEnvSecretInjected && !offlineMode && (!syncConfig.token || !syncConfig.gistId);

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* --- INITIAL WIZARD MODAL (FOR NEW USERS) --- */}
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
              <h2 style={styles.wizardTitle}>🤍 歡迎來到 HeartSync！ 🤍</h2>
              <p style={styles.wizardSubtitle}>這是一個專屬您們的甜蜜天秤。請先設定暱稱並選擇您們的生活資料庫連線方式：</p>
            </div>

            <div style={styles.wizardBody}>
              {/* --- STEP 1: PARTNERS NICKNAMES & CHARACTERS --- */}
              <div style={styles.wizardSection}>
                <h3 style={styles.sectionHeader}>🐶 步驟一：設定雙方暱稱與代表小狗</h3>
                
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
                      title="互換小狗角色"
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

              {/* --- STEP 2: STORAGE CONFIG --- */}
              <div style={styles.wizardSection}>
                <h3 style={styles.sectionHeader}>☁️ 步驟二：選擇您的數據儲存方式</h3>
                
                {/* Option A: Gist Sync Setup */}
                <div style={styles.optionBox}>
                  <div style={styles.optionHeader}>
                    <Cloud size={20} color="#5D4A3E" />
                    <h4 style={styles.optionTitle}>雲端雙向即時同步（推薦 ✨）</h4>
                  </div>
                  <p style={styles.optionDesc}>不論是用手機或電腦，雙方都能隨時記錄並自動同步！</p>
                  
                  {/* IMMEDIATELY VISIBLE ERROR PLACEMENT */}
                  {errorMsg && (
                    <div style={{ ...styles.alertError, margin: '8px 0' }}>
                      <AlertCircle size={16} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <Lock size={12} style={{ marginRight: '4px' }} />
                      GitHub Personal Access Token (PAT)
                      <a href="https://github.com/settings/tokens/new?scopes=gist&description=Couple%20Balance%20App" target="_blank" rel="noopener noreferrer" style={styles.helpLink}>
                        <HelpCircle size={12} /> 點我申請 (需勾選 gist 權限)
                      </a>
                    </label>
                    <input 
                      type="password" 
                      placeholder="貼上您的 ghp_ 開頭 Token" 
                      value={token} 
                      onChange={(e) => setToken(e.target.value)} 
                      className="comic-input" 
                    />
                    
                    {/* Secrets workflow guide */}
                    <div style={styles.secretsTip}>
                      <span style={{ fontWeight: '700' }}>🔒 頂級安全推薦 (GitHub Secrets) </span>
                      <div>
                        不想在瀏覽器填寫 Token？您可以在 GitHub 專案的 **Settings** -&gt; **Secrets and variables** -&gt; **Actions** 中新增機密 `GIST_TOKEN` (填入 PAT) 與 `GIST_ID`。Actions 在 CI/CD 打包時會自動注入，網頁開啟即可**自動同步，完全免登入**，極致隱私安全！
                      </div>
                    </div>
                  </div>

                  <div style={styles.actionButtons}>
                    <button 
                      onClick={handleAutoCreateGist} 
                      className="comic-btn" 
                      disabled={isLoading}
                      style={{ flex: 1, padding: '10px 12px', fontSize: '0.9rem' }}
                    >
                      <Sparkles size={14} />
                      {isLoading ? '正在建立雲端空間...' : '一鍵自動新建雲端資料庫'}
                    </button>
                  </div>

                  <div style={{ margin: '12px 0', textAlign: 'center', color: '#8E7E73', fontSize: '0.85rem' }}>─ 或者貼入現有 Gist ID ─</div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}><Database size={12} style={{ marginRight: '4px' }} /> 貼入既有的 Gist ID</label>
                    <input 
                      type="text" 
                      placeholder="輸入 32 位字元的 Gist ID" 
                      value={gistId} 
                      onChange={(e) => setGistId(e.target.value)} 
                      className="comic-input" 
                    />
                  </div>

                  <button 
                    onClick={handleSave} 
                    className="comic-btn pink" 
                    disabled={isLoading} 
                    style={{ width: '100%', marginTop: '6px', padding: '10px 12px', fontSize: '0.9rem' }}
                  >
                    <CheckCircle2 size={14} /> 儲存並連接既有 Gist
                  </button>
                </div>

                {/* Option B: Local Mode */}
                <div style={styles.offlineBox}>
                  <div style={styles.optionHeader}>
                    <CloudOff size={18} color="#8E7E73" />
                    <h4 style={styles.optionTitle}>本機體驗模式（暫不同步）</h4>
                  </div>
                  <p style={styles.optionDesc}>
                    將資料安全存放在此瀏覽器中。隨時點擊右上角「同步設定」來綁定 GitHub 進行備份。
                  </p>
                  <button 
                    onClick={handleOfflineModeSelect} 
                    className="comic-btn secondary" 
                    style={{ width: '100%', marginTop: '8px', padding: '10px 12px', fontSize: '0.9rem' }}
                  >
                    直接儲存在本機，開始體驗！ 🐾
                  </button>
                </div>
              </div>
            </div>

            {successMsg && (
              <div style={styles.alertSuccess}>
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- FLOATING STATUS & SETTINGS TOGGLE BAR --- */}
      <div style={styles.statusContainer}>
        <div style={styles.statusBadges}>
          {isEnvSecretInjected ? (
            <div style={{ ...styles.badge, backgroundColor: '#E1ECC8' }}>
              <Cloud size={16} />
              <span>雲端託管中 (Secrets)</span>
              <span style={styles.dotPulse} />
            </div>
          ) : syncConfig.token && syncConfig.gistId && !offlineMode ? (
            <div style={{ ...styles.badge, backgroundColor: '#E1ECC8' }}>
              <Cloud size={16} />
              <span>雲端同步中</span>
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
            <Settings size={14} />
            <span>角色與同步設定</span>
          </button>
        </div>
      </div>

      {/* --- COLLAPSIBLE SETTINGS PANEL --- */}
      {isOpen && (
        <div className="comic-card" style={styles.settingsPanel}>
          <h3 style={styles.panelTitle}>🐾 角色暱稱與 GitHub Gist 設定</h3>
          
          {/* Custom Nicknames Panel */}
          <div style={{ ...styles.wizardSection, marginBottom: '20px' }}>
            <h4 style={styles.sectionHeader}>🐶 雙方暱稱與角色設定</h4>
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

          {/* Secrets Alert if injected */}
          {isEnvSecretInjected && (
            <div style={{ ...styles.alertSuccess, marginBottom: '16px', fontSize: '0.85rem' }}>
              <Lock size={16} />
              <span>此網頁的 GitHub Token 與 Gist ID 已成功透過 GitHub Secrets 安全注入！您無須進行手動配置。</span>
            </div>
          )}

          {!isEnvSecretInjected && (
            <>
              {errorMsg && (
                <div style={{ ...styles.alertError, marginBottom: '12px' }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Lock size={14} style={{ marginRight: '4px' }} />
                  GitHub Personal Access Token (PAT)
                </label>
                <input 
                  type="password" 
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx" 
                  value={token} 
                  onChange={(e) => setToken(e.target.value)} 
                  className="comic-input" 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Database size={14} style={{ marginRight: '4px' }} />
                  Gist ID
                </label>
                <input 
                  type="text" 
                  placeholder="輸入 32 位字元的 Gist ID" 
                  value={gistId} 
                  onChange={(e) => setGistId(e.target.value)} 
                  className="comic-input" 
                />
              </div>
            </>
          )}

          <div style={styles.panelActions}>
            {!isEnvSecretInjected && (
              <button 
                onClick={handleAutoCreateGist} 
                className="comic-btn" 
                disabled={isLoading}
              >
                <Sparkles size={16} />
                {isLoading ? '正在新建...' : '一鍵新建 Gist'}
              </button>
            )}

            <button 
              onClick={handleSave} 
              className="comic-btn pink" 
              disabled={isLoading}
              style={{ marginLeft: 'auto' }}
            >
              儲存所有設定
            </button>

            {offlineMode && !isEnvSecretInjected && (
              <button 
                onClick={() => {
                  const customPartners = getCustomPartnersPayload();
                  onUpdatePartners(customPartners);
                  localStorage.setItem('partners_config', JSON.stringify(customPartners));
                  setOfflineMode(false);
                }}
                className="comic-btn secondary"
              >
                儲存本機並切回雲端
              </button>
            )}
          </div>

          {successMsg && (
            <div style={styles.alertSuccess} style={{ marginTop: '12px' }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}
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
    maxWidth: '620px',
    width: '100%',
    maxHeight: '92vh',
    overflowY: 'auto',
    backgroundColor: '#FAF6EE',
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
  optionBox: {
    border: '2px solid #5D4A3E',
    borderRadius: '14px',
    padding: '14px',
    backgroundColor: '#FFFDF9',
    marginBottom: '12px',
  },
  offlineBox: {
    border: '2px dashed #8E7E73',
    borderRadius: '14px',
    padding: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  optionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  },
  optionTitle: {
    fontSize: '0.98rem',
    fontWeight: '700',
    color: '#5D4A3E',
  },
  optionDesc: {
    fontSize: '0.82rem',
    color: '#8E7E73',
    marginBottom: '10px',
    lineHeight: '1.4',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '10px',
    textAlign: 'left',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#5D4A3E',
    display: 'flex',
    alignItems: 'center',
  },
  helpLink: {
    marginLeft: 'auto',
    color: '#E5A96E',
    textDecoration: 'none',
    fontSize: '0.78rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  alertError: {
    padding: '10px',
    backgroundColor: '#FFD3D3',
    border: '2.5px solid #5D4A3E',
    borderRadius: '10px',
    color: '#5D4A3E',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    width: '100%',
    boxSizing: 'border-box',
  },
  alertSuccess: {
    padding: '10px',
    backgroundColor: '#E1ECC8',
    border: '2.5px solid #5D4A3E',
    borderRadius: '10px',
    color: '#5D4A3E',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    width: '100%',
    boxSizing: 'border-box',
  },
  secretsTip: {
    backgroundColor: '#FAF6EE',
    border: '2px dashed #E5A96E',
    borderRadius: '10px',
    padding: '10px',
    marginTop: '8px',
    fontSize: '0.78rem',
    color: '#5D4A3E',
    lineHeight: '1.4',
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
