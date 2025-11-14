import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NivelFormacionProvider } from './context/NivelFormacionContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <NivelFormacionProvider>
        <App />
      </NivelFormacionProvider>
    </ThemeProvider>
  </StrictMode>,
)
