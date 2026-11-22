import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff } from 'lucide-react'; // NUEVOS ICONOS
import { authApi } from '../api/auth';
import { RUTAS } from '../lib/rutas';
import { ApiError } from '../lib/http';

const registerSchema = z.object({
    username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
    email: z.string().email('Debe ser un correo válido'),
    firstName: z.string().min(1, 'El nombre es obligatorio'),
    lastName: z.string().min(1, 'El apellido es obligatorio'),
    birthDate: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
    password: z.string().min(12, 'La contraseña debe tener al menos 12 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegistroPage = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // ESTADO PARA EL OJO

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setServerError(null);
            await authApi.register(data);
            setIsSuccess(true);
            setTimeout(() => navigate(RUTAS.login), 2000);
        } catch (error) {
            if (error instanceof ApiError) {
                setServerError(error.status === 409 ? 'El usuario o correo ya existen.' : 'Revisa los datos ingresados.');
            } else {
                setServerError('Error de conexión.');
            }
        }
    };

    if (isSuccess) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-6 rounded-lg border border-green-200 dark:border-green-800 text-center">
                    <h2 className="text-xl font-bold mb-2">¡Registro Exitoso!</h2>
                    <p>Serás redirigido al inicio de sesión en un momento...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-[70vh] py-8">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Crear Cuenta</h2>

                {serverError && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4 text-sm text-center" role="alert">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                            <input type="text" {...register('firstName')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido</label>
                            <input type="text" {...register('lastName')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
                        <input type="text" {...register('username')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo</label>
                        <input type="email" {...register('email')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Nacimiento</label>
                        <input type="date" {...register('birthDate')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
                        {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                        {/* CONTENEDOR PARA EL OJO */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Mínimo 12 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium mt-2">
                        {isSubmitting ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    ¿Ya tienes cuenta? <Link to={RUTAS.login} className="text-indigo-600 dark:text-indigo-400 hover:underline">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};