import { useAuth } from '../context/AuthContext';
import { useMisTickets, useCancelarTicket } from '../hooks/useTickets';
import { Link } from 'react-router';
import { RUTAS } from '../lib/rutas';

export const MisTicketsPage = () => {
    const { user } = useAuth();
    const { data: tickets, isLoading, isError } = useMisTickets(user?.email || '');
    const { mutate: cancelar, isPending } = useCancelarTicket();

    if (!user) return null;

    if (isLoading) return <div className="text-center py-20">Cargando tus tickets...</div>;
    if (isError) return <div className="text-center py-20 text-red-500">Error al cargar tus tickets.</div>;

    const handleCancelar = (e: React.MouseEvent, ticketCode: string) => {
        e.preventDefault(); // Evita que se abra el detalle al hacer clic en Cancelar
        if (window.confirm('¿Estás seguro de que deseas cancelar este ticket?')) {
            cancelar(ticketCode, {
                onError: (error: any) => alert(error.message || 'Error al cancelar')
            });
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis Tickets</h1>

            {!tickets || tickets.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500 text-lg mb-4">No tienes tickets comprados aún.</p>
                    <Link to={RUTAS.catalogo} className="text-indigo-600 hover:underline font-medium">
                        Explorar eventos
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tickets.map((ticket) => (
                        <Link
                            to={RUTAS.detalleTicket(ticket.ticketCode)}
                            key={ticket.ticketCode}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{ticket.eventCode}</h2>
                                        <p className="text-sm text-gray-500">Código: {ticket.ticketCode}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        ticket.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            ticket.status === 'USED' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <p className="text-gray-700 mb-2">Tipo: <span className="font-medium">{ticket.type}</span></p>
                                <p className="text-gray-700 mb-2">Precio: <span className="font-medium">${ticket.price}</span></p>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                    {new Date(ticket.purchaseDate).toLocaleDateString('es-ES')}
                                </span>
                                {ticket.status === 'PAID' && (
                                    <button
                                        onClick={(e) => handleCancelar(e, ticket.ticketCode)}
                                        disabled={isPending}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium z-10"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};