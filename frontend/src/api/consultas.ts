import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateEventRequest, PurchaseTicketRequest } from '../lib/esquemas'
import { artistasApi, eventosApi, sedesApi, ticketsApi, usuariosApi } from './endpoints'

/*
  Hooks de TanStack Query (FE-005): el estado del servidor vive en la caché de Query,
  no en useState/Context. Claves jerárquicas para invalidar con precisión (PRD §14.1-14.2).
*/
export const claves = {
  eventos: ['eventos'] as const,
  eventosPublicados: () => [...claves.eventos, 'publicados'] as const,
  evento: (code: string) => [...claves.eventos, 'detalle', code] as const,
  eventosDeArtista: (stageName: string) => [...claves.eventos, 'artista', stageName] as const,
  artistas: ['artistas'] as const,
  artista: (id: number) => [...claves.artistas, id] as const,
  sedes: ['sedes'] as const,
  sede: (code: string) => [...claves.sedes, code] as const,
  tickets: ['tickets'] as const,
  ticketsUsuario: (email: string) => [...claves.tickets, 'usuario', email] as const,
  ticket: (code: string) => [...claves.tickets, 'detalle', code] as const,
  ticketsPagados: (eventCode: string) => [...claves.tickets, 'pagados', eventCode] as const,
  usuario: (username: string) => ['usuario', username] as const,
}

// ── Lecturas ──────────────────────────────────────────────────────────
export const useEventosPublicados = () =>
  useQuery({ queryKey: claves.eventosPublicados(), queryFn: ({ signal }) => eventosApi.publicados(signal) })

export const useEvento = (code: string | undefined) =>
  useQuery({ queryKey: claves.evento(code ?? ''), queryFn: ({ signal }) => eventosApi.porCodigo(code!, signal), enabled: !!code })

export const useEventosDeArtista = (stageName: string | undefined) =>
  useQuery({
    queryKey: claves.eventosDeArtista(stageName ?? ''),
    queryFn: ({ signal }) => eventosApi.porArtista(stageName!, signal),
    enabled: !!stageName,
  })

export const useArtistasActivos = () =>
  useQuery({ queryKey: claves.artistas, queryFn: ({ signal }) => artistasApi.activos(signal), staleTime: 5 * 60_000 })

export const useArtista = (id: number | undefined) =>
  useQuery({ queryKey: claves.artista(id ?? -1), queryFn: ({ signal }) => artistasApi.porId(id!, signal), enabled: id !== undefined })

export const useSedesActivas = () =>
  useQuery({ queryKey: claves.sedes, queryFn: ({ signal }) => sedesApi.activas(signal), staleTime: 5 * 60_000 })

export const useSede = (code: string | undefined) =>
  useQuery({ queryKey: claves.sede(code ?? ''), queryFn: ({ signal }) => sedesApi.porCodigo(code!, signal), enabled: !!code })

export const useTicketsUsuario = (email: string | undefined) =>
  useQuery({
    queryKey: claves.ticketsUsuario(email ?? ''),
    queryFn: ({ signal }) => ticketsApi.delUsuario(email!, signal),
    enabled: !!email,
  })

export const useTicket = (code: string | undefined) =>
  useQuery({ queryKey: claves.ticket(code ?? ''), queryFn: ({ signal }) => ticketsApi.porCodigo(code!, signal), enabled: !!code })

export const useTicketsPagados = (eventCode: string | undefined) =>
  useQuery({
    queryKey: claves.ticketsPagados(eventCode ?? ''),
    queryFn: ({ signal }) => ticketsApi.pagadosDeEvento(eventCode!, signal),
    enabled: !!eventCode,
  })

export const useUsuario = (username: string | undefined) =>
  useQuery({ queryKey: claves.usuario(username ?? ''), queryFn: ({ signal }) => usuariosApi.porUsername(username!, signal), enabled: !!username })

// ── Mutaciones + invalidaciones (PRD §14.2) ───────────────────────────
export function useComprarTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: PurchaseTicketRequest) => ticketsApi.comprar(datos),
    onSuccess: (ticket) => {
      qc.setQueryData(claves.ticket(ticket.ticketCode), ticket)
      void qc.invalidateQueries({ queryKey: claves.tickets })
    },
  })
}

export function useCancelarTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => ticketsApi.cancelar(ticketCode),
    onSuccess: (ticket) => {
      qc.setQueryData(claves.ticket(ticket.ticketCode), ticket)
      void qc.invalidateQueries({ queryKey: claves.tickets })
    },
  })
}

export function useMarcarUsado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => ticketsApi.marcarUsado(ticketCode),
    onSuccess: (ticket) => {
      qc.setQueryData(claves.ticket(ticket.ticketCode), ticket)
      void qc.invalidateQueries({ queryKey: claves.tickets })
    },
  })
}

export function useCrearEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: CreateEventRequest) => eventosApi.crear(datos),
    onSuccess: (evento) => {
      qc.setQueryData(claves.evento(evento.eventCode), evento)
      void qc.invalidateQueries({ queryKey: claves.eventos })
    },
  })
}

export function usePublicarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventCode: string) => eventosApi.publicar(eventCode),
    onSuccess: (evento) => {
      qc.setQueryData(claves.evento(evento.eventCode), evento)
      void qc.invalidateQueries({ queryKey: claves.eventos })
    },
  })
}

export function useAsociarArtista(eventCode: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (artistId: number) => eventosApi.asociarArtista(eventCode, artistId),
    onSuccess: (evento) => {
      qc.setQueryData(claves.evento(evento.eventCode), evento)
      void qc.invalidateQueries({ queryKey: claves.eventos })
    },
  })
}

export function useRegistrarUsuario() {
  return useMutation({ mutationFn: usuariosApi.registrar })
}
