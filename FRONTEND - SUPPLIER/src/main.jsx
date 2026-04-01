import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initTheme } from '@/hooks/useTheme'
import './index.css'

initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
