import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Cloud, CloudOff } from 'lucide-react';
import { createSecretGist, fetchGistData, updateGistData } from '../utils/githubGist';

export default function OnboardingWizard({
  partners,
  onUpdatePartners,
  myIdentity,
  onUpdateMyIdentity,
  saveConfig,
  onCloseWizard
}) {
  const [wizardMode, setWizardMode] = useState('create'); // 'create' | 'join'
  
  // Wizard state for custom names and roles
  const [p1Name, setP1Name] = useState(partners.p1.name || '伴侶一');
  const [p2Name, setP2Name] = useState(partners.p2.name || '伴侶二');
  const [p1Role, setP1Role] = useState(partners.p1.role || 'white_dog');
  const [p2Role, setP2Role] = useState(partners.p2.role || 'brown_dog');

  // Join state
  const [joinGistId, setJoinGistId] = useState('');
  const [fetchedPartners, setFetchedPartners] = useState(null);
  const [selectedJoinIdentity, setSelectedJoinIdentity] = useState('');

  // Status indicators
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const [isCreatingGist, setIsCreatingGist] = useState(false);
  const [invitationText, setInvitationText] = useState('');

  // Detect ?gistId= URL param on mount to pre-fill join Gist
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlGistId = params.get('gistId');
    if (urlGistId) {
      setWizardMode('join');
      setJoinGistId(urlGistId);
      // Clean up the URL query string
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  const handleSwapRoles = () => {
    const tempRole = p1Role;
    setP1Role(p2Role);
    setP2Role(tempRole);
  };

  const getCustomPartnersPayload = () => {
    return {
      p1: { name: p1Name.trim() || '伴侶一', role: p1Role, deviceId: '' },
      p2: { name: p2Name.trim() || '伴侶二', role: p2Role, deviceId: '' }
    };
  };

  // Skip Gist, go local offline
  const handleOfflineStart = () => {
    const customPartners = getCustomPartnersPayload();
    onUpdateMyIdentity('p1');
    onUpdatePartners(customPartners);
    
    // Cache local-only config
    localStorage.setItem('partners_config', JSON.stringify(customPartners));
    localStorage.setItem('my_identity', 'p1');
    localStorage.setItem('offline_mode', 'true');
    
    onCloseWizard();
  };

  // Create Flow: Auto Create Gist Database
  const handleStart = async () => {
    const customPartners = getCustomPartnersPayload();
    onUpdateMyIdentity('p1');

    const finalToken = (import.meta.env.VITE_GIST_TOKEN || localStorage.getItem('gist_token') || '').trim();
    if (!finalToken) {
      setLocalError('⚠️ 系統未檢測到 VITE_GIST_TOKEN，無法自動建立雲端同步，請點擊「本機離線體驗」！');
      return;
    }

    setIsCreatingGist(true);
    setLocalError('');
    setLocalSuccess('正在建立您專屬的 GitHub 雲端生活天秤...');

    try {
      const currentDevId = localStorage.getItem('device_id') || '';
      customPartners.p1.deviceId = currentDevId;

      const initialPayload = {
        meta: { updated_at: new Date().toISOString(), version: '1.0' },
        records: [],
        partners: customPartners,
        activityLog: []
      };

      // Create new secret gist database
      const finalGistId = await createSecretGist(finalToken, initialPayload);
      
      // Save configuration
      saveConfig(finalToken, finalGistId, customPartners, 'p1');

      const inviteUrl = `https://winnie-lin.space/couple-balance/?gistId=${finalGistId}`;
      const inviteMsg = `Hi！我已經在 HeartSync 建立了我們的專屬生活付出天秤囉！⚖️\n\n🔗 點擊此連結直接加入（免複製貼上）：\n${inviteUrl}\n\n開啟後在引導精靈中確認身份，即可即時雙向同步！✨`;
      
      setInvitationText(inviteMsg);
      setLocalSuccess('雲端天秤資料庫已建立成功！');
    } catch (err) {
      console.error(err);
      setLocalError(`建立雲端天秤失敗：${err.message || '連線逾時，請檢查網路！'}`);
      setIsCreatingGist(false);
    }
  };

  // Join Flow: Fetch Gist nickname settings
  const handleJoinConnect = async () => {
    setLocalError('');
    setLocalSuccess('');
    
    const finalToken = (import.meta.env.VITE_GIST_TOKEN || localStorage.getItem('gist_token') || '').trim();
    const finalGistId = joinGistId.trim();
    
    if (!finalToken) {
      setLocalError('⚠️ 系統未檢測到 VITE_GIST_TOKEN，無法進行連線！');
      return;
    }
    if (!finalGistId) {
      setLocalError('請填寫伴侶分享的 Gist ID！');
      return;
    }
    
    try {
      setLocalSuccess('正在連線雲端天秤，拉取設定中...');
      const cloudData = await fetchGistData(finalToken, finalGistId);
      
      if (cloudData && cloudData.partners) {
        setFetchedPartners(cloudData.partners);
        setLocalSuccess('雲端連線成功！請在下方選擇您的代表身份。');
      } else {
        throw new Error('雲端天秤中未檢測到伴侶數據，請確認 ID 是否正確！');
      }
    } catch (err) {
      console.error(err);
      setLocalError(`連線失敗：${err.message || '連線超時，請重試！'}`);
      setLocalSuccess('');
    }
  };

  // Complete Onboarding (Join Flow)
  const handleCompleteJoin = () => {
    if (!selectedJoinIdentity) {
      setLocalError('請選擇您在這台裝置上的代表身份！');
      return;
    }
    
    const finalToken = (import.meta.env.VITE_GIST_TOKEN || localStorage.getItem('gist_token') || '');
    const finalGistId = joinGistId.trim();
    
    // Bind identity device
    saveConfig(finalToken, finalGistId, fetchedPartners, selectedJoinIdentity, true);
    onUpdateMyIdentity(selectedJoinIdentity);
    
    onCloseWizard();
  };

  return (
    <div style={styles.wizardOverlay}>
      {/* 1. Cloud Success Invite Link Popover */}
      {invitationText ? (
        <div className="comic-card wizard-card" style={{ ...styles.wizardCard, maxWidth: '460px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2.5px solid #000000', paddingBottom: '10px' }}>
            <div style={styles.popIcon}>🎉</div>
            <h2 style={styles.wizardTitle}>雲端資料庫建立成功！</h2>
            <p style={styles.wizardSubtitle}>已將專屬天秤安全建置在 GitHub 雲端！快邀請您的伴侶開始記錄付出吧。</p>
          </div>

          <div style={styles.wizardBody}>
            <div style={styles.wizardSection}>
              <label style={styles.label}>✉️ 傳送給伴侶的邀請簡訊：</label>
              <textarea
                readOnly
                value={invitationText}
                onClick={(e) => e.target.select()}
                rows={7}
                style={styles.invitationTextarea}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(invitationText);
                alert('邀請訊息已成功複製到剪貼簿，傳給伴侶貼上吧！');
                onCloseWizard();
              }}
              className="comic-btn"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', backgroundColor: '#000000', color: '#FFFFFF' }}
            >
              📋 複製邀請訊息並進入天秤
            </button>
          </div>
        </div>
      ) : (
        // 2. Nicknames Setup / Connect scale Wizard
        <div className="comic-card wizard-card" style={styles.wizardCard}>
          <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '3px solid #000000', paddingBottom: '14px' }}>
            <div style={styles.popIcon}>⚖️</div>
            <h2 style={styles.wizardTitle}>歡迎使用 HeartSync</h2>
            <p style={styles.wizardSubtitle}>設定代表名稱或連結現有的生活天秤，開啟兩人的共同生活心意平衡之旅。</p>
          </div>

          {/* Wizard Mode Tabs */}
          <div style={styles.tabContainer}>
            <button
              type="button"
              onClick={() => {
                setWizardMode('create');
                setLocalError('');
                setLocalSuccess('');
              }}
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
              // --- JOIN SCALE ---
              !fetchedPartners ? (
                <div style={styles.wizardSection}>
                  <h3 style={styles.sectionHeader}>連結現有天秤 (Gist ID)</h3>
                  <p style={{ fontSize: '0.8rem', color: '#666666', marginBottom: '14px', fontWeight: '700', lineHeight: '1.4' }}>
                    請在下方欄位輸入伴侶分享給您的 Gist ID。連結後，系統將直接拉取雙方姓名，省去手動設定！
                  </p>

                  <div style={styles.inputCol}>
                    <label style={styles.label}>伴侶分享的 Gist ID</label>
                    <input 
                      type="text" 
                      value={joinGistId} 
                      onChange={(e) => setJoinGistId(e.target.value)} 
                      className="comic-input" 
                      placeholder="例如：6b3a0f7..."
                      style={styles.inputField}
                    />
                  </div>

                  {localError && <div style={styles.localErrorText}>{localError}</div>}
                  {localSuccess && <div style={styles.localSuccessText}>{localSuccess}</div>}

                  <button 
                    onClick={handleJoinConnect} 
                    className="comic-btn" 
                    style={{ width: '100%', marginTop: '18px', padding: '12px', justifyContent: 'center' }}
                  >
                    🚀 連線並載入伴侶天秤
                  </button>
                </div>
              ) : (
                // --- SELECT IDENTITY ---
                <div style={styles.wizardSection}>
                  <h3 style={styles.sectionHeader}>🎉 連線成功！請選定您的身份</h3>
                  <p style={{ fontSize: '0.82rem', color: '#666666', marginBottom: '16px', fontWeight: '700', lineHeight: '1.4' }}>
                    已成功連接！已從雲端載入設定好的伴侶名稱：<br />
                    🤍 <b>{fetchedPartners.p1.name}</b> 與 🖤 <b>{fetchedPartners.p2.name}</b><br />
                    請挑選「您自己」在這台裝置上的身份以進行預設記帳：
                  </p>

                  <label style={styles.label}>我是哪一位？</label>
                  <div style={styles.identityRow}>
                    <button
                      type="button"
                      onClick={() => setSelectedJoinIdentity('p1')}
                      className="comic-btn secondary"
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
                      className="comic-btn secondary"
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
                    style={{ width: '100%', marginTop: '20px', padding: '12px', justifyContent: 'center' }}
                    disabled={!selectedJoinIdentity}
                  >
                    ⚖️ 確認設定並開啟生活天秤
                  </button>
                </div>
              )
            ) : (
              // --- CREATE SCALE ---
              <>
                <div style={styles.wizardSection}>
                  <h3 style={styles.sectionHeader}>設定代表暱稱與小狗角色</h3>
                  
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
                        placeholder="小明"
                        style={styles.inputField}
                      />
                    </div>

                    {/* Swap Button */}
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
                        placeholder="小美"
                        style={styles.inputField}
                      />
                    </div>
                  </div>

                  {/* Principal selector */}
                  <div style={{ marginTop: '16px' }}>
                    <label style={styles.label}>這台裝置的主要使用者是誰？（用以預設記帳身份）</label>
                    <div style={styles.identityRow}>
                      <button
                        type="button"
                        onClick={() => onUpdateMyIdentity('p1')}
                        className="comic-btn secondary"
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
                        className="comic-btn secondary"
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

                  {/* Cloud Description banner */}
                  <div style={styles.infoBanner}>
                    <span style={{ fontSize: '1.2rem' }}>☁️</span>
                    <p style={{ fontSize: '0.78rem', color: '#333', fontWeight: '700', lineHeight: '1.5', margin: 0 }}>
                      系統檢測到內建 GitHub Gist 同步，當您點擊「開始使用」時，將<b>自動為您建立專屬雲端同步庫</b>！您只需在完成後將邀請複製發送給伴侶即可！
                    </p>
                  </div>

                  {localError && <div style={styles.localErrorText}>{localError}</div>}
                  {localSuccess && <div style={styles.localSuccessText}>{localSuccess}</div>}
                </div>

                <button
                  onClick={handleStart}
                  disabled={isCreatingGist}
                  className="comic-btn"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center', backgroundColor: '#000000', color: '#FFFFFF' }}
                >
                  {isCreatingGist ? '⏳ 正在為您建立雲端同步...' : '🚀 建立天秤並開始體驗'}
                </button>
                
                <button
                  type="button"
                  onClick={handleOfflineStart}
                  disabled={isCreatingGist}
                  className="comic-btn secondary"
                  style={{ width: '100%', padding: '10px', justifyContent: 'center', fontSize: '0.85rem' }}
                >
                  📵 先離線使用（暫不連雲端）
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wizardOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '16px',
  },
  wizardCard: {
    maxWidth: '500px',
    width: '100%',
    maxHeight: '92vh',
    overflowY: 'auto',
    backgroundColor: '#FFFFFF',
    padding: '24px',
    border: '3px solid #000000',
    boxShadow: '8px 8px 0px #000000',
    borderRadius: '16px',
    animation: 'pop 0.25s ease-out',
  },
  popIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    border: '3px solid #000000',
    borderRadius: '50%',
    marginBottom: '8px',
    fontSize: '1.3rem',
    boxShadow: '2.5px 2.5px 0px #000000',
    backgroundColor: '#FFFFFF',
  },
  wizardTitle: {
    fontSize: '1.25rem',
    fontWeight: '950',
    color: '#000000',
    marginBottom: '6px',
  },
  wizardSubtitle: {
    fontSize: '0.82rem',
    color: '#666666',
    lineHeight: '1.5',
    fontWeight: '700',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    borderBottom: '2.5px solid #000000',
    paddingBottom: '10px',
  },
  tabBtn: {
    flex: 1,
    padding: '8px',
    fontSize: '0.8rem',
    fontWeight: '850',
    cursor: 'pointer',
    border: '2.5px solid #000000',
    borderRadius: '8px',
    boxShadow: '2px 2px 0px #000000',
    transition: 'all 0.1s ease',
    fontFamily: 'inherit',
  },
  wizardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  wizardSection: {
    backgroundColor: '#FFFFFF',
    border: '2.5px solid #000000',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '3px 3px 0px #000000',
  },
  sectionHeader: {
    fontSize: '0.92rem',
    fontWeight: '900',
    color: '#000000',
    marginBottom: '12px',
    borderBottom: '2px dashed #000000',
    paddingBottom: '6px',
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
  label: {
    fontSize: '0.8rem',
    fontWeight: '900',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
  },
  inputField: {
    padding: '8px 12px',
    border: '2.5px solid #000000',
    fontSize: '0.85rem',
    fontWeight: '800',
    borderRadius: '8px',
  },
  swapCol: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2px',
  },
  swapBtn: {
    padding: '8px',
    borderRadius: '8px',
    boxShadow: '1.5px 1.5px 0px #000000',
    backgroundColor: '#FFFFFF',
    border: '2.5px solid #000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '6px',
  },
  identityBtn: {
    flex: 1,
    padding: '8px 10px',
    fontSize: '0.78rem',
    border: '2.5px solid #000000',
    boxShadow: '1.5px 1.5px 0px #000000',
    justifyContent: 'center',
    fontWeight: '850',
  },
  infoBanner: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    backgroundColor: '#F8F8F8',
    border: '2.5px solid #000000',
    padding: '10px',
    marginTop: '16px',
    borderRadius: '8px',
  },
  invitationTextarea: {
    width: '100%',
    padding: '8px',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    fontWeight: '800',
    lineHeight: '1.5',
    border: '2.5px solid #000000',
    backgroundColor: '#F8F8F8',
    resize: 'none',
    marginTop: '6px',
    borderRadius: '6px',
  },
  localErrorText: {
    color: '#D8000C',
    backgroundColor: '#FFD2D2',
    border: '2px solid #D8000C',
    padding: '6px 12px',
    fontSize: '0.78rem',
    fontWeight: '850',
    marginTop: '10px',
    borderRadius: '6px',
  },
  localSuccessText: {
    color: '#000000',
    backgroundColor: '#FAFAFA',
    border: '2.5px solid #000000',
    padding: '6px 12px',
    fontSize: '0.78rem',
    fontWeight: '900',
    marginTop: '10px',
    borderRadius: '6px',
    textAlign: 'center',
    boxShadow: '2.5px 2.5px 0px rgba(0,0,0,0.15)',
  }
};
