import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ensureCanonicalHost } from './utils/canonicalHost.js'
import './index.css'

if (ensureCanonicalHost()) {
  // Stop bootstrapping the app while the browser navigates to the canonical host.
} else {
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
}
