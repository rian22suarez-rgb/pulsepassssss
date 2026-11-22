import { Link, useSearchParams } from 'react-router';
import { useEventosPublicados } from '../hooks/useEventos';
import { RUTAS } from '../lib/rutas';
import { CalendarDays, MapPin } from 'lucide-react';

export const CatalogoPage = () => {
    const { data: eventos, isLoading, isError } = useEventosPublicados();
    const [searchParams, setSearchParams] = useSearchParams();

    const busqueda = searchParams.get('q') || '';
    const categoriaFiltro = searchParams.get('categoria') || '';

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchParams((prev) => {
            if (value) prev.set('q', value); else prev.delete('q');
            return prev;
        });
    };

    const handleCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSearchParams((prev) => {
            if (value) prev.set('categoria', value); else prev.delete('categoria');
            return prev;
        });
    };

    if (isLoading) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Cargando cartelera...</div>;
    if (isError) return <div className="text-center py-20 text-red-500">Error al cargar los eventos.</div>;

    const eventosFiltrados = eventos?.filter((evt) => {
        const coincideTexto = evt.name.toLowerCase().includes(busqueda.toLowerCase());
        const coincideCategoria = categoriaFiltro ? evt.category === categoriaFiltro : true;
        return coincideTexto && coincideCategoria;
    }) || [];

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cartelera de Eventos</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar evento..."
                        value={busqueda}
                        onChange={handleSearch}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-64"
                    />
                    <select
                        value={categoriaFiltro}
                        onChange={handleCategory}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 w-full sm:w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="" className="dark:bg-gray-800">Todas las categorías</option>
                        <option value="MUSIC" className="dark:bg-gray-800">Música</option>
                        <option value="SPORTS" className="dark:bg-gray-800">Deportes</option>
                        <option value="TECHNOLOGY" className="dark:bg-gray-800">Tecnología</option>
                        <option value="EDUCATION" className="dark:bg-gray-800">Educación</option>
                        <option value="CULTURE" className="dark:bg-gray-800">Cultura</option>
                        <option value="ENTERTAINMENT" className="dark:bg-gray-800">Entretenimiento</option>
                    </select>
                </div>
            </div>

            {eventosFiltrados.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron eventos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventosFiltrados.map((evento) => (
                        <div key={evento.eventCode} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-48 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <span className="text-indigo-400 dark:text-indigo-600 font-medium">Imagen del Evento</span>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{evento.name}</h2>
                                    <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
                    {evento.category}
                  </span>
                                </div>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4 gap-2">
                                    <CalendarDays size={16} />
                                    {new Date(evento.eventDate).toLocaleDateString('es-ES')}
                                </div>
                                <Link to={RUTAS.detalleEvento(evento.eventCode)} className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300">
                                    Ver detalles &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};