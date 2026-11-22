import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext' // <-- IMPORTANTE
import { Layout } from './components/Layout'
import { InicioPage } from './pages/InicioPage'
import { LoginPage } from './pages/LoginPage'
import { RegistroPage } from './pages/RegistroPage'
import { CatalogoPage } from './pages/CatalogoPage'
import { DetalleEventoPage } from './pages/DetalleEventoPage'
import { MisTicketsPage } from './pages/MisTicketsPage'
import { DetalleTicketPage } from './pages/DetalleTicketPage'
import { StaffValidarPage } from './pages/StaffValidarPage'
import { StaffEventoTicketsPage } from './pages/StaffEventoTicketsPage'
import { AdminCrearEventoPage } from './pages/AdminCrearEventoPage'
import { ArtistasPage } from './pages/ArtistasPage'
import { DetalleArtistaPage } from './pages/DetalleArtistaPage'
import { SedesPage } from './pages/SedesPage'
import { DetalleSedePage } from './pages/DetalleSedePage'
import { MiCuentaPage } from './pages/MiCuentaPage' // <-- Asegúrate de tener esta página
import { RutaPorRol } from './components/RutaPorRol'
import { NotFoundPage } from './pages/NotFoundPage'
import { ErrorPage } from './pages/ErrorPage'
import { RUTAS } from './lib/rutas'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

const router = createBrowserRouter([
    {
        path: RUTAS.inicio,
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <InicioPage /> },
            { path: RUTAS.login, element: <LoginPage /> },
            { path: RUTAS.registro, element: <RegistroPage /> },
            { path: RUTAS.catalogo, element: <CatalogoPage /> },
            { path: RUTAS.detalleEvento(':eventCode'), element: <DetalleEventoPage /> },
            { path: RUTAS.artistas, element: <ArtistasPage /> },
            { path: RUTAS.detalleArtista(':id'), element: <DetalleArtistaPage /> },
            { path: RUTAS.sedes, element: <SedesPage /> },
            { path: RUTAS.detalleSede(':code'), element: <DetalleSedePage /> },
            { path: RUTAS.misTickets, element: <MisTicketsPage /> },
            { path: RUTAS.detalleTicket(':ticketCode'), element: <DetalleTicketPage /> },
            { path: RUTAS.cuenta, element: <MiCuentaPage /> }, // <-- Ruta de Mi Cuenta

            // RUTAS PROTEGIDAS PARA STAFF / ADMIN
            {
                element: <RutaPorRol rolesPermitidos={['STAFF', 'ADMIN']} />,
                children: [
                    { path: RUTAS.staffIngreso, element: <StaffValidarPage /> },
                    { path: '/staff/eventos/:eventCode/tickets', element: <StaffEventoTicketsPage /> }
                ]
            },

            // RUTAS PROTEGIDAS SOLO PARA ADMIN
            {
                element: <RutaPorRol rolesPermitidos={['ADMIN']} />,
                children: [
                    { path: RUTAS.adminCrearEvento, element: <AdminCrearEventoPage /> }
                ]
            },

            // RUTA COMODÍN PARA EL 404
            { path: '*', element: <NotFoundPage /> }
        ],
    },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider> {/* <-- AQUÍ ESTÁ EL ENVOLTORIO DEL TEMA */}
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    </React.StrictMode>,
)