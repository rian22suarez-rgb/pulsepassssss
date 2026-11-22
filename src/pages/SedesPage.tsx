import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { venuesApi } from '../api/venues';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/http';
import { RUTAS } from '../lib/rutas';

const claseInputSede =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder:text-gray-400 caret-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export const SedesPage = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const esAdmin = user?.roles?.includes('ADMIN');

    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [capacity, setCapacity] = useState('');
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    const { data: sedes, isLoading } = useQuery({
        queryKey: ['sedes-activas'],
        queryFn: venuesApi.getActive,
    });

    const crearSedeMutation = useMutation({
        mutationFn: venuesApi.create,
        onSuccess: () => {
            setMensajeError(null);
            setMensajeExito('Sede creada correctamente.');
            setCode('');
            setName('');
            setCity('');
            setCapacity('');
            queryClient.invalidateQueries({ queryKey: ['sedes-activas'] });
        },
        onError: (error: unknown) => {
            setMensajeExito(null);
            if (error instanceof ApiError) {
                setMensajeError(error.message || 'No se pudo crear la sede.');
            } else {
                setMensajeError('Error de conexión al crear la sede.');
            }
        },
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setMensajeError(null);
        setMensajeExito(null);

        const capacidadNum = Number(capacity);
        if (!code.trim() || !name.trim() || !city.trim() || !capacidadNum || capacidadNum <= 0) {
            setMensajeError('Completa todos los campos con una capacidad mayor a 0.');
            return;
        }

        crearSedeMutation.mutate({
            code: code.trim().toUpperCase(),
            name: name.trim(),
            city: city.trim(),
            capacity: capacidadNum,
        });
    };

    if (isLoading) return <div className="text-center py-20">Cargando sedes...</div>;

    return (
        <div className="max-w-7xl mx-auto mt-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Nuestras Sedes</h1>

            {esAdmin && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4"
                >
                    <h2 className="text-lg font-bold text-gray-900">Agregar nueva sede</h2>

                    {mensajeError && (
                        <div role="alert" className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
                            {mensajeError}
                        </div>
                    )}

                    {mensajeExito && (
                        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-md text-sm">
                            {mensajeExito}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="sede-code" className="block text-sm font-medium text-gray-700 mb-1">
                                Código
                            </label>
                            <input
                                id="sede-code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="VEN-ESE-011"
                                className={claseInputSede}
                            />
                        </div>

                        <div>
                            <label htmlFor="sede-name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre de la sede
                            </label>
                            <input
                                id="sede-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Movistar Arena"
                                className={claseInputSede}
                            />
                        </div>

                        <div>
                            <label htmlFor="sede-city" className="block text-sm font-medium text-gray-700 mb-1">
                                Ciudad
                            </label>
                            <input
                                id="sede-city"
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Bogota"
                                className={claseInputSede}
                            />
                        </div>

                        <div>
                            <label htmlFor="sede-capacity" className="block text-sm font-medium text-gray-700 mb-1">
                                Capacidad máxima
                            </label>
                            <input
                                id="sede-capacity"
                                type="number"
                                min={1}
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                placeholder="14000"
                                className={claseInputSede}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={crearSedeMutation.isPending}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-60"
                    >
                        {crearSedeMutation.isPending ? 'Guardando...' : 'Guardar sede'}
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sedes?.map((sede) => (
                    <Link
                        to={RUTAS.detalleSede(sede.code)}
                        key={sede.code}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 block hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{sede.name}</h2>
                                <p className="text-indigo-600 font-medium">{sede.city}</p>
                            </div>
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                                {sede.code}
                            </span>
                        </div>
                        <div className="border-t pt-4 mt-4">
                            <p className="text-sm text-gray-500">Capacidad máxima:</p>
                            <p className="font-bold text-gray-900">{sede.capacity} personas</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};