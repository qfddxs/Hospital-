import { BrowserRouter } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import { ThemeProvider } from './context/ThemeContext'
import AppRouter from './routes/router'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SessionProvider>
          <AppRouter />
        </SessionProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
