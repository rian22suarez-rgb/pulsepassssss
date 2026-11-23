import { createBrowserRouter } from 'react-router'
import { RutaPorRol, RutaProtegida, SoloAnonimo } from './auth/Guardas'
import { Layout } from './componentes/Layout'
import ErrorPagina from './paginas/ErrorPagina'
import Inicio from './paginas/Inicio'

/*
  Árbol de rutas (PRD §8.2). FE-007: solo createBrowserRouter + RouterProvider.
  FE-012: todas las páginas son lazy excepto Layout e Inicio.
  Las rutas se escriben relativas aquí porque son la definición; en el resto del código se usa RUTAS.
*/
const lazy = (cargar: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await cargar()).default })

export const rutas = [
  {
    path: '/',
    Component: Layout,
    errorElement: <ErrorPagina />,
    children: [
      { index: true, Component: Inicio },
      { path: 'eventos', lazy: lazy(() => import('./paginas/CatalogoEventos')) },
      { path: 'eventos/:eventCode', lazy: lazy(() => import('./paginas/DetalleEvento')) },
      { path: 'artistas', lazy: lazy(() => import('./paginas/ListaArtistas')) },
      { path: 'artistas/:id', lazy: lazy(() => import('./paginas/DetalleArtista')) },
      { path: 'sedes', lazy: lazy(() => import('./paginas/ListaSedes')) },
      { path: 'sedes/:code', lazy: lazy(() => import('./paginas/DetalleSede')) },
      {
        Component: SoloAnonimo,
        children: [
          { path: 'login', lazy: lazy(() => import('./paginas/Login')) },
          { path: 'registro', lazy: lazy(() => import('./paginas/Registro')) },
        ],
      },
      {
        Component: RutaProtegida,
        children: [
          { path: 'cuenta', lazy: lazy(() => import('./paginas/Cuenta')) },
          {
            element: <RutaPorRol roles={['USER']} />,
            children: [
              { path: 'mis-tickets', lazy: lazy(() => import('./paginas/MisTickets')) },
              { path: 'mis-tickets/:ticketCode', lazy: lazy(() => import('./paginas/DetalleTicket')) },
              { path: 'compra/confirmacion/:ticketCode', lazy: lazy(() => import('./paginas/ConfirmacionCompra')) },
            ],
          },
          {
            element: <RutaPorRol roles={['STAFF', 'ADMIN']} />,
            children: [
              { path: 'staff/validacion', lazy: lazy(() => import('./paginas/ValidacionIngreso')) },
              { path: 'staff/eventos/:eventCode/tickets', lazy: lazy(() => import('./paginas/TicketsPagadosEvento')) },
            ],
          },
          {
            element: <RutaPorRol roles={['ADMIN']} />,
            children: [
              { path: 'admin/eventos', lazy: lazy(() => import('./paginas/AdminEventos')) },
              { path: 'admin/eventos/nuevo', lazy: lazy(() => import('./paginas/AdminCrearEvento')) },
              { path: 'admin/eventos/:eventCode', lazy: lazy(() => import('./paginas/AdminGestionEvento')) },
            ],
          },
        ],
      },
      { path: '403', lazy: lazy(() => import('./paginas/SinPermisos')) },
      { path: '*', lazy: lazy(() => import('./paginas/NoEncontrada')) },
    ],
  },
]

export const crearRouter = () => createBrowserRouter(rutas)
