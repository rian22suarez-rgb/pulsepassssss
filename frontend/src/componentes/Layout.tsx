import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { ChevronDown, Menu, Moon, Sun, X } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { RUTAS } from '../lib/rutas'
import type { Rol } from '../lib/esquemas'
import { BotonEnlace } from './Boton'
import { Etiqueta } from './Tipografia'
import { Logo } from './Logo'

/*
  Layout raíz (PRD §9.2). Navbar "píldora" flotante como Techvora; enlaces según rol (PRD §8.4).
  Accesibilidad: <header>, <nav aria-label="Principal">, <main id="contenido"> y enlace "Saltar al contenido".
*/
interface EnlaceNav { a: string; texto: string; roles?: Rol[]; end?: boolean }

const PUBLICOS: EnlaceNav[] = [
  { a: RUTAS.eventos, texto: 'Eventos' },
  { a: RUTAS.artistas, texto: 'Artistas' },
  { a: RUTAS.sedes, texto: 'Sedes' },
]
const POR_ROL: EnlaceNav[] = [
  { a: RUTAS.misTickets, texto: 'Mis tickets', roles: ['USER'] },
  { a: RUTAS.staffValidacion, texto: 'Validar ingreso', roles: ['STAFF', 'ADMIN'] },
  { a: RUTAS.adminEventos, texto: 'Administrar', roles: ['ADMIN'] },
]

function claseNav({ isActive }: { isActive: boolean }) {
  return clsx(
    'rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
    isActive ? 'bg-tinta text-white dark:bg-white dark:text-tinta' : 'hover:bg-tinta/5 dark:hover:bg-white/10',
  )
}

function useTema() {
  const [oscuro, setOscuro] = useState(() => document.documentElement.classList.contains('dark'))
  const alternar = () => {
    const nuevo = !oscuro
    document.documentElement.classList.toggle('dark', nuevo)
    try {
      localStorage.setItem('pp-tema', nuevo ? 'oscuro' : 'claro')
    } catch {
      /* preferencia solo en memoria */
    }
    setOscuro(nuevo)
  }
  return { oscuro, alternar }
}

