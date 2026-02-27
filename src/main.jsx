import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1C1917',
              color: '#FAF7F2',
              border: '1px solid rgba(194, 112, 62, 0.3)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: {
                primary: '#C2703E',
                secondary: '#FAF7F2',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC2626',
                secondary: '#FAF7F2',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
