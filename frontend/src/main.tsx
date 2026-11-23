import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './auth/AuthContext'
import { AvisoProvider } from './componentes/Aviso'
import { debeReintentar } from './lib/errores'
import { crearRouter } from './router'
import './index.css'

// PRD §14.3: no reintentar 4xx; un reintento para red/5xx. staleTime corto porque no hay websockets.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: debeReintentar, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
})

const router = crearRouter()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AvisoProvider>
          <RouterProvider router={router} />
        </AvisoProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
