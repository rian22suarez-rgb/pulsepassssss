import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { vi } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import { AvisoProvider } from '../componentes/Aviso'

/** Respuestas simuladas por "MÉTODO /ruta" → [status, cuerpo]. Sin backend real (PRD §4, QA). */
export type Simulacion = Record<string, [number, unknown] | ((cuerpo: unknown) => [number, unknown])>

export function simularFetch(sim: Simulacion) {
  const llamadas: { metodo: string; url: string; auth: string | null; cuerpo: unknown }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const metodo = init?.method ?? 'GET'
      const cuerpo = init?.body ? JSON.parse(String(init.body)) : undefined
      const auth = (init?.headers as Record<string, string> | undefined)?.Authorization ?? null
      llamadas.push({ metodo, url, auth, cuerpo })
      const r = sim[`${metodo} ${url}`]
      const [status, json] = typeof r === 'function' ? r(cuerpo) : (r ?? [404, { status: 404, message: 'no simulado' }])
      return new Response(json == null ? '' : JSON.stringify(json), { status })
    }),
  )
  return llamadas
}

export function renderConApp(rutas: RouteObject[], inicial: string, extra?: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter(rutas, { initialEntries: [inicial] })
  const utils = render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <AvisoProvider>
          <RouterProvider router={router} />
          {extra}
        </AvisoProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
  return { ...utils, router }
}

export const EVENTO_PUBLICADO = {
  eventCode: 'CMF-2026', name: 'Caribbean Music Fest 2026', description: 'Festival', category: 'MUSIC', status: 'PUBLISHED',
  eventDate: '2026-12-12T20:00:00', minimumAge: 18, venueCode: 'VEN-SMR-01', venueName: 'Marina Convention Center', artists: [],
}
export const YO_USER = { id: 1, username: 'andrea', email: 'andrea@test.com', roles: ['USER'] }
