import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import { authApi } from '../api/auth';
import type { TicketResponse } from '../types/api';
import { ApiError } from '../lib/http';

const claseInputClaro =
    'flex-1 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-400 caret-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase';

export const StaffValidarPage = () => {
    const [codigo, setCodigo] = useState('');
    const [ticket, setTicket] = useState<TicketResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const [eventoCodeInput, setEventoCodeInput] = useState('');

    const { data: usuarioAsistente } = useQuery({
        queryKey: ['asistente-ticket', ticket?.userEmail],
        queryFn: () => authApi.getUserByEmail(ticket!.userEmail),
        enabled: !!ticket?.userEmail,
        retry: false,
    });

    const buscarTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!codigo.trim()) return;

        setCargando(true);
        setError(null);
        setTicket(null);

        try {
            const data = await ticketsApi.getByCode(codigo.trim());
            setTicket(data);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.status === 404 ? 'Ticket no encontrado.' : err.message);
            } else {
                setError('Error de conexión con el servidor.');
            }
        } finally {
            setCargando(false);
        }
    };

    const handleMarcarUsado = async () => {
        if (!ticket) return;

        if (!window.confirm(`¿Estás seguro de marcar el ticket ${ticket.ticketCode} como USADO?`)) return;

        try {
            await ticketsApi.marcarUsado(ticket.ticketCode);
            setTicket({ ...ticket, status: 'USED' });
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            }
        }
    };

    const nombreAsistente =
        usuarioAsistente?.username || (ticket ? ticket.userEmail.split('@')[0] : '');

    return (
        <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Validar Ingreso (Staff)</h1>
            <p className="text-gray-500 mb-6">Escanea o ingresa el código del ticket para validar la entrada.</p>

            <form onSubmit={buscarTicket} className="flex gap-4 mb-8">
                <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. TCK-EA5D26C5"
                    className={claseInputClaro}
                />
                <button
                    type="submit"
                    disabled={cargando}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                    {cargando ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6" role="alert">
                    {error}
                </div>
            )}

            {ticket && (
                <div className="border border-gray-200 rounded-md p-6 bg-gray-50 mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Evento: {ticket.eventCode}</h2>
                            <p className="text-gray-700 mt-1">
                                Tipo de entrada: <span className="font-semibold">{ticket.type}</span>
                            </p>
                            <p className="text-gray-700">
                                Asistente:{' '}
                                <span className="font-semibold text-gray-900">{nombreAsistente}</span>{' '}
                                <span className="text-sm text-gray-500">({ticket.userEmail})</span>
                            </p>
                        </div>
                        <span
                            className={`px-4 py-2 rounded-full text-sm font-bold ${
                                ticket.status === 'PAID'
                                    ? 'bg-green-100 text-green-700'
                                    : ticket.status === 'USED'
                                        ? 'bg-gray-200 text-gray-700'
                                        : 'bg-red-100 text-red-700'
                            }`}
                        >
                            {ticket.status}
                        </span>
                    </div>

                    {ticket.status === 'PAID' ? (
                        <button
                            onClick={handleMarcarUsado}
                            className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 font-bold text-lg transition-colors"
                        >
                            ✓ Marcar como USADO (Permitir Ingreso)
                        </button>
                    ) : (
                        <div className="bg-gray-200 text-gray-700 p-4 rounded-md text-center font-medium">
                            Este ticket ya no es válido para ingresar (Estado: {ticket.status})
                        </div>
                    )}
                </div>
            )}

            {/* Acceso a Tickets Pagados por Evento */}
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg mt-8">
                <h3 className="text-lg font-bold text-indigo-900 mb-2">Ver Tickets Pagados por Evento</h3>
                <p className="text-indigo-700 text-sm mb-4">Ingresa el código del evento para ver la lista de asistentes.</p>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Ej. E2E-2026"
                        value={eventoCodeInput}
                        onChange={(e) => setEventoCodeInput(e.target.value)}
                        className="flex-1 px-4 py-2 border border-indigo-200 rounded-md bg-white text-gray-900 placeholder:text-gray-400 caret-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                    />
                    <Link
                        to={`/staff/eventos/${eventoCodeInput.trim()}/tickets`}
                        className={`px-6 py-2 rounded-md font-medium text-white transition-colors ${
                            eventoCodeInput.trim()
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-gray-400 pointer-events-none'
                        }`}
                    >
                        Ver Tickets
                    </Link>
                </div>
            </div>
        </div>
    );
};