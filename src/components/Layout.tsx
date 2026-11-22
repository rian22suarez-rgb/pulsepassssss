import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RUTAS } from '../lib/rutas';

export const Layout = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const esStaff = user?.roles?.some((r) => ['STAFF', 'ADMIN'].includes(r));
    const esAdmin = user?.roles?.includes('ADMIN');

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm font-medium whitespace-nowrap transition-colors ${
            isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
        }`;

    const handleLogout = () => {
        logout();
        navigate(RUTAS.login);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <header className="bg-white dark:bg-gray-950 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link
                        to={RUTAS.inicio}
                        className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap"
                    >
                        PulsePass
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <NavLink to={RUTAS.catalogo} className={navLinkClass}>
                            Eventos
                        </NavLink>

                        {isAuthenticated ? (
                            <>
                                {esAdmin && (
                                    <NavLink
                                        to={RUTAS.adminCrearEvento}
                                        className={({ isActive }) =>
                                            `text-sm font-semibold whitespace-nowrap transition-colors ${
                                                isActive
                                                    ? 'text-purple-500 dark:text-purple-300 underline'
                                                    : 'text-purple-600 dark:text-purple-400 hover:text-purple-500'
                                            }`
                                        }
                                    >
                                        Crear Evento
                                    </NavLink>
                                )}

                                {esStaff && (
                                    <NavLink
                                        to={RUTAS.staffIngreso}
                                        className={({ isActive }) =>
                                            `text-sm font-semibold whitespace-nowrap transition-colors ${
                                                isActive
                                                    ? 'text-green-500 dark:text-green-300 underline'
                                                    : 'text-green-600 dark:text-green-400 hover:text-green-500'
                                            }`
                                        }
                                    >
                                        Validar Ticket
                                    </NavLink>
                                )}

                                <NavLink to={RUTAS.misTickets} className={navLinkClass}>
                                    Mis Tickets
                                </NavLink>

                                <div className="h-5 w-px bg-gray-300 dark:bg-gray-700" />

                                <Link
                                    to={RUTAS.cuenta}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap"
                                >
                                    <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                                        {user?.username.charAt(0).toUpperCase()}
                                    </span>
                                    <span>{user?.username}</span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium whitespace-nowrap"
                                >
                                    Salir
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to={RUTAS.login}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 whitespace-nowrap"
                                >
                                    Ingresar
                                </Link>
                                <Link
                                    to={RUTAS.registro}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors whitespace-nowrap"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </nav>

                    <div className="md:hidden flex items-center">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 dark:text-gray-300 p-2"
                            aria-label="Abrir menú"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 px-4 pt-2 pb-4 space-y-2">
                        <NavLink
                            to={RUTAS.catalogo}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-2 text-gray-700 dark:text-gray-300"
                        >
                            Eventos
                        </NavLink>
                        {isAuthenticated && (
                            <>
                                {esAdmin && (
                                    <NavLink
                                        to={RUTAS.adminCrearEvento}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block py-2 text-purple-600 dark:text-purple-400 font-semibold"
                                    >
                                        Crear Evento
                                    </NavLink>
                                )}
                                {esStaff && (
                                    <NavLink
                                        to={RUTAS.staffIngreso}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block py-2 text-green-600 dark:text-green-400 font-semibold"
                                    >
                                        Validar Ticket
                                    </NavLink>
                                )}
                                <NavLink
                                    to={RUTAS.misTickets}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-2 text-gray-700 dark:text-gray-300"
                                >
                                    Mis Tickets
                                </NavLink>
                                <NavLink
                                    to={RUTAS.cuenta}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-2 text-gray-700 dark:text-gray-300"
                                >
                                    Mi Cuenta ({user?.username})
                                </NavLink>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="block w-full text-left py-2 text-red-600 font-medium"
                                >
                                    Cerrar Sesión
                                </button>
                            </>
                        )}
                    </div>
                )}
            </header>

            <main className="flex-grow w-full mx-auto py-8">
                <Outlet />
            </main>

            <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-6 text-center text-gray-500 dark:text-gray-400 text-sm mt-auto">
                <div className="flex justify-center gap-6 mb-2">
                    <Link to={RUTAS.sedes} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                        Sedes
                    </Link>
                    <Link to={RUTAS.artistas} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                        Artistas
                    </Link>
                </div>
                <p>© 2026 PulsePass - Caso de estudio académico</p>
            </footer>

            <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className="fixed bottom-5 right-5 z-40 p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
    );
};