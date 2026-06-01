import React, { useState, useEffect } from 'react';
import { RefreshCw, Cloud, CloudOff, ArrowLeftRight } from 'lucide-react';
import { createSecretGist, fetchGistData, updateGistData } from '../utils/githubGist';

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
  onUpdatePartners,
  myIdentity = 'p1',
  onUpdateMyIdentity,
  isLocal = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Show onboarding wizard if nicknames haven't been set yet in localStorage
  const [showWizard, setShowWizard] = useState(!localStorage.getItem('partners_config'));

  // Wizard state for custom names and roles (Create mode)
  const [p1Name, setP1Name] = useState(partners.p1.name || '伴侶一');
  const [p2Name, setP2Name] = useState(partners.p2.name || '伴侶二');
  const [p1Role, setP1Role] = useState(partners.p1.role || 'white_dog');
  const [p2Role, setP2Role] = useState(partners.p2.role || 'brown_dog');

  // Gist credentials input states (Local Developer use)
  const [gistIdInput, setGistIdInput] = useState(syncConfig.gistId || '');
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Onboarding Wizard Modes & States
  const [wizardMode, setWizardMode] = useState('create'); // 'create' | 'join'
  const [joinGistId, setJoinGistId] = useState('');
  const [fetchedPartners, setFetchedPartners] = useState(null);
  const [selectedJoinIdentity, setSelectedJoinIdentity] = useState('');

  // Wizard optional Gist ID creation & invitation text states
  const [wizardGistId, setWizardGistId] = useState('');
  const [invitationText, setInvitationText] = useState('');
  const [isCreatingGistInWizard, setIsCreatingGistInWizard] = useState(false);

  // Sync inputs with config props
  useEffect(() => {
    setGistIdInput(syncConfig.gistId || '');
  }, [syncConfig]);

  // On mount: read ?gistId= from URL, auto-switch to join mode and pre-fill
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlGistId = params.get('gistId');
    if (urlGistId && !localStorage.getItem('partners_config')) {
      // New user arriving via invite link — switch to join mode and pre-fill
      setWizardMode('join');
      setJoinGistId(urlGistId);
      // Clean the URL so the param doesn't persist after setup
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  // Toggle roles (which dog represents who)
  const handleSwapRoles = () => {
    const tempRole = p1Role;
    setP1Role(p2Role);
    setP2Role(tempRole);
  };

  const getCustomPartnersPayload = () => {
    return {
      p1: { name: p1Name.trim() || '伴侶一', role: p1Role },
      p2: { name: p2Name.trim() || '伴侶二', role: p2Role }
    };
  };

  // Offline start — skip Gist entirely
  const handleOfflineStart = () => {
    const customPartners = getCustomPartnersPayload();
    if (onUpdateMyIdentity) onUpdateMyIdentity('p1');
    onUpdatePartners(customPartners);
    setShowWizard(false);
  };

  // Complete onboarding and start App (Create Mode)
  const handleStart = async () => {
    const customPartners = getCustomPartnersPayload();

    // Automatically set default identity to p1 on the creator device
    if (onUpdateMyIdentity) {
      onUpdateMyIdentity('p1');
    }

    const gistIdClean = wizardGistId.trim();
    const finalToken = (import.meta.env.VITE_GIST_TOKEN || localStorage.getItem('gist_token') || '').trim();

    if (!finalToken) {
      setLocalError('⚠️ 系統未設定 GIST_TOKEN，無法建立雲端同步。請點選「先離線使用」。');
      return;
    }

    // Token exists — always use cloud sync
    setIsCreatingGistInWizard(true);
    setLocalError('');
    setLocalSuccess('正在建立您的專屬雲端天秤...');

    try {
      const currentDevId = localStorage.getItem('device_id') || '';
      customPartners.p1.deviceId = currentDevId;

      const initialPayload = {
        meta: { updated_at: new Date().toISOString(), version: '1.0' },
        records: [],
        partners: customPartners
      };

      let finalGistId = gistIdClean;

      if (finalGistId) {
        // User provided a specific Gist ID → initialise it
        await updateGistData(finalToken, finalGistId, initialPayload);
      } else {
        // No Gist ID provided → auto-create a new one
        finalGistId = await createSecretGist(finalToken, initialPayload);
        setWizardGistId(finalGistId); // show it in the UI
      }

      // Save config in parent
      saveConfig(finalToken, finalGistId, customPartners, 'p1');

      const inviteUrl = `https://winnie-lin.space/couple-balance/?gistId=${finalGistId}`;
      const inviteMsg = `Hi！我已經在 HeartSync 建立了我們的專屬生活付出天秤囉！⚖️\n\n🔗 點擊此連結直接加入（免複製貼上）：\n${inviteUrl}\n\n開啟後在引導精靈中確認身份，即可即時雙向同步！✨`;
      setInvitationText(inviteMsg);

      setShowWizard(false);
    } catch (err) {
      console.error(err);
      setLocalError(`建立雲端天秤失敗：${err.message || '連線錯誤，請稍後再試。'}`);
      setIsCreatingGistInWizard(false);
    }
  };

  // Save changes from collapsed settings panel
  const handleSaveSettings = () => {
    const customPartners = getCustomPartnersPayload();
    onUpdatePartners(customPartners);
    setIsOpen(false);
  };

  // Save Gist credentials manually (Local mode)
  const handleSaveCloudConfig = () => {
    setLocalError('');
    setLocalSuccess('');
    
    const finalGistId = gistIdInput.trim();
    if (!finalGistId) {
      setLocalError('請填寫 Gist ID！');
      return;
    }
    
    const finalToken = (import.meta.env.VITE_GIST_TOKEN || localStorage.getItem('gist_token') || '').trim();
    if (!finalToken) {
      setLocalError('⚠️ 系統未設定 GIST_TOKEN，無法儲存雲端設定！');
      return;
    }
    
    const customPartners = getCustomPartnersPayload();
    

    saveConfig(finalToken, finalGistId, customPartners, myIdentity || 'p1');
    setLocalSuccess('雲端設定已儲存並載入！');
  };

  // Auto create new Gist (Local mode)
  const handleCreateNewGist = async () => {
    setLocalError('');
    setLocalSuccess('');
    
    const finalToken = (import.meta.env.VITE_GIST_TOKEN || localStorage.getItem('gist_token') || '').trim();
    if (!finalToken) {
      setLocalError('⚠️ 專案 Secrets 中未設定 GIST_TOKEN，無法一鍵自動建庫！');
      return;
    }
    
    try {
      setLocalSuccess('正在建立雲端資料庫...');
      const customPartners = getCustomPartnersPayload();
      
      // Seed with initial creator deviceId
      const currentDevId = localStorage.getItem('device_id') || '';
      const finalIdentity = myIdentity || 'p1';
      if (customPartners[finalIdentity]) {
        customPartners[finalIdentity].deviceId = currentDevId;
      }

      const initialPayload = {
        meta: { updated_at: new Date().toISOString(), version: '1.0' },
        records: [],
        partners: customPartners
      };
      
      const newGistId = await createSecretGist(finalToken, initialPayload);
      setGistIdInput(newGistId);
      saveConfig(finalToken, newGistId, customPartners, finalIdentity);
      
      const inviteUrl = `https://winnie-lin.space/couple-balance/?gistId=${newGistId}`;
      const inviteMsg = `Hi！我已經在 HeartSync 建立了我們的專屬生活付出天秤囉！⚖️\n\n🔗 點擊此連結直接加入（免複製貼上）：\n${inviteUrl}\n\n開啟後在引導精靈中確認身份，即可即時雙向同步！✨`;
      setInvitationText(inviteMsg);
      setLocalSuccess('雲端資料庫建立成功！');
    } catch (err) {
      console.error(err);
      setLocalError(`建立失敗：${err.message || '連線錯誤'}`);
    }
  };

  // Handle Gist connection in Join mode
  const handleJoinConnect = async () => {
    setLocalError('');
    setLocalSuccess('');
    
    const finalToken = (import.meta.env.VITE_GIST_TOKEN || localStorage.getItem('gist_token') || '').trim();
    const finalGistId = joinGistId.trim();
    
    if (!finalToken) {
      setLocalError('⚠️ 系統未設定 GIST_TOKEN，無法連結！');
      return;
    }
    if (!finalGistId) {
      setLocalError('請輸入 Gist ID！');
      return;
    }
    
    try {
      setLocalSuccess('正在連線雲端並載入天秤設定...');
      
      const cloudData = await fetchGistData(finalToken, finalGistId);
      if (cloudData && cloudData.partners) {
        setFetchedPartners(cloudData.partners);
        setLocalSuccess('連線成功！請選擇您的身份。');
      } else {
        throw new Error('雲端天秤中未找到伴侶暱稱設定，請確認此 Gist 是由本 App 建立的！');
      }
    } catch (err) {
      console.error(err);
      setLocalError(`連結失敗：${err.message || '連線錯誤'}`);
      setLocalSuccess('');
    }
  };

  // Complete onboarding wizard for Join mode
  const handleCompleteJoin = () => {
    if (!selectedJoinIdentity) {
      setLocalError('請選擇您在這台裝置上的身份！');
      return;
    }
    
    const finalToken = isLocal ? joinToken.trim() : (import.meta.env.VITE_GIST_TOKEN || '');
    const finalGistId = joinGistId.trim();
    
    // Save config and bind identity; pull=true so we fetch cloud records instead of pushing empty local
    saveConfig(finalToken, finalGistId, fetchedPartners, selectedJoinIdentity, true);
    
    if (onUpdateMyIdentity) {
      onUpdateMyIdentity(selectedJoinIdentity);
    }
    
    setShowWizard(false);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* --- CLOUD DATABASE INVITATION POPUP OVERLAY --- */}
      {invitationText && (
        <div style={styles.wizardOverlay}>
          <div className="comic-card animate-float wizard-card" style={{ ...styles.wizardCard, maxWidth: '480px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '3px solid #000000', paddingBottom: '12px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', border: '3px solid #000000', borderRadius: '50%', marginBottom: '8px', fontSize: '1.4rem', boxShadow: '2px 2px 0px #000000', backgroundColor: '#FFFFFF' }}>
                🎉
              </div>
              <h2 className="wizard-title" style={styles.wizardTitle}>雲端天秤建立成功！</h2>
              <p className="wizard-subtitle" style={styles.wizardSubtitle}>專屬雲端資料庫已成功備份至 GitHub！邀請您的伴侶開始同步吧。</p>
            </div>

            <div style={styles.wizardBody}>
              <div className="wizard-section" style={styles.wizardSection}>
                <label style={styles.label}>✉️ 傳給伴侶的邀請訊息：</label>
                <textarea
                  readOnly
                  value={invitationText}
                  onClick={(e) => e.target.select()}
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontFamily: 'inherit',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    lineHeight: '1.5',
                    border: '2.5px solid #000000',
                    backgroundColor: '#F8F8F8',
                    resize: 'none',
                    marginTop: '8px',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(invitationText);
                  alert('邀請訊息已成功複製到剪貼簿，快傳給伴侶吧！');
                  setInvitationText('');
                }}
                className="comic-btn"
                style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', backgroundColor: '#000000', color: '#FFFFFF' }}
              >
                📋 複製邀請訊息並開始使用
              </button>

              <button
                type="button"
                onClick={() => setInvitationText('')}
                className="comic-btn secondary"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                直接關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- INITIAL NICKNAMES WIZARD (FOR NEW USERS) --- */}
      {showWizard && (
        <div style={styles.wizardOverlay}>
          <div className="comic-card animate-float wizard-card" style={styles.wizardCard}>
            <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '3px solid #000000', paddingBottom: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', border: '3px solid #000000', borderRadius: '50%', marginBottom: '12px', fontSize: '1.4rem', boxShadow: '2px 2px 0px #000000', backgroundColor: '#FFFFFF' }}>
                ⚖️
              </div>
              <h2 className="wizard-title" style={styles.wizardTitle}>歡迎來到 HeartSync</h2>
              <p className="wizard-subtitle" style={styles.wizardSubtitle}>設定代表名稱或連結現有雲端天秤，開啟共同付出的極簡生活記帳之旅。</p>
            </div>

            {/* Segmented control tabs */}
            <div className="wizard-tab-container" style={styles.tabContainer}>
              <button
                type="button"
                onClick={() => {
                  setWizardMode('create');
                  setLocalError('');
                  setLocalSuccess('');
                }}
                className="wizard-tab-btn"
                style={{
                  ...styles.tabBtn,
                  backgroundColor: wizardMode === 'create' ? '#000000' : '#FFFFFF',
                  color: wizardMode === 'create' ? '#FFFFFF' : '#000000',
                }}
              >
                🆕 建立新同步天秤
              </button>
              <button
                type="button"
                onClick={() => {
                  setWizardMode('join');
                  setLocalError('');
                  setLocalSuccess('');
                }}
                className="wizard-tab-btn"
                style={{
                  ...styles.tabBtn,
                  backgroundColor: wizardMode === 'join' ? '#000000' : '#FFFFFF',
                  color: wizardMode === 'join' ? '#FFFFFF' : '#000000',
                }}
              >
                🔗 連結現有天秤 (Gist ID)
              </button>
            </div>

            <div style={styles.wizardBody}>
              {wizardMode === 'join' ? (
                // --- JOIN EXISTING GIST MODE ---
                !fetchedPartners ? (
                  <div className="wizard-section" style={styles.wizardSection}>
                    <h3 className="wizard-section-header" style={styles.sectionHeader}>連結現有天秤 (Gist ID)</h3>
                    <p style={{ fontSize: '0.82rem', color: '#666666', marginBottom: '16px', fontWeight: 'bold' }}>
                      請輸入伴侶分享的 Gist ID。連結成功後，系統會自動載入伴侶設定，免手動重複輸入！
                    </p>

                    <div style={{ ...styles.inputCol, marginTop: '0px' }}>
                      <label style={styles.label}>Gist ID</label>
                      <input 
                        type="text" 
                        value={joinGistId} 
                        onChange={(e) => setJoinGistId(e.target.value)} 
                        className="comic-input" 
                        placeholder="請貼上現有的 Gist ID"
                      />
                    </div>

                    {localError && <div style={styles.localErrorText}>{localError}</div>}
                    {localSuccess && <div style={styles.localSuccessText}>{localSuccess}</div>}

                    <button 
                      onClick={handleJoinConnect} 
                      className="comic-btn" 
                      style={{ width: '100%', marginTop: '20px', padding: '12px 16px', fontSize: '1.05rem', backgroundColor: '#000000', color: '#FFFFFF' }}
                    >
                      連結並載入
                    </button>
                  </div>
                ) : (
                  // --- JOIN SUCCESS - CHOOSE DEVICE IDENTITY ---
                  <div className="wizard-section" style={styles.wizardSection}>
                    <h3 className="wizard-section-header" style={styles.sectionHeader}>🎉 連線成功！請選擇您的身份</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '20px', fontWeight: 'bold', lineHeight: '1.5' }}>
                      已成功連線！已從雲端載入設定好的伴侶名稱：<br />
                      🤍 <b>{fetchedPartners.p1.name}</b> 與 🖤 <b>{fetchedPartners.p2.name}</b><br />
                      請選取「您自己」在這台裝置上的身份，系統後續將自動預設為您記錄付出！
                    </p>

                    <label style={styles.label}>我是哪一位？</label>
                    <div className="identity-row" style={styles.identityRow}>
                      <button
                        type="button"
                        onClick={() => setSelectedJoinIdentity('p1')}
                        className="identity-btn"
                        style={{
                          ...styles.identityBtn,
                          backgroundColor: selectedJoinIdentity === 'p1' ? '#000000' : '#FFFFFF',
                          color: selectedJoinIdentity === 'p1' ? '#FFFFFF' : '#000000',
                        }}
                      >
                        我是 {fetchedPartners.p1.name} ({fetchedPartners.p1.role === 'white_dog' ? '白狗' : '灰狗'})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedJoinIdentity('p2')}
                        className="identity-btn"
                        style={{
                          ...styles.identityBtn,
                          backgroundColor: selectedJoinIdentity === 'p2' ? '#000000' : '#FFFFFF',
                          color: selectedJoinIdentity === 'p2' ? '#FFFFFF' : '#000000',
                        }}
                      >
                        我是 {fetchedPartners.p2.name} ({fetchedPartners.p2.role === 'white_dog' ? '白狗' : '灰狗'})
                      </button>
                    </div>

                    {localError && <div style={styles.localErrorText}>{localError}</div>}

                    <button 
                      onClick={handleCompleteJoin} 
                      className="comic-btn" 
                      style={{ width: '100%', marginTop: '24px', padding: '12px 16px', fontSize: '1.05rem', backgroundColor: '#000000', color: '#FFFFFF' }}
                      disabled={!selectedJoinIdentity}
                    >
                      確認並進入天秤
                    </button>
                  </div>
                )
              ) : (
                // --- CREATE NEW SCALE MODE ---
                <>
                  <div className="wizard-section" style={styles.wizardSection}>
                    <h3 className="wizard-section-header" style={styles.sectionHeader}>設定伴侶名稱與小狗角色</h3>
                    
                    <div className="names-row" style={styles.namesRow}>
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
                      <div className="swap-col" style={styles.swapCol}>
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
                      <div className="identity-row" style={styles.identityRow}>
                        <button
                          type="button"
                          onClick={() => onUpdateMyIdentity('p1')}
                          className="identity-btn"
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
                          className="identity-btn"
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

                    {/* Cloud sync — fully automatic, no Gist ID needed */}
                    <div style={{ marginTop: '20px', borderTop: '2px dashed #000000', paddingTop: '16px' }}>
                      <label style={styles.label}>☁️ 雲端同步備份</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#F8F8F8', border: '2px solid #000', padding: '12px', marginTop: '6px' }}>
                        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🤖</span>
                        <p style={{ fontSize: '0.8rem', color: '#333', fontWeight: 'bold', lineHeight: '1.6', margin: 0 }}>
                          系統將在您點擊「開始體驗」時<b>自動建立</b>您的專屬同步空間，無需任何操作！<br />
                          完成後會自動產生邀請訊息，複製給伴侶即可雙向即時同步。
                        </p>
                      </div>
                    </div>

                    {localError && <div style={styles.localErrorText}>{localError}</div>}
                    {localSuccess && <div style={styles.localSuccessText}>{localSuccess}</div>}
                  </div>

                  <button
                    onClick={handleStart}
                    className="comic-btn"
                    disabled={isCreatingGistInWizard}
                    style={{ width: '100%', marginTop: '14px', padding: '13px 16px', fontSize: '1.05rem', backgroundColor: '#000000', color: '#FFFFFF' }}
                  >
                    {isCreatingGistInWizard ? '⏳ 正在自動建立雲端天秤...' : '🚀 開始體驗 HeartSync'}
                  </button>
                  <button
                    type="button"
                    onClick={handleOfflineStart}
                    disabled={isCreatingGistInWizard}
                    className="comic-btn secondary"
                    style={{ width: '100%', marginTop: '8px', padding: '10px 16px', fontSize: '0.88rem' }}
                  >
                    📵 先離線使用（不建立雲端同步）
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING STATUS & SETTINGS TOGGLE BAR --- */}
      <div className="status-container" style={styles.statusContainer}>
        <div className="status-badges" style={styles.statusBadges}>
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

        <div className="button-group" style={styles.buttonGroup}>
          {syncConfig.token && syncConfig.gistId && !offlineMode && (
            <button 
              onClick={onPull} 
              className="comic-btn secondary action-btn" 
              disabled={isSyncing}
              style={styles.actionBtn}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin-slow' : ''} />
              <span>手動同步</span>
            </button>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="comic-btn secondary action-btn"
            style={styles.actionBtn}
          >
            <span>修改暱稱與雲端設定</span>
          </button>
        </div>
      </div>

      {/* --- COLLAPSIBLE SETTINGS PANEL --- */}
      {isOpen && (
        <div className="comic-card" style={styles.settingsPanel}>
          <h3 style={styles.panelTitle}>雙方暱稱與角色設定</h3>
          
          <div style={{ ...styles.wizardSection, border: 'none', padding: 0, boxShadow: 'none' }}>
            <div className="names-row" style={styles.namesRow}>
              <div style={styles.inputCol}>
                <label style={styles.label}>伴侶一 姓名 ({p1Role === 'white_dog' ? '白狗' : '灰狗'})</label>
                <input 
                  type="text" 
                  value={p1Name} 
                  onChange={(e) => setP1Name(e.target.value)} 
                  className="comic-input" 
                />
              </div>

              <div className="swap-col" style={styles.swapCol}>
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
              <div className="identity-row" style={styles.identityRow}>
                <button
                  type="button"
                  onClick={() => onUpdateMyIdentity('p1')}
                  className="identity-btn"
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
                  className="identity-btn"
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

          {/* --- CLOUD GIST CONFIGURATION CARD --- */}
          <div style={styles.localGistCard}>
            <h4 style={styles.localGistTitle}>🌐 雲端同步天秤設定</h4>
            
            <div style={styles.inputCol}>
              <label style={styles.label}>Gist ID (貼上現有天秤 ID，或點選下方自動新建)</label>
              <input 
                type="text" 
                value={gistIdInput} 
                onChange={(e) => setGistIdInput(e.target.value)} 
                className="comic-input" 
                placeholder="請貼上您的 Gist ID"
              />
            </div>

            {localError && <div style={styles.localErrorText}>{localError}</div>}
            {localSuccess && <div style={styles.localSuccessText}>{localSuccess}</div>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleSaveCloudConfig}
                className="comic-btn"
                style={{ flex: 1, backgroundColor: '#000000', color: '#FFFFFF', padding: '8px 12px', fontSize: '0.8rem' }}
              >
                儲存並連線
              </button>
              <button
                type="button"
                onClick={handleCreateNewGist}
                className="comic-btn secondary"
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
              >
                一鍵自動新建
              </button>
            </div>
          </div>

          {/* --- GIST ID SHARING AND COPY CARD --- */}
          {syncConfig.gistId && (
            <div style={styles.localGistCard}>
              <h4 style={styles.localGistTitle}>🔗 分享天秤給伴侶 (Gist ID)</h4>
              <p style={{ fontSize: '0.8rem', color: '#666666', marginBottom: '8px', fontWeight: 'bold' }}>
                您的伴侶只需在另一台裝置的引導精靈中選擇「連結現有天秤」並輸入此 Gist ID，即可自動連線並同步！
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={syncConfig.gistId} 
                  readOnly 
                  onClick={(e) => e.target.select()}
                  style={{ flex: 1, backgroundColor: '#EEEEEE', padding: '8px', border: '2.5px solid #000000', fontFamily: 'monospace', fontWeight: '800', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(syncConfig.gistId);
                    alert('Gist ID 已成功複製到剪貼簿！');
                  }}
                  className="comic-btn secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  複製 ID
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  const inviteUrl = `https://winnie-lin.space/couple-balance/?gistId=${syncConfig.gistId}`;
                  const inviteMsg = `Hi！我已經在 HeartSync 建立了我們的專屬生活付出天秤囉！⚖️\n\n🔗 點擊此連結直接加入（免複製貼上）：\n${inviteUrl}\n\n開啟後在引導精靈中確認身份，即可即時雙向同步！✨`;
                  navigator.clipboard.writeText(inviteMsg);
                  alert('邀請文字已複製到剪貼簿，趕快傳給伴侶吧！');
                }}
                className="comic-btn"
                style={{ width: '100%', marginTop: '12px', padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#000000', color: '#FFFFFF' }}
              >
                📋 複製給伴侶的邀請文字
              </button>
            </div>
          )}

          <div style={styles.panelActions}>
            <button 
              onClick={handleSaveSettings} 
              className="comic-btn" 
              style={{ marginLeft: 'auto', width: '100%', marginTop: '16px', backgroundColor: '#000000', color: '#FFFFFF' }}
            >
              儲存所有變更
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
    borderRadius: '0px',
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
    padding: '24px',
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
  },
  localGistCard: {
    backgroundColor: '#F4F4F3',
    border: '3px solid #000000',
    padding: '16px 20px',
    marginTop: '20px',
    boxShadow: '3px 3px 0px #000000',
  },
  localGistTitle: {
    fontSize: '0.9rem',
    fontWeight: '900',
    borderBottom: '2.5px dashed #000000',
    paddingBottom: '8px',
    marginBottom: '14px',
  },
  localErrorText: {
    color: '#D8000C',
    backgroundColor: '#FFD2D2',
    border: '2px solid #D8000C',
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: '800',
    marginTop: '12px',
  },
  localSuccessText: {
    color: '#000000',
    backgroundColor: '#E1ECC8',
    border: '2px solid #000000',
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: '800',
    marginTop: '12px',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '3px solid #000000',
    paddingBottom: '12px',
  },
  tabBtn: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '0.85rem',
    fontWeight: '800',
    cursor: 'pointer',
    border: '2.5px solid #000000',
    borderRadius: '8px',
    boxShadow: '2px 2px 0px #000000',
    transition: 'all 0.1s ease',
    fontFamily: 'inherit',
  }
};
