import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import logoSrc from '@/imports/UoE_AzSoc_LOGO.png'

// Inject favicon at runtime so the bundled asset URL is used in production
if (typeof document !== 'undefined') {
  try {
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = logoSrc
    document.head.appendChild(link)
  } catch (e) {
    // ignore
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
