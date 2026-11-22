import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { RUTAS } from '../lib/rutas';

interface Props {
    rolesPermitidos: string[];
}

export const RutaPorRol = ({ rolesPermitidos }: Props) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        // Si no está logueado, lo mandamos al login guardando a dónde quería ir
        return <Navigate to={RUTAS.login} replace />;
    }

    // Verificamos si el usuario tiene alguno de los roles permitidos
    const tienePermiso = user.roles.some((rol) => rolesPermitidos.includes(rol));

    if (!tienePermiso) {
        // FR-FE-GEN-002: Página 403 (No autorizado)
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold text-red-600 mb-4">403 - Acceso Denegado</h2>
                <p className="text-gray-600 mb-6">No tienes los permisos necesarios para ver esta página.</p>
                <a href={RUTAS.catalogo} className="text-indigo-600 hover:underline">
                    Volver al catálogo
                </a>
            </div>
        );
    }

    // Si tiene permiso, renderiza la página hija
    return <Outlet />;
};