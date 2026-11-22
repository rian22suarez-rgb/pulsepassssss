import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { eventosApi } from '../api/eventos';
import { artistsApi } from '../api/artists';
import { RUTAS } from '../lib/rutas';
import { CalendarDays } from 'lucide-react';

export const InicioPage = () => {
    const { data: eventos } = useQuery({
        queryKey: ['eventos-publicados'],
        queryFn: eventosApi.getPublicados,
    });

    const { data: artistas } = useQuery({
        queryKey: ['artistas-activos'],
        queryFn: artistsApi.getActive,
    });

    const eventosDestacados = eventos?.slice(0, 3) || [];
    const artistasDestacados = artistas?.slice(0, 4) || [];

    return (
        <div className="space-y-12 pb-12">
            <section className="bg-indigo-600 dark:bg-indigo-700 rounded-2xl p-10 md:p-16 text-center text-white shadow-lg">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Vive la experiencia <br className="hidden md:block"/> PulsePass
                </h1>
                <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                    Descubre los mejores conciertos, conferencias y eventos deportivos. Compra tus entradas de forma segura y rápida.
                </p>
                <Link
                    to={RUTAS.catalogo}
                    className="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                    Explorar Cartelera
                </Link>
            </section>

            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Próximos Eventos</h2>
                    <Link to={RUTAS.catalogo} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        Ver todos &rarr;
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {eventosDestacados.map((evento) => (
                        <div key={evento.eventCode} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-40 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <span className="text-indigo-400 dark:text-indigo-600 font-medium">Imagen</span>
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{evento.name}</h3>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4 gap-2">
                                    <CalendarDays size={16} />
                                    {new Date(evento.eventDate).toLocaleDateString('es-ES')}
                                </div>
                                <Link to={RUTAS.detalleEvento(evento.eventCode)} className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800">
                                    Comprar entradas &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Artistas en Tendencia</h2>
                    <Link to={RUTAS.artistas} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        Ver todos &rarr;
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {artistasDestacados.map((artista) => (
                        <Link to={RUTAS.detalleArtista(artista.id)} key={artista.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-shadow">
                            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                {artista.stageName.charAt(0)}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{artista.stageName}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{artista.genre}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};