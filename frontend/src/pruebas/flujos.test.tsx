import { describe, expect, it, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Outlet } from 'react-router'
import { rutas } from '../router'
import { RutaPorRol, RutaProtegida } from '../auth/Guardas'
import { guardarSesion } from '../lib/almacen'
import { EVENTO_PUBLICADO, renderConApp, simularFetch, YO_USER } from './utilidades'

afterEach(() => vi.unstubAllGlobals())

const sesionGuardada = () => guardarSesion({ token: 'tok-andrea', expiraEn: Date.now() + 60_000 })

describe('guardas de ruta', () => {
  const arbol = [
    { path: '/login', element: <p>Pantalla login</p> },
    { path: '/403', element: <p>Sin permisos</p> },
    {
      element: <RutaProtegida />,
      children: [
        { element: <RutaPorRol roles={['ADMIN']} />, children: [{ path: '/admin', element: <p>Panel admin</p> }] },
        { path: '/cuenta', element: <p>Mi cuenta</p> },
      ],
    },
  ]

  it('anónimo en ruta protegida → /login con state.desde', async () => {
    simularFetch({})
    const { router } = renderConApp([{ element: <Outlet />, children: arbol }], '/cuenta')
    expect(await screen.findByText('Pantalla login')).toBeInTheDocument()
    expect(router.state.location.state).toMatchObject({ desde: '/cuenta' })
  })

  it('USER en ruta ADMIN → /403', async () => {
    sesionGuardada()
    simularFetch({ 'GET /api/v1/auth/me': [200, YO_USER] })
    renderConApp(arbol, '/admin')
    expect(await screen.findByText('Sin permisos')).toBeInTheDocument()
  })

  it('USER autenticado accede a ruta protegida', async () => {
    sesionGuardada()
    simularFetch({ 'GET /api/v1/auth/me': [200, YO_USER] })
    renderConApp(arbol, '/cuenta')
    expect(await screen.findByText('Mi cuenta')).toBeInTheDocument()
  })
})

describe('login', () => {
  it('401 muestra "Credenciales inválidas" sin revelar si el usuario existe', async () => {
    simularFetch({ 'POST /api/v1/auth/login': [401, null], 'GET /api/events/published': [200, []], 'GET /api/artists/active': [200, []] })
    renderConApp(rutas, '/login')
    await userEvent.type(await screen.findByLabelText('Usuario o correo'), 'nadie')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mala')
    await userEvent.click(screen.getByRole('button', { name: /Ingresar/ }))
    expect(await screen.findByText('Credenciales inválidas.')).toBeInTheDocument()
  })

  it('login correcto guarda sesión y vuelve a la ruta de origen', async () => {
    const llamadas = simularFetch({
      'POST /api/v1/auth/login': [200, { accessToken: 'jwt-123', tokenType: 'Bearer', expiresIn: 900 }],
      'GET /api/v1/auth/me': [200, YO_USER],
      'GET /api/tickets/user/andrea%40test.com': [200, []],
    })
    const { router } = renderConApp(rutas, '/mis-tickets')
    await userEvent.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Password123!')
    await userEvent.click(screen.getByRole('button', { name: /Ingresar/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/mis-tickets'))
    expect(await screen.findByText('Todavía no has comprado entradas.')).toBeInTheDocument()
    expect(llamadas.find((l) => l.url.includes('/me'))!.auth).toBe('Bearer jwt-123')
  })
})

describe('registro', () => {
  it('valida contraseña mínima de 12 y coincidencia', async () => {
    simularFetch({})
    renderConApp(rutas, '/registro')
    await userEvent.type(await screen.findByLabelText('Contraseña'), 'corta')
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'otra')
    await userEvent.click(screen.getByRole('button', { name: /Crear cuenta/ }))
    expect(await screen.findByText('La contraseña debe tener al menos 12 caracteres.')).toBeInTheDocument()
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
  })

  it('400 del servidor se mapea al campo correspondiente', async () => {
    simularFetch({ 'POST /api/users': [400, { status: 400, message: 'Validation failed', details: { username: 'El usuario ya está en uso' } }] })
    renderConApp(rutas, '/registro')
    const escribir = async (l: string, v: string) => userEvent.type(await screen.findByLabelText(l), v)
    await escribir('Nombre', 'Andrea'); await escribir('Apellido', 'Gómez'); await escribir('Usuario', 'andrea')
    await escribir('Correo', 'andrea@test.com'); await escribir('Fecha de nacimiento', '1998-05-02')
    await escribir('Contraseña', 'Password123!!'); await escribir('Confirmar contraseña', 'Password123!!')
    await userEvent.click(screen.getByRole('button', { name: /Crear cuenta/ }))
    expect(await screen.findByText('El usuario ya está en uso')).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('compra', () => {
  it('anónimo ve "Inicia sesión para comprar"', async () => {
    simularFetch({ 'GET /api/events/CMF-2026': [200, EVENTO_PUBLICADO], 'GET /api/venues/active': [200, []] })
    renderConApp(rutas, '/eventos/CMF-2026')
    expect(await screen.findByRole('link', { name: /Inicia sesión para comprar/ })).toBeInTheDocument()
  })

  it('evento agotado deshabilita la compra', async () => {
    simularFetch({ 'GET /api/events/CMF-2026': [200, { ...EVENTO_PUBLICADO, status: 'SOLD_OUT' }], 'GET /api/venues/active': [200, []] })
    renderConApp(rutas, '/eventos/CMF-2026')
    expect(await screen.findByRole('button', { name: /Compra no disponible/ })).toBeDisabled()
  })

  it('usa el email de la sesión y muestra el 409 de la regla de negocio en el modal', async () => {
    sesionGuardada()
    const llamadas = simularFetch({
      'GET /api/v1/auth/me': [200, YO_USER],
      'GET /api/events/CMF-2026': [200, EVENTO_PUBLICADO],
      'GET /api/venues/active': [200, []],
      'POST /api/tickets': [409, { status: 409, message: 'No cumple la edad mínima de 18 años.' }],
    })
    renderConApp(rutas, '/eventos/CMF-2026')
    await userEvent.click(await screen.findByLabelText(/VIP/))
    await userEvent.click(screen.getAllByRole('button', { name: /Comprar/ })[0]!)
    await userEvent.click(await screen.findByRole('button', { name: /Confirmar compra/, hidden: true }))
    expect(await screen.findByText('No cumple la edad mínima de 18 años.')).toBeInTheDocument()
    expect(llamadas.find((l) => l.metodo === 'POST')!.cuerpo).toEqual({ userEmail: 'andrea@test.com', eventCode: 'CMF-2026', type: 'VIP' })
  })

  it('borrador o inexistente → "Evento no disponible"', async () => {
    simularFetch({ 'GET /api/events/DRAFT-1': [404, { status: 404, message: 'x' }], 'GET /api/venues/active': [200, []] })
    renderConApp(rutas, '/eventos/DRAFT-1')
    expect(await screen.findByRole('heading', { name: 'Evento no disponible' })).toBeInTheDocument()
  })
})

describe('sesión', () => {
  it('un 401 en ruta protegida cierra la sesión y lleva a login con aviso', async () => {
    sesionGuardada()
    simularFetch({ 'GET /api/v1/auth/me': [200, YO_USER], 'GET /api/tickets/user/andrea%40test.com': [401, null] })
    renderConApp(rutas, '/mis-tickets')
    expect(await screen.findByText(/Tu sesión expiró/)).toBeInTheDocument()
    expect(sessionStorage.getItem('pp-sesion')).toBeNull()
  })
})
