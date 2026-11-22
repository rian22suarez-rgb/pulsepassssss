import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { RUTAS } from '../lib/rutas';

export const MiCuentaPage = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const esAdmin = user?.roles?.includes('ADMIN');
    const esStaff = user?.roles?.some((r) => ['STAFF', 'ADMIN'].includes(r));

    const handleLogout = () => {
        logout();
        navigate(RUTAS.login);
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="max-w-2xl mx-auto mt-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mi Cuenta</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Necesitas iniciar sesión para consultar los datos de tu cuenta.
                </p>
                <Link
                    to={RUTAS.login}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium"
                >
                    Iniciar Sesión
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Mi Cuenta</h1>

            <div className="space-y-4">
                <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-2xl font-bold">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Roles</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {user.roles.map((rol) => (
                                <span
                                    key={rol}
                                    className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-xs font-bold"
                                >
                                    {rol}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                        <p className="font-medium text-green-600 dark:text-green-400 mt-1">Activo</p>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
                    <Link
                        to={RUTAS.misTickets}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm"
                    >
                        Ver mis tickets
                    </Link>

                    {esAdmin && (
                        <Link
                            to={RUTAS.adminCrearEvento}
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-medium text-sm"
                        >
                            Crear Evento
                        </Link>
                    )}

                    {esStaff && (
                        <Link
                            to={RUTAS.staffIngreso}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium text-sm"
                        >
                            Validar Ticket
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 font-medium text-sm"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};