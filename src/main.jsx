import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determine the base path for sw.js from the current window location to support subfolders
    const base = window.location.pathname.endsWith('/') 
      ? window.location.pathname 
      : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    
    navigator.serviceWorker.register(`${base}sw.js`)
      .then((reg) => {
        console.log('PWA: ServiceWorker registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.error('PWA: ServiceWorker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
