import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '../api/artists';
import { eventosApi } from '../api/eventos';
import { RUTAS } from '../lib/rutas';

export const DetalleArtistaPage = () => {
    const { id } = useParams<{ id: string }>();

    const { data: artista, isLoading } = useQuery({
        queryKey: ['artista', id],
        queryFn: () => artistsApi.getById(Number(id)),
        enabled: !!id,
    });

    const { data: eventos } = useQuery({
        queryKey: ['eventos-artista', artista?.stageName],
        queryFn: () => eventosApi.getByArtist(artista!.stageName),
        enabled: !!artista?.stageName,
    });

    if (isLoading) return <div className="text-center py-20">Cargando artista...</div>;
    if (!artista) return <div className="text-center py-20">Artista no encontrado.</div>;

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mb-8">
                <div className="w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                    {artista.stageName.charAt(0)}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{artista.stageName}</h1>
                <p className="text-indigo-600 font-medium text-lg">{artista.genre}</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Próximos Eventos</h2>
            {!eventos || eventos.length === 0 ? (
                <p className="text-gray-500">Este artista no tiene eventos programados por ahora.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventos.map((evt) => (
                        <Link to={RUTAS.detalleEvento(evt.eventCode)} key={evt.eventCode} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md">
                            <h3 className="text-lg font-bold text-gray-900">{evt.name}</h3>
                            <p className="text-gray-500 text-sm">{new Date(evt.eventDate).toLocaleDateString('es-ES')}</p>
                            <p className="text-indigo-600 mt-2 font-medium">Ver evento &rarr;</p>
                        </Link>
                    ))}
                </div>
            )}
            <div className="mt-8">
                <Link to={RUTAS.artistas} className="text-indigo-600 hover:underline">&larr; Volver a artistas</Link>
            </div>
        </div>
    );
};