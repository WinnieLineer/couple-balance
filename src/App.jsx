import React, { useState, useEffect, useRef } from 'react';
import { Plus, Cloud, CloudOff, RefreshCw, Settings, Check, ArrowUpDown } from 'lucide-react';
import confetti from 'canvas-confetti';

import SettingsModal from './components/SettingsModal';
import OnboardingWizard from './components/OnboardingWizard';
import BalanceScale from './components/BalanceScale';
import WinnerDashboard from './components/WinnerDashboard';
import RecordModal from './components/RecordModal';
import HistoryList from './components/HistoryList';
import ActivityLog from './components/ActivityLog';
import PWAPrompt from './components/PWAPrompt';
import { fetchGistData, updateGistData } from './utils/githubGist';

const APP_VERSION_CODE = 9;

export default function App() {
  // --- STATES ---
  const [records, setRecords] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [syncConfig, setSyncConfig] = useState({ token: '', gistId: '' });
  const [syncStatus, setSyncStatus] = useState('未連接');
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('TWD');
  const [lovePointRate, setLovePointRate] = useState(25);
  const [myIdentity, setMyIdentity] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaultType, setAddModalDefaultType] = useState('money');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(!localStorage.getItem('partners_config'));
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [refreshState, setRefreshState] = useState('idle'); // 'idle' | 'pulling' | 'loading' | 'success'

  // Reordering and Exchange rate states
  const [isReordering, setIsReordering] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({
    TWD: 1.0,
    USD: 32.5,
    SGD: 24.0,
    CNY: 4.5,
  });
  const [ratesLastUpdated, setRatesLastUpdated] = useState('');

  // Custom layout ordering
  const [layoutOrder, setLayoutOrder] = useState(() => {
    const cached = localStorage.getItem('layout_order');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length === 3) return parsed;
      } catch (e) {}
    }
    return ['dashboard', 'scales', 'history'];
  });
  const [draggedId, setDraggedId] = useState(null);

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, overId) => {
    e.preventDefault();
    if (draggedId === null || draggedId === overId) return;
    const oldIdx = layoutOrder.indexOf(draggedId);
    const newIdx = layoutOrder.indexOf(overId);
    const updated = [...layoutOrder];
    updated.splice(oldIdx, 1);
    updated.splice(newIdx, 0, draggedId);
    setLayoutOrder(updated);
    localStorage.setItem('layout_order', JSON.stringify(updated));
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const moveUp = (id) => {
    const idx = layoutOrder.indexOf(id);
    if (idx === 0) return;
    const updated = [...layoutOrder];
    const temp = updated[idx - 1];
    updated[idx - 1] = updated[idx];
    updated[idx] = temp;
    setLayoutOrder(updated);
    localStorage.setItem('layout_order', JSON.stringify(updated));
  };

  const moveDown = (id) => {
    const idx = layoutOrder.indexOf(id);
    if (idx === layoutOrder.length - 1) return;
    const updated = [...layoutOrder];
    const temp = updated[idx + 1];
    updated[idx + 1] = updated[idx];
    updated[idx] = temp;
    setLayoutOrder(updated);
    localStorage.setItem('layout_order', JSON.stringify(updated));
  };

  const renderLayoutControl = (id, label) => (
    <div 
      draggable
      onDragStart={(e) => handleDragStart(e, id)}
      onDragOver={(e) => handleDragOver(e, id)}
      onDragEnd={handleDragEnd}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        borderRadius: '12px 12px 0 0',
        fontSize: '0.75rem',
        fontWeight: '800',
        cursor: 'grab',
        borderLeft: 'var(--border-thick)',
        borderRight: 'var(--border-thick)',
        borderTop: 'var(--border-thick)',
        borderColor: 'var(--border-color)',
        marginBottom: '-3px',
        userSelect: 'none',
        boxShadow: '3px 0px 0px var(--shadow-color)',
        transform: draggedId === id ? 'scale(0.98)' : 'none',
        opacity: draggedId === id ? 0.6 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>⠿</span>
        <span>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => moveUp(id)} 
          disabled={layoutOrder.indexOf(id) === 0}
          style={{ 
            background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: layoutOrder.indexOf(id) === 0 ? 0.3 : 1, padding: '2px 4px', fontSize: '0.75rem', fontWeight: '900' 
          }}
          title="向上移"
        >
          ▲
        </button>
        <button 
          onClick={() => moveDown(id)} 
          disabled={layoutOrder.indexOf(id) === layoutOrder.length - 1}
          style={{ 
            background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: layoutOrder.indexOf(id) === layoutOrder.length - 1 ? 0.3 : 1, padding: '2px 4px', fontSize: '0.75rem', fontWeight: '900' 
          }}
          title="向下移"
        >
          ▼
        </button>
      </div>
    </div>
  );

  // --- REFS: always hold latest values so async callbacks don't capture stale closures ---
  const syncConfigRef = useRef({ token: '', gistId: '' });
  const recordsRef = useRef([]);
  const activityLogRef = useRef([]);
  const partnersRef = useRef({ p1: { name: '伴侶一', role: 'white_dog', deviceId: '' }, p2: { name: '伴侶二', role: 'brown_dog', deviceId: '' } });
  const offlineModeRef = useRef(false);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || (!import.meta.env.VITE_GIST_TOKEN);

  // Fallback fixed Exchange Rates for multi-currency conversion
  const EXCHANGE_RATES = {
    TWD: 1.0,
    USD: 32.5,
    SGD: 24.0,
    CNY: 4.5,
  };

  const convertValue = (val, from = 'TWD', to = 'TWD') => {
    const fromRate = exchangeRates[from] || EXCHANGE_RATES[from] || 1.0;
    const toRate = exchangeRates[to] || EXCHANGE_RATES[to] || 1.0;
    return (val * fromRate) / toRate;
  };

  // Fetch exchange rates from public API on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/TWD');
        if (res.ok) {
          const data = await res.json();
          if (data.rates) {
            const usdRate = data.rates.USD ? 1 / data.rates.USD : 32.5;
            const sgdRate = data.rates.SGD ? 1 / data.rates.SGD : 24.0;
            const cnyRate = data.rates.CNY ? 1 / data.rates.CNY : 4.5;
            setExchangeRates({
              TWD: 1.0,
              USD: parseFloat(usdRate.toFixed(2)),
              SGD: parseFloat(sgdRate.toFixed(2)),
              CNY: parseFloat(cnyRate.toFixed(2)),
            });
            
            // Format time_last_update_utc to readable format
            if (data.time_last_update_utc) {
              const d = new Date(data.time_last_update_utc);
              if (!isNaN(d.getTime())) {
                const year = d.getUTCFullYear();
                const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                const date = String(d.getUTCDate()).padStart(2, '0');
                const hours = String(d.getUTCHours()).padStart(2, '0');
                const minutes = String(d.getUTCMinutes()).padStart(2, '0');
                setRatesLastUpdated(`${year}/${month}/${date} ${hours}:${minutes} UTC`);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch dynamic exchange rates, using defaults.', e);
      }
    };
    fetchRates();
  }, []);

  // Default partner details (overwritten on mount by cache or wizard)
  const [partners, setPartners] = useState({
    p1: { name: '伴侶一', role: 'white_dog', deviceId: '' },
    p2: { name: '伴侶二', role: 'brown_dog', deviceId: '' }
  });

  // --- AUTOMATED VERSION CHECK & CACHE CLEANING ---
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.versionCode && data.versionCode > APP_VERSION_CODE) {
            // Check session storage to prevent rapid infinite reload loops
            const lastUpgrade = sessionStorage.getItem('last_auto_upgrade');
            if (lastUpgrade && (Date.now() - parseInt(lastUpgrade, 10) < 15000)) {
              console.warn('Auto-upgrade loop protection triggered. Skipping reload.');
              return;
            }
            sessionStorage.setItem('last_auto_upgrade', Date.now().toString());
            setNeedsUpdate(true);

            // Execute service worker unregistration & cache deletion
            if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (let reg of registrations) {
                await reg.unregister();
              }
            }
            const cacheNames = await caches.keys();
            for (let name of cacheNames) {
              await caches.delete(name);
            }

            // Short visual delay for user clarity before auto-reload
            setTimeout(() => {
              window.location.reload(true);
            }, 1000);
          }
        }
      } catch (err) {
        console.warn('Failed to check app version', err);
      }
    };
    checkVersion();
  }, []);

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

    // 4b. Load cached love point rate
    const savedLovePointRate = localStorage.getItem('love_point_rate');
    if (savedLovePointRate) {
      const parsedRate = parseFloat(savedLovePointRate);
      if (!isNaN(parsedRate)) {
        setLovePointRate(parsedRate);
      }
    }

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
    setSyncStatus('正在更新...');
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
        setSyncStatus(`已儲存 (${timeStr})`);
        showToast('雲端資料儲存完成', 'success');

        // Check if we need to log 'open' for today
        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const lastOpened = localStorage.getItem('last_opened_date');
        if (lastOpened !== today && currentMyIdentity) {
          localStorage.setItem('last_opened_date', today);
          const logEntry = {
            id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            timestamp: new Date().toISOString(),
            action: 'open',
            by: currentMyIdentity,
            recordId: 'open',
            recordTitle: 'HeartSync 天秤',
          };
          const updatedLog = [...cloudLog, logEntry];
          setActivityLog(updatedLog);
          activityLogRef.current = updatedLog;
          localStorage.setItem('cached_activity_log', JSON.stringify(updatedLog));
          
          // Push the new log to cloud silently
          pushCloudData(cloudData.records);
        }
      } else {
        throw new Error('資料結構不符合規定');
      }
    } catch (err) {
      console.error(err);
      setSyncStatus('連線失敗，已載入本機');
      showToast(`儲存失敗：${err.message || '連線錯誤'}`, 'error');
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
      setSyncStatus(`已儲存 (${timeStr})`);
      showToast('數據已自動上傳至雲端', 'success');
    } catch (err) {
      console.error(err);
      setSyncStatus('上傳失敗');
      showToast(`上傳失敗：${err.message || '連線錯誤'}`, 'error');
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
      showToast('雲端儲存已由 Secrets 託管', 'info');
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
      by: myIdentity || 'p1',
      payer: record.by,
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

    showToast(`登記成功：${record.title}`, 'success');

    // Push records + activity log to cloud
    pushCloudData(updatedRecords);
  };

  // --- DELETE RECORD ---
  const handleDeleteRecord = (id) => {
    if (window.confirm('確定要刪除這筆生活明細嗎？')) {
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
        payer: deletedRecord?.by,
        recordId: id,
        recordTitle: deletedRecord?.title || '未知明細',
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
      showToast('項目已刪除', 'info');

      // Push updated records + deletion log to cloud
      pushCloudData(updatedRecords);
    }
  };

  // --- PULL TO REFRESH EVENT HANDLERS ---
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handlePullStart = (clientY) => {
    if (isAddModalOpen || isSettingsOpen || showWizard || window.scrollY > 0 || isSyncing || refreshState === 'loading') return;
    startYRef.current = clientY;
    isDraggingRef.current = true;
    setIsDragging(true);
    setRefreshState('pulling');
  };

  const handlePullMove = (clientY) => {
    if (!isDraggingRef.current) return;
    const dy = clientY - startYRef.current;
    if (dy > 0) {
      // Elastic damping effect
      const dist = Math.min(100, Math.pow(dy, 0.82));
      setPullDistance(dist);
    } else {
      setPullDistance(0);
    }
  };

  const handlePullEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (pullDistance >= 50) {
      setPullDistance(50);
      setRefreshState('loading');
      triggerPullSync();
    } else {
      setPullDistance(0);
      setRefreshState('idle');
    }
  };

  const triggerPullSync = async () => {
    try {
      await pullCloudData();
      setRefreshState('success');
    } catch (err) {
      setRefreshState('idle');
    } finally {
      setTimeout(() => {
        setPullDistance(0);
        setRefreshState('idle');
      }, 800);
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

  // --- RENDER EARLY RETURN: AUTOMATED UPDATE NEEDED ---
  if (needsUpdate) {
    return (
      <div style={styles.updateOverlay}>
        <div className="comic-card animate-pop" style={{ maxWidth: '420px', width: '90%', padding: '40px 24px', textAlign: 'center', backgroundColor: '#fff', border: '4px solid #000', borderRadius: '16px', boxShadow: '6px 6px 0 #000' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '16px', fontWeight: '950' }}>🚀 系統偵測到新版本</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', border: '3.5px solid #000000', borderRadius: '50%', backgroundColor: '#FFFFFF', boxShadow: '3px 3px 0px #000000', marginBottom: '16px', fontSize: '1.5rem' }}>
            ⚡
          </div>
          <p style={{ fontWeight: '900', fontSize: '1.05rem', lineHeight: '1.6', color: '#000', margin: '0 0 12px 0' }}>
            正在為您自動下載升級...
          </p>
          <p style={{ fontSize: '0.82rem', fontWeight: '700', lineHeight: '1.5', color: '#666666' }}>
            系統將在 1 秒內為您自動清除快取並重新載入，請稍候。
          </p>
        </div>
      </div>
    );
  }

  const openAddModal = (type = 'money') => {
    setAddModalDefaultType(type);
    setIsAddModalOpen(true);
  };

  return (
    <div 
      style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', userSelect: isDragging ? 'none' : 'auto' }}
      onTouchStart={(e) => handlePullStart(e.touches[0].clientY)}
      onTouchMove={(e) => handlePullMove(e.touches[0].clientY)}
      onTouchEnd={handlePullEnd}
      onMouseDown={(e) => handlePullStart(e.clientY)}
      onMouseMove={(e) => handlePullMove(e.clientY)}
      onMouseUp={handlePullEnd}
      onMouseLeave={handlePullEnd}
    >
      {/* Pull Indicator Peeking Block */}
      <div style={{
        ...styles.pullIndicator,
        transform: `translateY(${pullDistance - 50}px)`,
        opacity: Math.min(1, pullDistance / 50),
        transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
      }}>
        <span className={refreshState === 'loading' ? 'animate-spin-slow' : ''} style={{ fontSize: '1.2rem' }}>
          {refreshState === 'loading' ? '🔄' : refreshState === 'success' ? '✨' : '👇'}
        </span>
        <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>
          {refreshState === 'loading' 
            ? 'updating...' 
            : refreshState === 'success' 
              ? '更新完成！' 
              : pullDistance >= 50 
                ? '放開以開始更新' 
                : '下拉更新雲端資料'}
        </span>
      </div>

      <div 
        className="container"
        style={{
          ...styles.container,
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
      {/* --- APP HEADER --- */}
      <header className="header" style={styles.header}>
        <div className="title-container" style={{ minWidth: 0, flex: 1 }}>
          {/* Neo Brutalism Quirky Logo Badge */}
          <div style={{ display: 'inline-flex', position: 'relative', width: '60px', height: '60px', flexShrink: 0, alignSelf: 'center', marginRight: '6px' }}>
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--shadow-color)',
            }} />
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '52px',
              height: '52px',
              border: 'var(--border-thick)',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              transform: 'rotate(-4deg)',
              transition: 'transform 0.2s var(--ease-snappy)',
              cursor: 'pointer',
              zIndex: 5,
              userSelect: 'none',
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(2deg) scale(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(-4deg) scale(1)'}
            >
              ⚖️
            </div>
          </div>
          <div>
            <h1 className="app-title">HeartSync</h1>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '800' }}>✨ 雙向奔赴，細數我們的生活心意平衡</span>
            </div>
          </div>
        </div>

      </header>

      {/* --- STATUS & SETTINGS BAR (EXCHANGE RATES DISPLAY WITH SOURCE) --- */}
      <div className="status-container" style={{ 
        ...styles.statusContainer, 
        flexDirection: 'row', 
        gap: '6px', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 'auto', 
        padding: '6px 12px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '0.3px' }}>
          📊 匯率基準 (1 USD = {exchangeRates.USD} TWD | 1 SGD = {exchangeRates.SGD} TWD | 1 CNY = {exchangeRates.CNY} TWD)
        </span>
        {ratesLastUpdated && (
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '750', marginLeft: '4px' }}>
            ⏰ 更新於 {ratesLastUpdated}
          </span>
        )}
      </div>

      {/* --- DRAGGABLE CUSTOMIZABLE SECTIONS --- */}
      {layoutOrder.map((sectionId) => {
        if (sectionId === 'scales') {
          return (
            <div key="scales" style={{ marginBottom: '28px' }}>
              {isReordering && renderLayoutControl('scales', '共同金錢與家事勞動天秤區')}
              <div className="scales-grid" style={styles.scalesGrid}>
                <BalanceScale 
                  type="money"
                  p1Value={p1Money}
                  p2Value={p2Money}
                  p1Name={partners.p1.name}
                  p2Name={partners.p2.name}
                  p1Role={partners.p1.role}
                  p2Role={partners.p2.role}
                  unit={displayCurrency === 'TWD' ? '元' : displayCurrency === 'SGD' ? 'SGD' : displayCurrency === 'CNY' ? 'CNY' : 'USD'}
                  currency={displayCurrency}
                  label={`共同金錢天秤 (${displayCurrency === 'TWD' ? 'NT$' : displayCurrency === 'SGD' ? 'S$' : displayCurrency === 'CNY' ? '¥' : 'US$'}) 💸`}
                  onClick={() => openAddModal('money')}
                  lovePointRate={convertValue(lovePointRate, 'TWD', displayCurrency)}
                  exchangeRates={exchangeRates}
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
                  label="家事與勞動天秤 🧹"
                  onClick={() => openAddModal('love')}
                  lovePointRate={convertValue(lovePointRate, 'TWD', displayCurrency)}
                  exchangeRates={exchangeRates}
                />
              </div>
            </div>
          );
        }
        if (sectionId === 'dashboard') {
          return (
            <div key="dashboard" style={{ marginBottom: '28px' }}>
              {isReordering && renderLayoutControl('dashboard', '付出差額與生活總貢獻分析區')}
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
                lovePointRate={convertValue(lovePointRate, 'TWD', displayCurrency)}
                exchangeRates={exchangeRates}
              />
            </div>
          );
        }
        if (sectionId === 'history') {
          return (
            <div key="history" style={{ marginBottom: '28px' }}>
              {isReordering && renderLayoutControl('history', '付出歷史足跡明細區')}
              <HistoryList
                records={records}
                onDeleteRecord={handleDeleteRecord}
                p1Name={partners.p1.name}
                p2Name={partners.p2.name}
                p1Role={partners.p1.role}
                p2Role={partners.p2.role}
                displayCurrency={displayCurrency}
                lovePointRate={convertValue(lovePointRate, 'TWD', displayCurrency)}
                exchangeRates={exchangeRates}
              />
            </div>
          );
        }
        return null;
      })}
      </div>

      {/* --- INITIAL NICKNAMES WIZARD (FOR NEW USERS - RENDERED OUTSIDE CONTAINER TO FIX VIEWPORT POSITIONING) --- */}
      {showWizard && (
        <OnboardingWizard
          partners={partners}
          onUpdatePartners={handleUpdatePartners}
          myIdentity={myIdentity}
          onUpdateMyIdentity={(val) => {
            setMyIdentity(val);
            localStorage.setItem('my_identity', val);
          }}
          saveConfig={saveConfig}
          onCloseWizard={() => setShowWizard(false)}
        />
      )}

      {/* --- SYSTEM UNIFIED SETTINGS MODAL (RENDERED OUTSIDE CONTAINER TO FIX VIEWPORT POSITIONING) --- */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
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
        displayCurrency={displayCurrency}
        onUpdateCurrency={(val) => {
          setDisplayCurrency(val);
          localStorage.setItem('display_currency', val);
        }}
        lovePointRate={convertValue(lovePointRate, 'TWD', displayCurrency)}
        onUpdateLovePointRate={(valInDisplayCurrency) => {
          const valInTWD = convertValue(valInDisplayCurrency, displayCurrency, 'TWD');
          setLovePointRate(valInTWD);
          localStorage.setItem('love_point_rate', valInTWD.toString());
        }}
        activityLog={activityLog}
        isReordering={isReordering}
        onToggleReordering={() => setIsReordering(!isReordering)}
      />

      {/* --- ADD RECORD FORM MODAL (RENDERED OUTSIDE CONTAINER TO FIX VIEWPORT POSITIONING) --- */}
      <RecordModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={handleAddRecord}
        p1Name={partners.p1.name}
        p2Name={partners.p2.name}
        p1Role={partners.p1.role}
        p2Role={partners.p2.role}
        defaultByPartner={myIdentity}
        defaultType={addModalDefaultType}
        displayCurrency={displayCurrency}
        lovePointRate={convertValue(lovePointRate, 'TWD', displayCurrency)}
      />

      {/* --- SYSTEM CUTE TOAST ALERT (RENDERED OUTSIDE CONTAINER TO FIX VIEWPORT POSITIONING) --- */}
      {toast.show && (
        <div className="toast-alert" style={styles.toast}>
          <div style={{
            ...styles.toastDot,
            backgroundColor: toast.type === 'success' ? 'var(--border-color)' : 'var(--text-muted)'
          }} />
          <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{toast.message}</span>
        </div>
      )}

      {/* --- PWA APP INSTALLATION PROMPT --- */}
      <PWAPrompt />

      {/* --- FLOATING ACTION TRIGGER BUTTON --- */}
      <div className="floating-action-wrapper">
        <button 
          onClick={() => openAddModal('money')}
          className="comic-btn floating-btn"
          title="登記生活付出"
        >
          <Plus size={28} strokeWidth={3.5} />
        </button>
      </div>

      {/* --- FLOATING SETTINGS TRIGGER BUTTON --- */}
      <div className="floating-settings-wrapper" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {isReordering ? (
          <button 
            onClick={() => setIsReordering(false)}
            className="settings-btn"
            style={{
              backgroundColor: '#FFE033',
              color: '#000000',
              border: '2.5px solid #000000',
            }}
            title="儲存並完成排序"
          >
            <Check size={20} strokeWidth={3} />
          </button>
        ) : (
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="settings-btn"
            title="開啟系統設定"
          >
            <Settings size={22} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  updateOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    borderBottom: 'var(--border-thick)',
    paddingBottom: '20px',
    marginBottom: '28px',
  },
  scalesGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  statusContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: 'var(--border-thick)',
    borderRadius: '16px',
    padding: '10px 16px',
    boxShadow: 'var(--shadow-sm)',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '24px',
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
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '800',
    border: '1.8px solid var(--border-color)',
    position: 'relative',
  },
  dotPulse: {
    width: '7px',
    height: '7px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '50%',
    display: 'inline-block',
  },
  syncStatusText: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '6px 14px',
    fontSize: '0.82rem',
    borderRadius: '10px',
    boxShadow: 'var(--shadow-xs)',
    backgroundColor: '#FFFFFF',
    border: '1.8px solid var(--border-color)',
    transition: 'transform 0.18s var(--ease-snappy), box-shadow 0.18s var(--ease-snappy), background-color 0.1s ease',
  },
  toast: {
    border: 'var(--border-thick)',
    boxShadow: 'var(--shadow-sm)',
    backgroundColor: '#FFFFFF',
    color: 'var(--text-primary)',
  },
  toastDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: '1.5px solid var(--border-color)',
  },
  pullIndicator: {
    position: 'absolute',
    top: '0px',
    left: 0,
    right: 0,
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    zIndex: 10,
    fontWeight: '900',
    fontSize: '0.88rem',
    color: 'var(--text-primary)',
  }
};