function MenuUsuario({ nombre, onSalir }: { nombre: string; onSalir: () => void }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { tieneRol } = useAuth()

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAbierto(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        aria-haspopup="menu"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-rosa-300 py-1.5 pr-3 pl-1.5 text-sm font-semibold text-tinta"
      >
        <span className="grid size-7 place-items-center rounded-full bg-tinta font-titulo text-sm text-white">{nombre[0]?.toUpperCase()}</span>
        <span className="max-w-28 truncate">{nombre}</span>
        <ChevronDown aria-hidden className="size-4" />
      </button>
      {abierto && (
        <div role="menu" className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-tinta/10 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#1c1c28]">
          <Link role="menuitem" to={RUTAS.cuenta} onClick={() => setAbierto(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-tinta/5 dark:hover:bg-white/10">
            Mi cuenta
          </Link>
          {tieneRol('USER') && (
            <Link role="menuitem" to={RUTAS.misTickets} onClick={() => setAbierto(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-tinta/5 dark:hover:bg-white/10">
              Mis tickets
            </Link>
          )}
          <button role="menuitem" type="button" onClick={onSalir} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#c2261f] hover:bg-coral-400/15 dark:text-coral-400">
            Salir
          </button>
        </div>
      )}
    </div>
  )
}

function Navbar() {
  const { sesion, tieneRol, cerrarSesion } = useAuth()
  const { oscuro, alternar } = useTema()
  const [menuMovil, setMenuMovil] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => setMenuMovil(false), [location.pathname])

  const enlaces = [...PUBLICOS, ...POR_ROL.filter((e) => !e.roles || tieneRol(...e.roles))]
  const salir = () => {
    cerrarSesion()
    void navigate(RUTAS.inicio)
  }

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-6xl rounded-full border border-tinta/10 bg-white/95 py-2 pr-2 pl-5 shadow-[0_8px_30px_rgb(10_10_18/0.08)] backdrop-blur dark:border-white/10 dark:bg-[#15151f]/95">
        <div className="flex items-center gap-3">
          <Link to={RUTAS.inicio} aria-label="PulsePass, inicio" className="mr-2 shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Principal" className="hidden flex-1 items-center gap-1 md:flex">
            {enlaces.map((e) => (
              <NavLink key={e.a} to={e.a} end={e.end} className={claseNav}>
                {e.texto}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={alternar}
              aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="grid size-10 place-items-center rounded-full hover:bg-tinta/5 dark:hover:bg-white/10"
            >
              {oscuro ? <Sun aria-hidden className="size-[18px]" /> : <Moon aria-hidden className="size-[18px]" />}
            </button>

            <div className="hidden items-center gap-2 md:flex">
              {sesion.estado === 'autenticado' ? (
                <MenuUsuario nombre={sesion.usuario.username} onSalir={salir} />
              ) : sesion.estado === 'anonimo' ? (
                <>
                  <Link to={RUTAS.login} className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-tinta/5 dark:hover:bg-white/10">
                    Ingresar
                  </Link>
                  <BotonEnlace to={RUTAS.registro} tamano="sm">Registrarse</BotonEnlace>
                </>
              ) : null}
            </div>

            <button
              type="button"
              className="grid size-10 place-items-center rounded-full bg-rosa-300 text-tinta md:hidden"
              aria-expanded={menuMovil}
              aria-controls="menu-movil"
              aria-label={menuMovil ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuMovil((v) => !v)}
            >
              {menuMovil ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuMovil && (
        <nav id="menu-movil" aria-label="Principal móvil" className="mx-auto mt-2 max-w-6xl rounded-[1.75rem] bg-bosque-700 p-5 text-white shadow-xl md:hidden">
          <ul className="flex flex-col">
            {enlaces.map((e) => (
              <li key={e.a}>
                <NavLink to={e.a} className={({ isActive }) => clsx('block py-2.5 font-titulo text-3xl uppercase', isActive && 'text-lima-400')}>
                  {e.texto}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/15 pt-4">
            {sesion.estado === 'autenticado' ? (
              <>
                <BotonEnlace to={RUTAS.cuenta} variante="claro" tamano="sm">Mi cuenta</BotonEnlace>
                <button type="button" onClick={salir} className="h-9 rounded-full px-4 text-sm font-semibold text-coral-400">Salir</button>
              </>
            ) : (
              <>
                <BotonEnlace to={RUTAS.login} variante="claro" tamano="sm">Ingresar</BotonEnlace>
                <BotonEnlace to={RUTAS.registro} tamano="sm">Registrarse</BotonEnlace>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-20 bg-bosque-900 text-white">
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-8">
        <p aria-hidden className="font-titulo text-[18vw] leading-[0.8] text-lima-400 uppercase md:text-[10rem]">PulsePass</p>
        <div className="mt-10 flex flex-col gap-6 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Etiqueta className="opacity-70">© 2026 PulsePass · Caso de estudio académico</Etiqueta>
          <nav aria-label="Pie de página" className="flex gap-5 text-sm font-semibold">
            <Link to={RUTAS.eventos} className="hover:text-lima-400">Eventos</Link>
            <Link to={RUTAS.artistas} className="hover:text-lima-400">Artistas</Link>
            <Link to={RUTAS.sedes} className="hover:text-lima-400">Sedes</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="sr-only z-50 rounded-full bg-lima-400 px-4 py-2 font-semibold text-tinta focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

/** Contenedor estándar de página (max-w-6xl, px-4/5, py-10). */
export function Pagina({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('mx-auto w-full max-w-6xl px-4 py-10 sm:px-5 sm:py-14', className)}>{children}</div>
}
