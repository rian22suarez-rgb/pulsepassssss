import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { eventosApi } from '../api/eventos';
import { venuesApi } from '../api/venues';
import { RUTAS } from '../lib/rutas';
import { ApiError } from '../lib/http';

const createEventSchema = z.object({
    eventCode: z.string().min(3, 'El código es obligatorio (mín. 3 caracteres)'),
    name: z.string().min(3, 'El nombre es obligatorio'),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    category: z.enum(['MUSIC', 'SPORTS', 'TECHNOLOGY', 'EDUCATION', 'CULTURE', 'ENTERTAINMENT']),
    eventDate: z.string().min(1, 'La fecha es obligatoria y debes pulsar Aplicar'),
    minimumAge: z.coerce.number().min(0, 'La edad no puede ser negativa'),
    venueCode: z.string().min(1, 'Debes seleccionar una sede'),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

export const AdminCrearEventoPage = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const [selectorAbierto, setSelectorAbierto] = useState(false);
    const [fechaBorrador, setFechaBorrador] = useState('');
    const [horaBorrador, setHoraBorrador] = useState('18:00');
    const [avisoFecha, setAvisoFecha] = useState<string | null>(null);

    const { data: venues, isLoading: loadingVenues } = useQuery({
        queryKey: ['venues-active'],
        queryFn: venuesApi.getActive,
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<CreateEventForm>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            eventDate: '',
            minimumAge: 0,
        },
    });

    const eventDateActual = watch('eventDate');

    const abrirSelectorFecha = () => {
        setAvisoFecha(null);
        if (eventDateActual && eventDateActual.includes('T')) {
            const [f, h] = eventDateActual.split('T');
            setFechaBorrador(f);
            setHoraBorrador(h.slice(0, 5));
        } else if (!fechaBorrador) {
            const hoy = new Date();
            const yyyy = hoy.getFullYear();
            const mm = String(hoy.getMonth() + 1).padStart(2, '0');
            const dd = String(hoy.getDate()).padStart(2, '0');
            setFechaBorrador(`${yyyy}-${mm}-${dd}`);
            setHoraBorrador('18:00');
        }
        setSelectorAbierto((prev) => !prev);
    };

    const handleAplicarFecha = () => {
        if (!fechaBorrador || !horaBorrador) {
            setAvisoFecha('Selecciona una fecha y una hora antes de pulsar Aplicar.');
            return;
        }
        const combinado = `${fechaBorrador}T${horaBorrador}`;
        setValue('eventDate', combinado, { shouldValidate: true });
        clearErrors('eventDate');
        setAvisoFecha(null);
        setSelectorAbierto(false);
    };

    const handleLimpiarFecha = () => {
        setFechaBorrador('');
        setHoraBorrador('18:00');
        setValue('eventDate', '', { shouldValidate: true });
        setAvisoFecha(null);
        setSelectorAbierto(false);
    };

    const formatearFechaAplicada = (isoLocal: string) => {
        if (!isoLocal) return 'Sin fecha aplicada';
        const d = new Date(isoLocal);
        if (Number.isNaN(d.getTime())) return isoLocal;
        return d.toLocaleString('es-CO', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const onSubmit = async (data: CreateEventForm): Promise<void> => {
        try {
            setServerError(null);
            const payload = {
                ...data,
                eventDate: new Date(data.eventDate).toISOString(),
            };

            await eventosApi.crear(payload);
            alert('Evento creado exitosamente en estado DRAFT');
            navigate(RUTAS.detalleEvento(data.eventCode));
        } catch (error) {
            if (error instanceof ApiError) {
                setServerError(error.status === 409 ? 'El código de evento ya existe.' : error.message);
            } else {
                setServerError('Error de conexión.');
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crear Nuevo Evento (Admin)</h1>
                <div className="flex items-center gap-4 text-sm">
                    <Link to={RUTAS.sedes} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Ver sedes
                    </Link>
                    <Link to={RUTAS.artistas} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Ver artistas
                    </Link>
                </div>
            </div>

            {serverError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6" role="alert">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Código del Evento (Ej. EVT-2026)
                        </label>
                        <input
                            type="text"
                            {...register('eventCode')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
                        />
                        {errors.eventCode && <p className="text-red-500 text-xs mt-1">{errors.eventCode.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nombre del Evento
                        </label>
                        <input
                            type="text"
                            {...register('name')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                    <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                        <select
                            {...register('category')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="MUSIC" className="dark:bg-gray-800 dark:text-white">Música</option>
                            <option value="SPORTS" className="dark:bg-gray-800 dark:text-white">Deportes</option>
                            <option value="TECHNOLOGY" className="dark:bg-gray-800 dark:text-white">Tecnología</option>
                            <option value="EDUCATION" className="dark:bg-gray-800 dark:text-white">Educación</option>
                            <option value="CULTURE" className="dark:bg-gray-800 dark:text-white">Cultura</option>
                            <option value="ENTERTAINMENT" className="dark:bg-gray-800 dark:text-white">Entretenimiento</option>
                        </select>
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sede</label>
                        <select
                            {...register('venueCode')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={loadingVenues}
                        >
                            <option value="" className="dark:bg-gray-800 dark:text-white">Selecciona una sede...</option>
                            {venues?.map((v) => (
                                <option key={v.code} value={v.code} className="dark:bg-gray-800 dark:text-white">
                                    {v.name} - {v.city}
                                </option>
                            ))}
                        </select>
                        {errors.venueCode && <p className="text-red-500 text-xs mt-1">{errors.venueCode.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha y Hora</label>
                        <input type="hidden" {...register('eventDate')} />

                        <div className="flex items-center justify-between gap-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <span className="text-sm truncate">
                                {eventDateActual ? formatearFechaAplicada(eventDateActual) : 'Sin fecha aplicada'}
                            </span>
                            <button
                                type="button"
                                onClick={abrirSelectorFecha}
                                className="px-3 py-1 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700 shrink-0"
                            >
                                {selectorAbierto ? 'Cerrar' : 'Elegir'}
                            </button>
                        </div>

                        {selectorAbierto && (
                            <div className="mt-2 p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 shadow-md space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                            Fecha
                                        </label>
                                        <input
                                            type="date"
                                            value={fechaBorrador}
                                            onChange={(e) => setFechaBorrador(e.target.value)}
                                            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                            Hora
                                        </label>
                                        <input
                                            type="time"
                                            value={horaBorrador}
                                            onChange={(e) => setHoraBorrador(e.target.value)}
                                            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {avisoFecha && <p className="text-xs text-red-500">{avisoFecha}</p>}

                                <div className="flex justify-end gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleLimpiarFecha}
                                        className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        Limpiar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAplicarFecha}
                                        className="px-4 py-1.5 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </div>
                        )}

                        {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Edad Mínima</label>
                        <input
                            type="number"
                            {...register('minimumAge')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {errors.minimumAge && <p className="text-red-500 text-xs mt-1">{errors.minimumAge.message}</p>}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
                    >
                        {isSubmitting ? 'Creando...' : 'Crear Evento'}
                    </button>
                </div>
            </form>
        </div>
    );
};