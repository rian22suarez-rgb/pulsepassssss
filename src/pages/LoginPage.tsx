import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router';
import { Eye, EyeOff } from 'lucide-react'; // NUEVOS ICONOS
import { useAuth } from '../context/AuthContext';
import { RUTAS } from '../lib/rutas';
import { ApiError } from '../lib/http';

const loginSchema = z.object({
    identifier: z.string().min(1, 'El correo o usuario es obligatorio'),
    password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false); // ESTADO PARA EL OJO

    const from = location.state?.from?.pathname || RUTAS.inicio;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setServerError(null);
            await login(data);
            navigate(from, { replace: true });
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                setServerError('Credenciales inválidas. Verifica tus datos.');
            } else {
                setServerError('Ocurrió un error inesperado. Intenta de nuevo más tarde.');
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                    Iniciar Sesión
                </h2>

                {serverError && (
                    <div
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4 text-sm text-center"
                        role="alert"
                        aria-live="polite"
                    >
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Correo o Usuario
                        </label>
                        <input
                            id="identifier"
                            type="text"
                            {...register('identifier')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="ejemplo@pulsepass.com"
                            aria-invalid={errors.identifier ? 'true' : 'false'}
                        />
                        {errors.identifier && (
                            <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Contraseña
                        </label>
                        {/* CONTENEDOR RELATIVO PARA EL INPUT Y EL OJO */}
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'} // CAMBIA ENTRE TEXTO Y PUNTOS
                                {...register('password')}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="••••••••"
                                aria-invalid={errors.password ? 'true' : 'false'}
                            />
                            {/* BOTÓN DEL OJO */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-2"
                    >
                        {isSubmitting ? 'Iniciando sesión...' : 'Entrar'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    ¿No tienes cuenta?{' '}
                    <Link to={RUTAS.registro} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
};