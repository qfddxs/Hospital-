import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NivelFormacionProvider } from './context/NivelFormacionContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificacionesProvider } from './context/NotificacionesContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <NotificacionesProvider>
        <NivelFormacionProvider>
          <App />
        </NivelFormacionProvider>
      </NotificacionesProvider>
    </ThemeProvider>
  </StrictMode>,
)
