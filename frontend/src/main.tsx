import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/api/axios-interceptors'

import { AppProviders } from '@/providers/AppProviders'

import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
