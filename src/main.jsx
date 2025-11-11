import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NivelFormacionProvider } from './context/NivelFormacionContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NivelFormacionProvider>
      <App />
    </NivelFormacionProvider>
  </StrictMode>,
)
