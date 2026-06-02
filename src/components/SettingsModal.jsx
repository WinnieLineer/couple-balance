import React, { useState, useEffect } from 'react';
import { X, Coins, Users, Cloud, ArrowLeftRight, Copy, RefreshCw, CloudOff } from 'lucide-react';
import { createSecretGist } from '../utils/githubGist';

export default function SettingsModal({
  isOpen,
  onClose,
  syncConfig,
  saveConfig,
  syncStatus,
  onPull,
  isSyncing,
  offlineMode,
  setOfflineMode,
  partners,
  onUpdatePartners,
  myIdentity,
  onUpdateMyIdentity,
  displayCurrency,
  onUpdateCurrency
}) {
  const [activeTab, setActiveTab] = useState('currency'); // 'currency' | 'partners' | 'cloud'

  // Partners state
  const [p1Name, setP1Name] = useState(partners.p1.name || '伴侶一');
  const [p2Name, setP2Name] = useState(partners.p2.name || '伴侶二');
  const [p1Role, setP1Role] = useState(partners.p1.role || 'white_dog');
  const [p2Role, setP2Role] = useState(partners.p2.role || 'brown_dog');

  // Gist settings state
  const [gistIdInput, setGistIdInput] = useState(syncConfig.gistId || '');
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const [invitationText, setInvitationText] = useState('');
  const [isCreatingGist, setIsCreatingGist] = useState(false);

  // Update states when props change
  useEffect(() => {
    setP1Name(partners.p1.name || '伴侶一');
    setP2Name(partners.p2.name || '伴侶二');
    setP1Role(partners.p1.role || 'white_dog');
    setP2Role(partners.p2.role || 'brown_dog');
  }, [partners]);

  useEffect(() => {
    setGistIdInput(syncConfig.gistId || '');
  }, [syncConfig]);

  // 只鎖 overflow 防止背景捲動，不設 position:fixed 避免桌面版 layout 爆出
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSwapRoles = () => {
    const tempRole = p1Role;
    setP1Role(p2Role);
    setP2Role(tempRole);
  };

  const handleSavePartners = () => {
    const payload = {
      p1: { name: p1Name.trim() || '伴侶一', role: p1Role, deviceId: partners.p1.deviceId || '' },
      p2: { name: p2Name.trim() || '伴侶二', role: p2Role, deviceId: partners.p2.deviceId || '' }
    };
    onUpdatePartners(payload);
    setLocalSuccess('伴侶暱稱與角色設定已成功儲存！');
    setTimeout(() => setLocalSuccess(''), 2000);
  };

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
      setLocalError('⚠️ 專案未設定 VITE_GIST_TOKEN，無法進行雲端儲存。');
      return;
    }
    
    const payload = {
      p1: { name: p1Name.trim() || '伴侶一', role: p1Role, deviceId: partners.p1.deviceId || '' },
      p2: { name: p2Name.trim() || '伴侶二', role: p2Role, deviceId: partners.p2.deviceId || '' }
    };

    saveConfig(finalToken, finalGistId, payload, myIdentity || 'p1');
    setLocalSuccess('雲端 Gist 設定儲存成功，正進行同步...');
    setTimeout(() => setLocalSuccess(''), 2500);
  };

  const handleCreateNewGist = async () => {
    setLocalError('');
    setLocalSuccess('');
    
    const finalToken = (import.meta.env.VITE_GIST_TOKEN || localStorage.getItem('gist_token') || '').trim();
    if (!finalToken) {
      setLocalError('⚠️ 專案未設定 VITE_GIST_TOKEN，無法一鍵自動建立雲端天秤！');
      return;
    }
    
    setIsCreatingGist(true);
    setLocalSuccess('正在建立雲端資料庫...');
    
    try {
      const payloadPartners = {
        p1: { name: p1Name.trim() || '伴侶一', role: p1Role, deviceId: partners.p1.deviceId || '' },
        p2: { name: p2Name.trim() || '伴侶二', role: p2Role, deviceId: partners.p2.deviceId || '' }
      };
      
      // Bind deviceId for current identity if exists
      const currentDevId = localStorage.getItem('device_id') || '';
      const finalIdentity = myIdentity || 'p1';
      if (payloadPartners[finalIdentity]) {
        payloadPartners[finalIdentity].deviceId = currentDevId;
      }

      // Read local cached offline records and activityLog so the user doesn't lose data!
      const cachedRecordsRaw = localStorage.getItem('cached_records');
      const cachedRecords = cachedRecordsRaw ? JSON.parse(cachedRecordsRaw) : [];
      const cachedLogRaw = localStorage.getItem('cached_activity_log');
      const cachedLog = cachedLogRaw ? JSON.parse(cachedLogRaw) : [];

      const initialPayload = {
        meta: { updated_at: new Date().toISOString(), version: '1.0' },
        records: cachedRecords,
        partners: payloadPartners,
        activityLog: cachedLog,
      };
      
      const newGistId = await createSecretGist(finalToken, initialPayload);
      setGistIdInput(newGistId);
      
      saveConfig(finalToken, newGistId, payloadPartners, finalIdentity);
      setLocalSuccess('🎉 專屬雲端資料庫建立成功，並已自動將您原先的本地紀錄備份至雲端！');
      setTimeout(() => setLocalSuccess(''), 4500);
    } catch (err) {
      console.error(err);
      setLocalError(`自動建庫失敗：${err.message || '連線逾時'}`);
    } finally {
      setIsCreatingGist(false);
    }
  };

  const handleCopyInvitation = () => {
    const inviteUrl = `https://winnie-lin.space/couple-balance/?gistId=${syncConfig.gistId}`;
    const inviteMsg = `Hi！我已經在 HeartSync 建立了我們的專屬生活付出天秤囉！⚖️\n\n🔗 點擊此連結直接加入（免複製貼上）：\n${inviteUrl}\n\n開啟後在引導精靈中確認身份，即可即時雙向同步！✨`;
    navigator.clipboard.writeText(inviteMsg);
    alert('邀請文字已複製到剪貼簿，趕快傳給伴侶吧！');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="settings-modal-close" onClick={onClose} aria-label="關閉">
          <X size={16} strokeWidth={3} />
        </button>

        <h2 style={{ fontSize: '1.4rem', fontWeight: '950', marginBottom: '18px', textAlign: 'center' }}>
          ⚙️ HeartSync 系統設定
        </h2>

        {/* Tab Navigation */}
        <div className="settings-tab-nav">
          <button
            className={`settings-tab-link ${activeTab === 'currency' ? 'active' : ''}`}
            onClick={() => { setActiveTab('currency'); setLocalError(''); setLocalSuccess(''); }}
          >
            <Coins size={16} />
            <span>顯示幣別</span>
          </button>
          <button
            className={`settings-tab-link ${activeTab === 'partners' ? 'active' : ''}`}
            onClick={() => { setActiveTab('partners'); setLocalError(''); setLocalSuccess(''); }}
          >
            <Users size={16} />
            <span>伴侶暱稱</span>
          </button>
          <button
            className={`settings-tab-link ${activeTab === 'cloud' ? 'active' : ''}`}
            onClick={() => { setActiveTab('cloud'); setLocalError(''); setLocalSuccess(''); }}
          >
            <Cloud size={16} />
            <span>雲端與同步</span>
          </button>
        </div>

        {/* TAB 1: CURRENCY */}
        {activeTab === 'currency' && (
          <div style={styles.tabContent}>
            <p style={styles.tabDescription}>
              選擇用於生活記帳與對比的預設幣別，系統將自動依據固定匯率折算呈現。
            </p>
            <div style={styles.currencySelectorContainer}>
              {['TWD', 'SGD', 'USD'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    onUpdateCurrency(curr);
                    setLocalSuccess(`💱 已成功切換為 ${curr === 'TWD' ? '台幣 TWD' : curr === 'SGD' ? '新幣 SGD' : '美金 USD'}！`);
                    setTimeout(() => setLocalSuccess(''), 2000);
                  }}
                  className="comic-btn secondary"
                  style={{
                    ...styles.currencyBtn,
                    backgroundColor: displayCurrency === curr ? '#000000' : '#FFFFFF',
                    color: displayCurrency === curr ? '#FFFFFF' : '#666666',
                    transform: displayCurrency === curr ? 'scale(1.05)' : 'none',
                    boxShadow: displayCurrency === curr ? '3px 3px 0px #000000' : '1px 1px 0px #000000',
                  }}
                >
                  <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>
                    {curr === 'TWD' ? '🇹🇼' : curr === 'SGD' ? '🇸🇬' : '🇺🇸'}
                  </span>
                  <span>{curr === 'TWD' ? 'TWD (台幣)' : curr === 'SGD' ? 'SGD (新幣)' : 'USD (美金)'}</span>
                </button>
              ))}
            </div>
            {localSuccess && <div style={styles.localSuccessText}>{localSuccess}</div>}
          </div>
        )}

        {/* TAB 2: PARTNERS */}
        {activeTab === 'partners' && (
          <div style={styles.tabContent}>
            <p style={styles.tabDescription}>
              在此修改雙方在天秤上顯示的暱稱，並選擇象徵的角色（白狗與灰狗）。
            </p>
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
                  style={styles.inputField}
                />
              </div>
            </div>

            {/* Device User Identification */}
            <div style={{ marginTop: '20px' }}>
              <label style={styles.label}>這台裝置的主要使用者是誰？（用以區分是誰記帳）</label>
              <div className="identity-row" style={styles.identityRow}>
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
                  我是 {p1Name} ({p1Role === 'white_dog' ? '白狗' : '灰狗'})
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
                  我是 {p2Name} ({p2Role === 'white_dog' ? '白狗' : '灰狗'})
                </button>
              </div>
            </div>

            <button
              onClick={handleSavePartners}
              className="comic-btn"
              style={{ width: '100%', marginTop: '20px', padding: '12px', justifyContent: 'center' }}
            >
              💾 儲存暱稱與角色變更
            </button>

            {localSuccess && <div style={styles.localSuccessText}>{localSuccess}</div>}
          </div>
        )}

        {/* TAB 3: CLOUD */}
        {activeTab === 'cloud' && (
          <div style={styles.tabContent}>
            <p style={styles.tabDescription}>
              設定 GitHub Gist 進行雲端同步，讓您與伴侶的資料隨時保持一致。
            </p>

            {/* Offline Mode Toggle */}
            <div style={styles.toggleRow}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#000000' }}>📵 離線體驗模式</span>
                <span style={{ fontSize: '0.75rem', color: '#666666', fontWeight: '600' }}>
                  開啟後資料將僅儲存在這台裝置上，不與雲端同步。
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOfflineMode(!offlineMode)}
                className="comic-btn secondary"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  backgroundColor: offlineMode ? '#000000' : '#FFFFFF',
                  color: offlineMode ? '#FFFFFF' : '#000000',
                  border: '2.5px solid #000000',
                }}
              >
                {offlineMode ? '已開啟離線' : '同步進行中'}
              </button>
            </div>

            {!offlineMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <div style={styles.inputCol}>
                  <label style={styles.label}>專屬同步 Gist ID</label>
                  <input
                    type="text"
                    value={gistIdInput}
                    onChange={(e) => setGistIdInput(e.target.value)}
                    className="comic-input"
                    placeholder="請貼上您的 Gist ID"
                    style={styles.inputField}
                  />
                </div>

                <div className="button-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleSaveCloudConfig}
                    className="comic-btn"
                    style={{ flex: 1, padding: '10px', justifyContent: 'center', fontSize: '0.82rem', minWidth: '130px' }}
                  >
                    🔗 儲存並連線
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateNewGist}
                    disabled={isCreatingGist}
                    className="comic-btn secondary"
                    style={{ flex: 1, padding: '10px', justifyContent: 'center', fontSize: '0.82rem', minWidth: '130px' }}
                  >
                    {isCreatingGist ? '⏳ 正在自動建庫...' : '🆕 一鍵自動新建 Gist'}
                  </button>
                  
                  {syncConfig.gistId && (
                    <button
                      type="button"
                      onClick={onPull}
                      disabled={isSyncing}
                      className="comic-btn secondary"
                      style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', width: '100%', marginTop: '6px' }}
                    >
                      <RefreshCw size={14} className={isSyncing ? 'animate-spin-slow' : ''} />
                      <span>{isSyncing ? '正在手動同步中...' : '手動拉取雲端最新資料'}</span>
                    </button>
                  )}
                </div>

                {/* Gist ID Sharing Card */}
                {syncConfig.gistId && (
                  <div style={styles.shareCard}>
                    <h4 style={styles.shareTitle}>🔗 分享天秤給伴侶</h4>
                    <p style={{ fontSize: '0.78rem', color: '#666666', fontWeight: '700', marginBottom: '8px', lineHeight: '1.4' }}>
                      伴侶只需在另一台裝置進入時選擇「連結現有天秤」並貼入此 ID，即可秒速同步！
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        value={syncConfig.gistId} 
                        readOnly 
                        onClick={(e) => e.target.select()}
                        style={styles.readonlyInput}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(syncConfig.gistId);
                          alert('Gist ID 已成功複製到剪貼簿！');
                        }}
                        className="comic-btn secondary"
                        style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap', height: '36px' }}
                      >
                        複製 ID
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleCopyInvitation}
                      className="comic-btn"
                      style={{ width: '100%', marginTop: '10px', padding: '10px', fontSize: '0.8rem', backgroundColor: '#000000', color: '#FFFFFF', justifyContent: 'center' }}
                    >
                      📋 複製完整伴侶邀請訊息
                    </button>
                  </div>
                )}
              </div>
            )}

            {localError && <div style={styles.localErrorText}>{localError}</div>}
            {localSuccess && <div style={styles.localSuccessText}>{localSuccess}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    animation: 'pop 0.15s ease-out',
  },
  tabDescription: {
    fontSize: '0.82rem',
    color: '#666666',
    fontWeight: '700',
    lineHeight: '1.55',
  },
  currencySelectorContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  currencyBtn: {
    width: '100%',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: 'inherit',
    fontWeight: '800',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: '3px solid #000000',
    borderRadius: '12px',
    transition: 'all 0.15s ease',
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
    fontSize: '0.82rem',
    fontWeight: '900',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
  },
  inputField: {
    padding: '10px 14px',
    border: '3px solid #000000',
    fontSize: '0.88rem',
    fontWeight: '800',
    borderRadius: '10px',
  },
  swapCol: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2px',
  },
  swapBtn: {
    padding: '9px',
    borderRadius: '10px',
    boxShadow: 'var(--shadow-xs)',
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
    padding: '10px',
    fontSize: '0.8rem',
    border: '3px solid #000000',
    boxShadow: 'var(--shadow-xs)',
    justifyContent: 'center',
    fontWeight: '800',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    padding: '12px 14px',
    borderRadius: '12px',
    flexWrap: 'wrap',
    gap: '10px',
    boxShadow: 'var(--shadow-xs)',
  },
  shareCard: {
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-sm)',
  },
  shareTitle: {
    fontSize: '0.85rem',
    fontWeight: '900',
    borderBottom: '2.5px dashed #000000',
    paddingBottom: '6px',
    marginBottom: '8px',
  },
  readonlyInput: {
    flex: 1,
    backgroundColor: '#EFEFED',
    padding: '8px 10px',
    border: '3.5px solid #000000',
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: '0.8rem',
    height: '36px',
    borderRadius: '8px',
  },
  localErrorText: {
    color: '#000000',
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    padding: '8px 12px',
    fontSize: '0.82rem',
    fontWeight: '900',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-xs)',
  },
  localSuccessText: {
    color: '#000000',
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    padding: '8px 12px',
    fontSize: '0.82rem',
    fontWeight: '900',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-xs)',
  }
};
