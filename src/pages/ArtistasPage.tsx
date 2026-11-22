import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '../api/artists';
import { Link } from 'react-router';
import { RUTAS } from '../lib/rutas';

export const ArtistasPage = () => {
    const [busqueda, setBusqueda] = useState('');
    const { data: artistas, isLoading } = useQuery({
        queryKey: ['artistas-activos'],
        queryFn: artistsApi.getActive,
    });

    if (isLoading) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Cargando artistas...</div>;

    const artistasFiltrados = artistas?.filter(a =>
        a.stageName.toLowerCase().includes(busqueda.toLowerCase())
    ) || [];

    return (
        <div className="max-w-7xl mx-auto mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Artistas</h1>
                <input
                    type="text"
                    placeholder="Buscar artista..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-64"
                />
            </div>

            {artistasFiltrados.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron artistas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {artistasFiltrados.map((artista) => (
                        <div key={artista.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-40 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <span className="text-indigo-400 dark:text-indigo-500 font-medium text-3xl">{artista.stageName.charAt(0)}</span>
                            </div>
                            <div className="p-5 text-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{artista.stageName}</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{artista.genre}</p>
                                <Link to={RUTAS.detalleArtista(artista.id)} className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 text-sm">
                                    Ver perfil &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};