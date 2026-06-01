import React, { useState, useEffect } from 'react';
import { Plus, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

import GistSyncPanel from './components/GistSyncPanel';
import BalanceScale from './components/BalanceScale';
import WinnerDashboard from './components/WinnerDashboard';
import RecordModal from './components/RecordModal';
import HistoryList from './components/HistoryList';
import { fetchGistData, updateGistData } from './utils/githubGist';

export default function App() {
  // --- STATES ---
  const [records, setRecords] = useState([]);
  const [syncConfig, setSyncConfig] = useState({ token: '', gistId: '' });
  const [syncStatus, setSyncStatus] = useState('未連接');
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('TWD');
  const [myIdentity, setMyIdentity] = useState('p1');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

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
    p1: { name: '老公', role: 'white_dog' },
    p2: { name: '老婆', role: 'brown_dog' }
  });

  // --- TOAST NOTIFICATIONS ---
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- INITIAL LOADING ---
  useEffect(() => {
    // 1. Detect if secrets are injected via GitHub Actions, otherwise fall back to localStorage
    const envToken = import.meta.env.VITE_GIST_TOKEN || '';
    const envGistId = import.meta.env.VITE_GIST_ID || '';

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
      p1: { name: '老公', role: 'white_dog' },
      p2: { name: '老婆', role: 'brown_dog' }
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
      } catch (e) {
        console.error('Failed to parse cached records', e);
      }
    }

    // 3. Load my identity
    const savedMyIdentity = localStorage.getItem('my_identity') || 'p1';
    setMyIdentity(savedMyIdentity);

    // 4. Load cached display currency
    const savedCurrency = localStorage.getItem('display_currency') || 'TWD';
    setDisplayCurrency(savedCurrency);

    // 4. Trigger initial cloud sync if applicable
    if (savedToken && savedGistId && !savedOffline) {
      pullCloudData(savedToken, savedGistId, loadedRecords);
    } else if (savedOffline) {
      setSyncStatus('本機離線運作中');
    }
  }, []);

  // --- PULL (CLOUD -> LOCAL) ---
  const pullCloudData = async (token = syncConfig.token, gistId = syncConfig.gistId, fallbackRecords = records) => {
    if (!token || !gistId) return;
    setIsSyncing(true);
    setSyncStatus('正在同步...');
    try {
      const cloudData = await fetchGistData(token, gistId);
      
      // Update local state and cache
      if (cloudData && Array.isArray(cloudData.records)) {
        setRecords(cloudData.records);
        localStorage.setItem('cached_records', JSON.stringify(cloudData.records));
        
        if (cloudData.partners) {
          setPartners(cloudData.partners);
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
      setRecords(fallbackRecords);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- PUSH (LOCAL -> CLOUD) ---
  const pushCloudData = async (newRecords, token = syncConfig.token, gistId = syncConfig.gistId, customPartners = partners) => {
    if (!token || !gistId || offlineMode) return;
    
    setIsSyncing(true);
    setSyncStatus('正在上傳...');
    try {
      const payload = {
        meta: {
          updated_at: new Date().toISOString(),
          version: '1.0'
        },
        records: newRecords,
        partners: customPartners
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
  const saveConfig = (token, gistId, customPartners = partners) => {
    localStorage.setItem('gist_token', token);
    localStorage.setItem('gist_id', gistId);
    localStorage.setItem('offline_mode', 'false');
    localStorage.setItem('partners_config', JSON.stringify(customPartners));
    
    setSyncConfig({ token, gistId });
    setOfflineMode(false);
    setPartners(customPartners);
    
    pullCloudData(token, gistId);
  };

  // --- UPDATE PARTNERS NICKNAMES & ROLES ---
  const handleUpdatePartners = (customPartners) => {
    setPartners(customPartners);
    localStorage.setItem('partners_config', JSON.stringify(customPartners));
    showToast('角色設定已更新', 'success');
    
    // Auto-push the updated structure to the cloud
    pushCloudData(records, syncConfig.token, syncConfig.gistId, customPartners);
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

    // Auto-sync push
    pushCloudData(updatedRecords);
  };

  // --- DELETE RECORD ---
  const handleDeleteRecord = (id) => {
    if (window.confirm('確定要刪除這筆生活紀錄嗎？')) {
      const updatedRecords = records.filter(r => r.id !== id);
      setRecords(updatedRecords);
      
      // Write local storage
      localStorage.setItem('cached_records', JSON.stringify(updatedRecords));
      showToast('記錄已刪除', 'info');

      // Auto-sync push
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
          {/* Authentic peeking Maltese line dog from the user's image */}
          <svg viewBox="0 0 160 80" className="title-icon" style={{ animation: 'float 4s ease-in-out infinite' }}>
            {/* White fluffy head contour */}
            <path 
              d="M 35,65 C 26,60 16,45 22,25 C 25,12 38,7 53,14 C 63,4 83,4 93,14 C 108,7 120,12 123,25 C 129,45 119,60 109,65 Z" 
              fill="#FFFFFF" 
              stroke="#000000" 
              strokeWidth="3.5" 
              strokeLinejoin="round" 
            />
            {/* Fluffy ears outline details */}
            <path d="M 24,20 Q 18,15 22,8 Q 28,2 34,12" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 120,20 Q 126,15 122,8 Q 116,2 110,12" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Eyes (farther apart and extremely cute dot eyes peeking) */}
            <circle cx="53" cy="36" r="3.2" fill="#000000" />
            <circle cx="91" cy="36" r="3.2" fill="#000000" />
            
            {/* Nose (small rounded triangle) */}
            <ellipse cx="72" cy="39" rx="3.8" ry="2.6" fill="#000000" />
            
            {/* Wide happy curving mouth (w shape peeking look) */}
            <path d="M 58,46 Q 65,51 72,46 Q 79,51 86,46" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Desk Line */}
            <line x1="2" y1="76" x2="158" y2="76" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
            
            {/* Left Paw */}
            <path d="M 26,76 C 26,66 44,66 44,76" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" />
            {/* Right Paw */}
            <path d="M 100,76 C 100,66 118,66 118,76" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" />
          </svg>
          <div>
            <h1 className="app-title">HeartSync</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge">HeartSync</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '800' }}>✨ 雙向奔赴，記錄我們的生活心意平衡</span>
            </div>
          </div>
        </div>

        {/* Global Currency View Selector */}
        <div style={styles.currencySelectorContainer}>
          <span style={styles.currencyLabel}>💱 顯示幣別：</span>
          <div style={styles.currencyRow}>
            {['TWD', 'SGD', 'USD'].map((curr) => (
              <button
                key={curr}
                onClick={() => {
                  setDisplayCurrency(curr);
                  localStorage.setItem('display_currency', curr);
                  showToast(`💱 顯示幣別切換為 ${curr === 'TWD' ? '台幣 TWD' : curr === 'SGD' ? '新幣 SGD' : '美金 USD'}！`, 'success');
                }}
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
        onPush={() => pushCloudData(records)}
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
      <div style={styles.scalesGrid}>
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
          displayCurrency={displayCurrency}
        />
      </div>

      {/* --- FLOATING ACTION TRIGGER BUTTON --- */}
      <div style={styles.floatingActionWrapper}>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="comic-btn"
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
