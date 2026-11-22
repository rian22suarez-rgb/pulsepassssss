import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { RUTAS } from '../lib/rutas';

export const CuentaPage = () => {
    const { user, logout } = useAuth();

    // Ajusta este fetcher a tu cliente HTTP (lib/http.ts) y al endpoint de usuario propio
    const perfilQuery = useQuery({
        queryKey: ['usuario', user?.email ?? user?.username ?? 'actual'],
        enabled: Boolean(user?.email || user?.username),
        queryFn: async () => {
            // Ejemplo con endpoint por email o username:
            // return await apiGet(`/api/users/by-email?email=${encodeURIComponent(user!.email)}`)
            return null;
        },
    });

    if (!user) {
        return (
            <section className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Mi cuenta</h1>
                <p className="text-gray-600 mb-4">Debes iniciar sesión para ver los datos de tu cuenta.</p>
                <Link
                    to={RUTAS.login}
                    className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
                >
                    Iniciar sesión
                </Link>
            </section>
        );
    }

    const iniciales = (user.username || 'U').slice(0, 2).toUpperCase();

    return (
        <section className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            aria-hidden="true"
                            className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center"
                        >
                            {iniciales}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                    </div>

                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
            {user.roles?.join(', ') || 'USER'}
          </span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
                    <div>
                        <dt className="text-gray-500">Correo electrónico</dt>
                        <dd className="font-medium text-gray-900">{user.email ?? 'No disponible'}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Estado</dt>
                        <dd className="font-medium text-emerald-700">Activa</dd>
                    </div>
                </dl>

                {perfilQuery.isLoading && (
                    <p className="text-sm text-gray-500" aria-live="polite">
                        Cargando detalles del perfil...
                    </p>
                )}

                {perfilQuery.isError && (
                    <div className="flex items-center justify-between bg-red-50 text-red-700 p-3 rounded-md text-sm" role="alert">
                        <span>No se pudieron cargar los datos adicionales del perfil.</span>
                        <button
                            type="button"
                            onClick={() => perfilQuery.refetch()}
                            className="underline font-medium ml-3"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                    <Link
                        to={RUTAS.misTickets}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
                    >
                        Ver mis tickets
                    </Link>
                    <button
                        type="button"
                        onClick={logout}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 text-sm font-medium"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </section>
    );
};