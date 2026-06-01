import React, { useState, useEffect, useRef } from 'react';
import { Plus, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

import GistSyncPanel from './components/GistSyncPanel';
import BalanceScale from './components/BalanceScale';
import WinnerDashboard from './components/WinnerDashboard';
import RecordModal from './components/RecordModal';
import HistoryList from './components/HistoryList';
import ActivityLog from './components/ActivityLog';
import PWAPrompt from './components/PWAPrompt';
import { fetchGistData, updateGistData } from './utils/githubGist';

export default function App() {
  // --- STATES ---
  const [records, setRecords] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [syncConfig, setSyncConfig] = useState({ token: '', gistId: '' });
  const [syncStatus, setSyncStatus] = useState('未連接');
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('TWD');
  const [myIdentity, setMyIdentity] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // --- REFS: always hold latest values so async callbacks don't capture stale closures ---
  const syncConfigRef = useRef({ token: '', gistId: '' });
  const recordsRef = useRef([]);
  const activityLogRef = useRef([]);
  const partnersRef = useRef({ p1: { name: '伴侶一', role: 'white_dog', deviceId: '' }, p2: { name: '伴侶二', role: 'brown_dog', deviceId: '' } });
  const offlineModeRef = useRef(false);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || (!import.meta.env.VITE_GIST_TOKEN);

  // Fixed Exchange Rates for multi-currency conversion
  const EXCHANGE_RATES = {
    TWD: 1.0,
    USD: 32.5,
    SGD: 24.0,
  };

  const convertValue = (val, from = 'TWD', to = 'TWD') => {
    const fromRate = EXCHANGE_RATES[from] || 1.0;
    const toRate = EXCHANGE_RATES[to] || 1.0;
    return (val * fromRate) / toRate;
  };

  // Default partner details (overwritten on mount by cache or wizard)
  const [partners, setPartners] = useState({
    p1: { name: '伴侶一', role: 'white_dog', deviceId: '' },
    p2: { name: '伴侶二', role: 'brown_dog', deviceId: '' }
  });

  // Keep refs in sync with state so async functions always read fresh values
  useEffect(() => { syncConfigRef.current = syncConfig; }, [syncConfig]);
  useEffect(() => { recordsRef.current = records; }, [records]);
  useEffect(() => { activityLogRef.current = activityLog; }, [activityLog]);
  useEffect(() => { partnersRef.current = partners; }, [partners]);
  useEffect(() => { offlineModeRef.current = offlineMode; }, [offlineMode]);

  // --- TOAST NOTIFICATIONS ---
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- INITIAL LOADING ---
  useEffect(() => {
    // 0. Ensure unique device ID is present
    let devId = localStorage.getItem('device_id');
    if (!devId) {
      devId = 'dev_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('device_id', devId);
    }

    // 1. Detect if secrets are injected via GitHub Actions, otherwise fall back to localStorage
    const rawEnvToken = import.meta.env.VITE_GIST_TOKEN || '';
    const rawEnvGistId = import.meta.env.VITE_GIST_ID || '';
    
    // Safety check against literal "undefined" or "null" strings from bundler/Vite
    const envToken = (rawEnvToken === 'undefined' || rawEnvToken === 'null') ? '' : rawEnvToken;
    const envGistId = (rawEnvGistId === 'undefined' || rawEnvGistId === 'null') ? '' : rawEnvGistId;

    const savedToken = envToken || localStorage.getItem('gist_token') || '';
    const savedGistId = envGistId || localStorage.getItem('gist_id') || '';
    
    // If environment secrets exist, sync is forced and offline is disabled!
    const savedOffline = (envToken && envGistId) ? false : (localStorage.getItem('offline_mode') === 'true');
    
    const config = { token: savedToken, gistId: savedGistId };
    setSyncConfig(config);
    setOfflineMode(savedOffline);

    // 2. Load cached partners configuration
    const savedPartners = localStorage.getItem('partners_config');
    let loadedPartners = {
      p1: { name: '伴侶一', role: 'white_dog', deviceId: '' },
      p2: { name: '伴侶二', role: 'brown_dog', deviceId: '' }
    };
    if (savedPartners) {
      try {
        loadedPartners = JSON.parse(savedPartners);
        setPartners(loadedPartners);
      } catch (e) {
        console.error('Failed to parse cached partners', e);
      }
    }

    // 3. Load cached local records
    const cachedRecords = localStorage.getItem('cached_records');
    let loadedRecords = [];
    if (cachedRecords) {
      try {
        loadedRecords = JSON.parse(cachedRecords);
        setRecords(loadedRecords);
        recordsRef.current = loadedRecords;
      } catch (e) {
        console.error('Failed to parse cached records', e);
      }
    }

    // 3b. Load cached activity log
    const cachedLog = localStorage.getItem('cached_activity_log');
    if (cachedLog) {
      try {
        const loadedLog = JSON.parse(cachedLog);
        setActivityLog(loadedLog);
        activityLogRef.current = loadedLog;
      } catch (e) {
        console.error('Failed to parse cached activity log', e);
      }
    }

    // 3. Load my identity
    const savedMyIdentity = localStorage.getItem('my_identity') || '';
    setMyIdentity(savedMyIdentity);

    // 4. Load cached display currency
    const savedCurrency = localStorage.getItem('display_currency') || 'TWD';
    setDisplayCurrency(savedCurrency);

    // 5. Request notification permission on PWA startup
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        const req = Notification.requestPermission();
        if (req && typeof req.then === 'function') {
          req.catch(err => console.warn('PWA: Request notification permission error:', err));
        }
      }
    } catch (e) {
      console.warn('PWA: Notification initialization failed gracefully:', e);
    }

    // 6. Trigger initial cloud sync if applicable
    if (savedToken && savedGistId && !savedOffline) {
      pullCloudData(savedToken, savedGistId, loadedRecords);
    } else if (savedOffline) {
      setSyncStatus('本機離線運作中');
    }
  }, []);

  // --- PWA SYSTEM NOTIFICATIONS ---
  const triggerPwaNotification = (newRecords, currentPartners = partners) => {
    try {
      if (!('Notification' in window)) {
        console.warn('PWA: Notifications not supported by this browser.');
        return;
      }

      if (Notification.permission === 'granted') {
        newRecords.forEach(record => {
          try {
            const partnerKey = record.by || 'p1';
            const partnerName = currentPartners[partnerKey]?.name || '伴侶';
            const recordTitle = record.title || '新付出';
            const recordVal = record.type === 'money' 
              ? `${record.value} 元` 
              : `${record.value} 點`;

            new Notification('⚖️ HeartSync 收到生活付出足跡！', {
              body: `${partnerName} 剛才記了一筆付出：【${recordTitle}】(${recordVal})！`,
              icon: './favicon.png',
              badge: './favicon.png',
              tag: record.id,
            });
          } catch (err) {
            console.error('PWA: Single notification construct failed:', err);
          }
        });
      }
    } catch (e) {
      console.warn('PWA: Notification triggering failed gracefully:', e);
    }
  };

  // --- PULL (CLOUD -> LOCAL) ---
  // Always reads from refs to avoid stale closure values
  const pullCloudData = async (
    token = syncConfigRef.current.token,
    gistId = syncConfigRef.current.gistId
  ) => {
    if (!token || !gistId) return;
    // Snapshot the current records at the moment pull starts (for new-record detection)
    const fallbackRecords = recordsRef.current;
    const currentMyIdentity = localStorage.getItem('my_identity') || '';

    setIsSyncing(true);
    setSyncStatus('正在同步...');
    try {
      const cloudData = await fetchGistData(token, gistId);

      if (cloudData && Array.isArray(cloudData.records)) {
        // Detect newly added records by companion (not by self)
        if (fallbackRecords.length > 0) {
          const currentIds = new Set(fallbackRecords.map(r => r.id));
          const newPartnerRecords = cloudData.records.filter(
            r => !currentIds.has(r.id) && r.by !== currentMyIdentity
          );
          if (newPartnerRecords.length > 0) {
            triggerPwaNotification(newPartnerRecords, cloudData.partners || partnersRef.current);
          }
        }

        setRecords(cloudData.records);
        recordsRef.current = cloudData.records;
        localStorage.setItem('cached_records', JSON.stringify(cloudData.records));

        // Load activity log (immutable, only grows)
        const cloudLog = Array.isArray(cloudData.activityLog) ? cloudData.activityLog : [];
        setActivityLog(cloudLog);
        activityLogRef.current = cloudLog;
        localStorage.setItem('cached_activity_log', JSON.stringify(cloudLog));

        if (cloudData.partners) {
          setPartners(cloudData.partners);
          partnersRef.current = cloudData.partners;
          localStorage.setItem('partners_config', JSON.stringify(cloudData.partners));
        }

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setSyncStatus(`已同步 (${timeStr})`);
        showToast('雲端資料同步完成', 'success');
      } else {
        throw new Error('資料結構不符合規定');
      }
    } catch (err) {
      console.error(err);
      setSyncStatus('連線失敗，已載入本機');
      showToast(`同步失敗：${err.message || '連線錯誤'}`, 'error');
      // Do NOT override records on failure — keep whatever is currently in state
    } finally {
      setIsSyncing(false);
    }
  };

  // --- PUSH (LOCAL -> CLOUD) ---
  // Always reads config from refs to avoid stale closure values
  const pushCloudData = async (
    newRecords,
    token = syncConfigRef.current.token,
    gistId = syncConfigRef.current.gistId,
    customPartners = partnersRef.current
  ) => {
    if (!token || !gistId || offlineModeRef.current) return;

    setIsSyncing(true);
    setSyncStatus('正在上傳...');
    try {
      const payload = {
        meta: {
          updated_at: new Date().toISOString(),
          version: '1.0'
        },
        records: newRecords,
        partners: customPartners,
        activityLog: activityLogRef.current,  // always include full immutable log
      };

      await updateGistData(token, gistId, payload);
      
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setSyncStatus(`已同步 (${timeStr})`);
      showToast('數據已自動備份至雲端', 'success');
    } catch (err) {
      console.error(err);
      setSyncStatus('備份失敗');
      showToast(`備份失敗：${err.message || '連線錯誤'}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // --- SAVE SYNC CONFIG & ROLE INFO (FROM PANEL) ---
  // pullAfterSync=true: used when JOINING an existing Gist (pull cloud data, don't overwrite with empty local)
  // pullAfterSync=false: used when CREATING a new Gist (push local data up)
  const saveConfig = (token, gistId, customPartners = partners, identity = '', pullAfterSync = false) => {
    localStorage.setItem('gist_token', token);
    localStorage.setItem('gist_id', gistId);
    localStorage.setItem('offline_mode', 'false');

    const devId = localStorage.getItem('device_id') || '';
    const finalIdentity = identity || localStorage.getItem('my_identity') || 'p1';

    const updatedPartners = { ...customPartners };
    if (updatedPartners[finalIdentity]) {
      updatedPartners[finalIdentity] = {
        ...updatedPartners[finalIdentity],
        deviceId: devId
      };
    }

    localStorage.setItem('partners_config', JSON.stringify(updatedPartners));

    // Update refs immediately so async calls below use fresh values
    syncConfigRef.current = { token, gistId };
    partnersRef.current = updatedPartners;
    offlineModeRef.current = false;

    setSyncConfig({ token, gistId });
    setOfflineMode(false);
    setPartners(updatedPartners);

    localStorage.setItem('my_identity', finalIdentity);
    setMyIdentity(finalIdentity);

    if (pullAfterSync) {
      // JOIN flow: pull existing cloud records
      pullCloudData(token, gistId);
    } else {
      // CREATE flow: Gist was just created with empty records — pull to confirm
      pullCloudData(token, gistId);
    }
  };

  // --- UPDATE PARTNERS NICKNAMES & ROLES ---
  const handleUpdatePartners = (customPartners) => {
    const devId = localStorage.getItem('device_id') || '';
    const finalIdentity = myIdentity || 'p1';
    
    const updatedPartners = { ...customPartners };
    if (updatedPartners[finalIdentity]) {
      updatedPartners[finalIdentity] = {
        ...updatedPartners[finalIdentity],
        deviceId: devId
      };
    }

    setPartners(updatedPartners);
    partnersRef.current = updatedPartners;
    localStorage.setItem('partners_config', JSON.stringify(updatedPartners));
    showToast('角色設定已更新', 'success');
    // Partners update is local-only; records are only pushed when a new record is added
  };

  // --- TOGGLE OFFLINE MODE ---
  const handleSetOfflineMode = (val) => {
    // If environment secrets are present, ignore offline toggle to prevent sync break
    const envToken = import.meta.env.VITE_GIST_TOKEN || '';
    const envGistId = import.meta.env.VITE_GIST_ID || '';
    if (envToken && envGistId) {
      showToast('雲端同步已由 Secrets 託管', 'info');
      return;
    }

    localStorage.setItem('offline_mode', val ? 'true' : 'false');
    setOfflineMode(val);
    if (val) {
      setSyncStatus('本機離線運作中');
      showToast('已切換至離線體驗模式', 'info');
    } else {
      if (syncConfig.token && syncConfig.gistId) {
        pullCloudData(syncConfig.token, syncConfig.gistId);
      }
    }
  };

  // --- ADD RECORD ---
  const handleAddRecord = (record) => {
    const updatedRecords = [record, ...records];
    setRecords(updatedRecords);
    recordsRef.current = updatedRecords;

    // Append immutable activity log entry
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      action: 'add',
      by: record.by || myIdentity || 'p1',
      recordId: record.id,
      recordTitle: record.title,
      recordValue: record.value,
      recordType: record.type,
      recordCurrency: record.currency || 'TWD',
    };
    const updatedLog = [...activityLogRef.current, logEntry];
    setActivityLog(updatedLog);
    activityLogRef.current = updatedLog;
    localStorage.setItem('cached_activity_log', JSON.stringify(updatedLog));

    // Write local storage
    localStorage.setItem('cached_records', JSON.stringify(updatedRecords));

    // Confetti pop!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#000000', '#666666', '#CCCCCC', '#FFFFFF']
    });

    showToast(`記錄成功：${record.title}`, 'success');

    // Push records + activity log to cloud
    pushCloudData(updatedRecords);
  };

  // --- DELETE RECORD ---
  const handleDeleteRecord = (id) => {
    if (window.confirm('確定要刪除這筆生活紀錄嗎？')) {
      const deletedRecord = records.find(r => r.id === id);
      const updatedRecords = records.filter(r => r.id !== id);
      setRecords(updatedRecords);
      recordsRef.current = updatedRecords;

      // Append immutable activity log entry for deletion
      const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        action: 'delete',
        by: localStorage.getItem('my_identity') || myIdentity || 'p1',
        recordId: id,
        recordTitle: deletedRecord?.title || '未知紀錄',
        recordValue: deletedRecord?.value || 0,
        recordType: deletedRecord?.type || 'money',
        recordCurrency: deletedRecord?.currency || 'TWD',
      };
      const updatedLog = [...activityLogRef.current, logEntry];
      setActivityLog(updatedLog);
      activityLogRef.current = updatedLog;
      localStorage.setItem('cached_activity_log', JSON.stringify(updatedLog));

      // Write local storage
      localStorage.setItem('cached_records', JSON.stringify(updatedRecords));
      showToast('記錄已刪除', 'info');

      // Push updated records + deletion log to cloud
      pushCloudData(updatedRecords);
    }
  };

  // --- CALCULATE BALANCES FOR SCALES ---
  // Money (dynamically converted to displayCurrency)
  const p1Money = records
    .filter(r => r.type === 'money' && r.by === 'p1')
    .reduce((acc, r) => acc + convertValue(r.value, r.currency || 'TWD', displayCurrency), 0);
  const p2Money = records
    .filter(r => r.type === 'money' && r.by === 'p2')
    .reduce((acc, r) => acc + convertValue(r.value, r.currency || 'TWD', displayCurrency), 0);
  // Love/Effort
  const p1Love = records.filter(r => r.type === 'love' && r.by === 'p1').reduce((acc, r) => acc + r.value, 0);
  const p2Love = records.filter(r => r.type === 'love' && r.by === 'p2').reduce((acc, r) => acc + r.value, 0);

  return (
    <div className="container">
      {/* --- APP HEADER --- */}
      <header className="header" style={styles.header}>
        <div className="title-container">
          {/* Authentic peeking Maltese dog mascot image from the favicon */}
          <img 
            src="./favicon.png" 
            alt="Mascot" 
            className="animate-float"
            style={{ 
              width: '64px', 
              height: '64px', 
              alignSelf: 'flex-end', 
              marginBottom: '-6px', 
              zIndex: 5,
              border: '3.5px solid #000000',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              boxShadow: '3px 3px 0px #000000',
              objectFit: 'contain'
            }} 
          />
          <div>
            <h1 className="app-title">HeartSync</h1>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '800' }}>✨ 雙向奔赴，記錄我們的生活心意平衡</span>
            </div>
          </div>
        </div>

        {/* Global Currency View Selector */}
        <div className="currency-selector-container" style={styles.currencySelectorContainer}>
          <span style={styles.currencyLabel}>💱 顯示幣別：</span>
          <div className="currency-row" style={styles.currencyRow}>
            {['TWD', 'SGD', 'USD'].map((curr) => (
              <button
                key={curr}
                onClick={() => {
                  setDisplayCurrency(curr);
                  localStorage.setItem('display_currency', curr);
                  showToast(`💱 顯示幣別切換為 ${curr === 'TWD' ? '台幣 TWD' : curr === 'SGD' ? '新幣 SGD' : '美金 USD'}！`, 'success');
                }}
                className="currency-tab-btn"
                style={{
                  ...styles.currencyTabBtn,
                  backgroundColor: displayCurrency === curr ? '#000000' : '#FFFFFF',
                  color: displayCurrency === curr ? '#FFFFFF' : '#666666',
                }}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- GIST SYNC BAR / CONFIG PANEL --- */}
      <GistSyncPanel
        syncConfig={syncConfig}
        saveConfig={saveConfig}
        syncStatus={syncStatus}
        onPull={() => pullCloudData()}
        isSyncing={isSyncing}
        offlineMode={offlineMode}
        setOfflineMode={handleSetOfflineMode}
        partners={partners}
        onUpdatePartners={handleUpdatePartners}
        myIdentity={myIdentity}
        onUpdateMyIdentity={(val) => {
          setMyIdentity(val);
          localStorage.setItem('my_identity', val);
        }}
        isLocal={isLocal}
      />

      {/* --- WINNER DASHBOARD --- */}
      <WinnerDashboard 
        p1Money={p1Money}
        p2Money={p2Money}
        p1Love={p1Love}
        p2Love={p2Love}
        p1Name={partners.p1.name}
        p2Name={partners.p2.name}
        p1Role={partners.p1.role}
        p2Role={partners.p2.role}
        currency={displayCurrency}
      />

      {/* --- DUAL SCALES SECTION --- */}
      <div className="scales-grid" style={styles.scalesGrid}>
        <BalanceScale 
          type="money"
          p1Value={p1Money}
          p2Value={p2Money}
          p1Name={partners.p1.name}
          p2Name={partners.p2.name}
          p1Role={partners.p1.role}
          p2Role={partners.p2.role}
          unit={displayCurrency === 'TWD' ? '元' : displayCurrency === 'SGD' ? 'SGD' : 'USD'}
          currency={displayCurrency}
          label={`共同金錢天秤 (${displayCurrency === 'TWD' ? 'NT$' : displayCurrency === 'SGD' ? 'S$' : 'US$'}) 💸`}
        />

        <BalanceScale 
          type="love"
          p1Value={p1Love}
          p2Value={p2Love}
          p1Name={partners.p1.name}
          p2Name={partners.p2.name}
          p1Role={partners.p1.role}
          p2Role={partners.p2.role}
          unit="點"
          label="家事與心意天秤 🧹"
        />
      </div>

      {/* --- RECORD HISTORY & DETAILED LOGS --- */}
      <div style={{ marginTop: '24px' }}>
        <HistoryList
          records={records}
          onDeleteRecord={handleDeleteRecord}
          p1Name={partners.p1.name}
          p2Name={partners.p2.name}
          p1Role={partners.p1.role}
          p2Role={partners.p2.role}
          displayCurrency={displayCurrency}
        />
      </div>

      {/* --- IMMUTABLE ACTIVITY LOG --- */}
      <ActivityLog
        activityLog={activityLog}
        p1Name={partners.p1.name}
        p2Name={partners.p2.name}
      />

      {/* --- FLOATING ACTION TRIGGER BUTTON --- */}
      <div className="floating-action-wrapper" style={styles.floatingActionWrapper}>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="comic-btn floating-btn"
          style={styles.floatingBtn}
        >
          <Plus size={20} strokeWidth={3} />
          <span>新增付出紀錄</span>
        </button>
      </div>

      {/* --- ADD RECORD FORM MODAL --- */}
      <RecordModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={handleAddRecord}
        p1Name={partners.p1.name}
        p2Name={partners.p2.name}
        p1Role={partners.p1.role}
        p2Role={partners.p2.role}
        defaultByPartner={myIdentity}
      />

      {/* --- SYSTEM CUTE TOAST ALERT --- */}
      {toast.show && (
        <div className="toast-alert" style={styles.toast}>
          <div style={{
            ...styles.toastDot,
            backgroundColor: toast.type === 'success' ? '#000000' : '#666666'
          }} />
          <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{toast.message}</span>
        </div>
      )}

      {/* --- PWA APP INSTALLATION PROMPT --- */}
      <PWAPrompt />
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '16px',
    borderBottom: '3px solid #000000',
    paddingBottom: '20px',
    marginBottom: '28px',
  },
  currencySelectorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  currencyLabel: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: '#666666',
    letterSpacing: '0.5px',
  },
  currencyRow: {
    display: 'flex',
    gap: '6px',
  },
  currencyTabBtn: {
    border: '2.5px solid #000000',
    padding: '6px 12px',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '1.5px 1.5px 0px #000000',
    transition: 'all 0.1s ease',
  },
  scalesGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  floatingActionWrapper: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 999,
  },
  floatingBtn: {
    padding: '16px 28px',
    fontSize: '1.05rem',
    borderRadius: '0px',
    boxShadow: '4px 4px 0px #000000',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    border: '3px solid #000000',
    fontWeight: '800',
  },
  toast: {
    border: '3px solid #000000',
    boxShadow: '4px 4px 0px #000000',
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  toastDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: '1px solid #000000',
  }
};
