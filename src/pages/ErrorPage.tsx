import { useRouteError, Link } from 'react-router';
import { RUTAS } from '../lib/rutas.ts';

export const ErrorPage = () => {
    const error: any = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md w-full">
                <h1 className="text-4xl font-bold text-red-600 mb-4">¡Ups!</h1>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
                <p className="text-gray-600 mb-8">
                    {error?.statusText || error?.message || 'Ocurrió un error inesperado en la aplicación.'}
                </p>
                <Link to={RUTAS.inicio} className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium">
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
};