import React, { useState, useEffect } from 'react';
import { Landmark, Heart, Plus, Cloud, CloudOff, Info, HelpCircle, Footprints } from 'lucide-react';
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
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

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
        showToast('✨ 雲端同步完成！', 'success');
      } else {
        throw new Error('資料結構不符合規定');
      }
    } catch (err) {
      console.error(err);
      setSyncStatus('連線失敗，已載入本機');
      showToast(`⚠️ 同步失敗：${err.message || '連線錯誤'}`, 'error');
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
      showToast('✨ 數據已自動備份至雲端！', 'success');
    } catch (err) {
      console.error(err);
      setSyncStatus('備份失敗');
      showToast(`⚠️ 備份失敗：${err.message || '連線錯誤'}`, 'error');
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
    showToast('✨ 角色設定已更新！', 'success');
    
    // Auto-push the updated structure to the cloud
    pushCloudData(records, syncConfig.token, syncConfig.gistId, customPartners);
  };

  // --- TOGGLE OFFLINE MODE ---
  const handleSetOfflineMode = (val) => {
    // If environment secrets are present, ignore offline toggle to prevent sync break
    const envToken = import.meta.env.VITE_GIST_TOKEN || '';
    const envGistId = import.meta.env.VITE_GIST_ID || '';
    if (envToken && envGistId) {
      showToast('🔒 雲端同步已由 GitHub Secrets 託管', 'info');
      return;
    }

    localStorage.setItem('offline_mode', val ? 'true' : 'false');
    setOfflineMode(val);
    if (val) {
      setSyncStatus('本機離線運作中');
      showToast('🤍 已切換至離線體驗模式', 'info');
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
      particleCount: 100,
      spread: 70,
      origin: { y: 0.85 },
      colors: ['#FFEFA6', '#FFD3D3', '#E1ECC8', '#D7E9F7', '#E5A96E']
    });

    showToast(`✨ 記錄成功：${record.title}`, 'success');

    // Auto-sync push
    pushCloudData(updatedRecords);
  };

  // --- DELETE RECORD ---
  const handleDeleteRecord = (id) => {
    if (window.confirm('確定要刪除這筆心意記錄嗎？ 🤍')) {
      const updatedRecords = records.filter(r => r.id !== id);
      setRecords(updatedRecords);
      
      // Write local storage
      localStorage.setItem('cached_records', JSON.stringify(updatedRecords));
      showToast('🗑️ 記錄已刪除', 'info');

      // Auto-sync push
      pushCloudData(updatedRecords);
    }
  };

  // --- CALCULATE BALANCES FOR SCALES ---
  // Money
  const p1Money = records.filter(r => r.type === 'money' && r.by === 'p1').reduce((acc, r) => acc + r.value, 0);
  const p2Money = records.filter(r => r.type === 'money' && r.by === 'p2').reduce((acc, r) => acc + r.value, 0);
  // Love/Effort
  const p1Love = records.filter(r => r.type === 'love' && r.by === 'p1').reduce((acc, r) => acc + r.value, 0);
  const p2Love = records.filter(r => r.type === 'love' && r.by === 'p2').reduce((acc, r) => acc + r.value, 0);

  return (
    <div className="container">
      {/* --- APP HEADER --- */}
      <header className="header">
        <div className="title-container">
          {/* Animated SVG title heart */}
          <svg viewBox="0 0 100 80" className="title-icon" style={{ animation: 'float 3s ease-in-out infinite' }}>
            {/* Outer heart outline */}
            <path d="M 50 25 C 38 10, 18 10, 18 32 C 18 50, 42 68, 50 72 C 58 68, 82 50, 82 32 C 82 10, 62 10, 50 25 Z" fill="#FFD3D3" stroke="#5D4A3E" strokeWidth="3" strokeLinejoin="round" />
            {/* Sparkle */}
            <g transform="translate(62, 10)">
              <path d="M 8,0 L 10,6 L 16,8 L 10,10 L 8,16 L 6,10 L 0,8 L 6,6 Z" fill="#FFEFA6" stroke="#5D4A3E" strokeWidth="1.5" />
            </g>
          </svg>
          <div>
            <h1 className="app-title">HeartSync</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge" style={{ backgroundColor: '#FFD3D3', color: '#5D4A3E', border: '2px solid #5D4A3E', boxShadow: '1.5px 1.5px 0px #5D4A3E' }}>🤍 Co-Life Balance</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>✨ 雙向奔赴，記錄我們的生活心意平衡</span>
            </div>
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
          unit="元"
          label="共同金錢天秤 💸"
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
        />
      </div>

      {/* --- FLOATING ACTION TRIGGER BUTTON --- */}
      <div style={styles.floatingActionWrapper}>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="comic-btn"
          style={styles.floatingBtn}
        >
          <Plus size={24} strokeWidth={3} />
          <span>新增心意記錄 🤍</span>
        </button>
      </div>

      {/* --- ADD RECORD FORM MODAL --- */}
      <RecordModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={handleAddRecord}
        p1Name={partners.p1.name}
        p2Name={partners.p2.name}
      />

      {/* --- SYSTEM CUTE TOAST ALERT --- */}
      {toast.show && (
        <div className="toast-alert" style={styles.toast}>
          <div style={{
            ...styles.toastDot,
            backgroundColor: toast.type === 'success' ? '#A1C298' : toast.type === 'error' ? '#D67D3E' : 'var(--color-yellow)'
          }} />
          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

const styles = {
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
    fontSize: '1.15rem',
    borderRadius: '24px',
    boxShadow: '0px 10px 0px #5D4A3E',
    backgroundColor: '#FFEFA6',
    border: '3px solid #5D4A3E',
  },
  toast: {
    border: '3px solid #5D4A3E',
    boxShadow: '4px 4px 0px #5D4A3E',
  },
  toastDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '1.5px solid #5D4A3E',
  }
};
