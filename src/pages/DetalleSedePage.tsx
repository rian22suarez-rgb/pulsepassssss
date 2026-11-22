import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { venuesApi } from '../api/venues';
import { RUTAS } from '../lib/rutas';

export const DetalleSedePage = () => {
    const { code } = useParams<{ code: string }>();

    const { data: sede, isLoading } = useQuery({
        queryKey: ['sede', code],
        queryFn: () => venuesApi.getByCode(code!),
        enabled: !!code,
    });

    if (isLoading) return <div className="text-center py-20">Cargando sede...</div>;
    if (!sede) return <div className="text-center py-20">Sede no encontrada.</div>;

    return (
        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 font-medium">Imagen de la Sede</span>
            </div>
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{sede.name}</h1>
                <p className="text-indigo-600 font-medium text-lg mb-6">{sede.city}</p>

                <div className="bg-gray-50 p-6 rounded-md border border-gray-100 mb-6">
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Capacidad Total</p>
                    <p className="text-2xl font-bold text-gray-900">{sede.capacity} personas</p>
                </div>

                <Link to={RUTAS.sedes} className="text-indigo-600 hover:underline">
                    &larr; Volver a sedes
                </Link>
            </div>
        </div>
    );
};