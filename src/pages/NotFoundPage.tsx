import { Link } from 'react-router';
import { RUTAS } from '../lib/rutas';

export const NotFoundPage = () => {
    return (
        <div className="text-center py-20">
            <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h2>
            <p className="text-gray-600 mb-8">Lo sentimos, la página que buscas no existe o fue movida.</p>
            <Link to={RUTAS.inicio} className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium">
                Volver al inicio
            </Link>
        </div>
    );
};