import { useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEventoDetalle } from '../hooks/useEventos';
import { useComprarTicket } from '../hooks/useTickets';
import { eventosApi } from '../api/eventos';
import { artistsApi } from '../api/artists';
import { useAuth } from '../context/AuthContext';
import { RUTAS } from '../lib/rutas';
import { ApiError } from '../lib/http';

export const DetalleEventoPage = () => {
    const { eventCode } = useParams<{ eventCode: string }>();
    const { data: evento, isLoading, isError } = useEventoDetalle(eventCode!);
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const [tipoTicket, setTipoTicket] = useState('GENERAL');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [publicando, setPublicando] = useState(false);
    const [artistaSeleccionado, setArtistaSeleccionado] = useState<string>('');
    const [asociando, setAsociando] = useState(false);

    const { mutate: comprar, isPending } = useComprarTicket();

    const { data: artistas } = useQuery({
        queryKey: ['artistas-activos'],
        queryFn: artistsApi.getActive,
        enabled: user?.roles?.includes('ADMIN'),
    });

    if (isLoading) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Cargando evento...</div>;

    if (isError || !evento) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Evento no disponible</h2>
                <Link to={RUTAS.catalogo} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    &larr; Volver a la cartelera
                </Link>
            </div>
        );
    }

    const handleComprar = () => {
        if (!isAuthenticated || !user) {
            navigate(RUTAS.login, { state: { from: { pathname: location.pathname } } });
            return;
        }
        setErrorMsg(null);
        comprar(
            { userEmail: user.email, eventCode: evento.eventCode, type: tipoTicket },
            {
                onSuccess: () => navigate(RUTAS.misTickets),
                onError: (error) => setErrorMsg(error instanceof ApiError ? error.message : 'Error al procesar la compra.')
            }
        );
    };

    const handlePublicar = async () => {
        if (!window.confirm('¿Publicar este evento? Será visible en el catálogo.')) return;
        setPublicando(true);
        try {
            await eventosApi.publicar(evento.eventCode);
            queryClient.invalidateQueries({ queryKey: ['evento', eventCode] });
            queryClient.invalidateQueries({ queryKey: ['eventos-publicados'] });
        } catch {
            alert('Error al publicar el evento');
        } finally {
            setPublicando(false);
        }
    };

    const handleAsociarArtista = async () => {
        if (!artistaSeleccionado) {
            alert("Por favor, selecciona un artista primero.");
            return;
        }
        setAsociando(true);
        try {
            await eventosApi.asociarArtista(evento.eventCode, Number(artistaSeleccionado));
            await queryClient.invalidateQueries({ queryKey: ['evento', eventCode] });
            setArtistaSeleccionado('');
            alert("¡Artista añadido con éxito!");
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Revisa la consola de IntelliJ';
            alert(`Error al añadir: ${msg}`);
        } finally {
            setAsociando(false);
        }
    };

    const esAdmin = user?.roles?.includes('ADMIN');
    const textoSede = evento.venue
        ? `${evento.venue.name} - ${evento.venue.city}`
        : 'Sede por confirmar';

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="h-64 bg-indigo-200 dark:bg-indigo-900/50 flex items-center justify-center">
                    <span className="text-indigo-500 dark:text-indigo-400 font-medium text-lg">Imagen del Evento</span>
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{evento.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{evento.category}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            evento.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                evento.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                            {evento.status}
                        </span>
                    </div>

                    {esAdmin && evento.status === 'DRAFT' && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-md mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <p className="text-yellow-800 dark:text-yellow-400 font-medium">Este evento es un borrador (DRAFT).</p>
                                <p className="text-yellow-700 dark:text-yellow-500 text-sm">Publícalo para que sea visible en la cartelera pública.</p>
                            </div>
                            <button
                                onClick={handlePublicar}
                                disabled={publicando}
                                className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600 font-medium whitespace-nowrap"
                            >
                                {publicando ? 'Publicando...' : 'Publicar Evento'}
                            </button>
                        </div>
                    )}

                    <p className="text-gray-700 dark:text-gray-300 mb-6">{evento.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border border-transparent dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Lugar y Fecha</h3>
                            <p className="text-gray-700 dark:text-gray-300">{textoSede}</p>
                            <p className="text-gray-700 dark:text-gray-300">
                                {new Date(evento.eventDate).toLocaleDateString('es-ES', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Edad mínima: {evento.minimumAge} años</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border border-transparent dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Artistas</h3>
                            {evento.artists && evento.artists.length > 0 ? (
                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
                                    {evento.artists.map((artista) => (
                                        <li key={artista.id}>{artista.stageName}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Artistas por confirmar</p>
                            )}

                            {esAdmin && artistas && artistas.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Añadir Artista</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={artistaSeleccionado}
                                            onChange={(e) => setArtistaSeleccionado(e.target.value)}
                                            className="flex-1 text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Selecciona...</option>
                                            {artistas.map(a => (
                                                <option key={a.id} value={a.id}>{a.stageName}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAsociarArtista}
                                            disabled={!artistaSeleccionado || asociando}
                                            className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {asociando ? '...' : 'Añadir'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4 text-sm" role="alert">
                            {errorMsg}
                        </div>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <label htmlFor="tipo" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Tipo de entrada:</label>

                            <select
                                id="tipo"
                                value={tipoTicket}
                                onChange={(e) => setTipoTicket(e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full sm:w-auto focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                disabled={evento.status !== 'PUBLISHED' || isPending}
                            >
                                <option value="GENERAL" className="text-gray-900 dark:text-white dark:bg-gray-800">General</option>
                                <option value="VIP" className="text-gray-900 dark:text-white dark:bg-gray-800">VIP</option>
                                <option value="BACKSTAGE" className="text-gray-900 dark:text-white dark:bg-gray-800">Backstage</option>
                                <option value="STUDENT" className="text-gray-900 dark:text-white dark:bg-gray-800">Estudiante</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleComprar}
                            disabled={evento.status !== 'PUBLISHED' || isPending}
                            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium text-lg transition-colors"
                        >
                            {isPending ? 'Comprando...' : 'Comprar Entrada'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};