import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { useRegistrarUsuario } from '../api/consultas'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { AlertaEnLinea } from '../componentes/Estados'
import { mensajeDeError } from '../lib/errores'
import { aplicarErroresServidor } from '../lib/formularios'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import { PantallaAuth } from './Login'

/*
  Registro (PRD §9.9). Validación de forma en cliente (zod) para dar feedback rápido;
  las reglas de negocio (duplicados, edad) las decide el backend.
  GAP-07: el registro no emite token → se redirige a /login con aviso.
*/
const hoy = () => new Date().toISOString().slice(0, 10)

const RegistroSchema = z
  .object({
    username: z.string().trim().min(3, 'Mínimo 3 caracteres.').max(50, 'Máximo 50 caracteres.').regex(/^[a-zA-Z0-9._-]+$/, 'Usa solo letras, números, punto, guion o guion bajo.'),
    email: z.email('Escribe un correo válido.').max(100),
    firstName: z.string().trim().min(1, 'Escribe tu nombre.').max(100),
    lastName: z.string().trim().min(1, 'Escribe tu apellido.').max(100),
    birthDate: z.string().min(1, 'Indica tu fecha de nacimiento.').refine((v) => v < hoy(), 'La fecha debe ser anterior a hoy.'),
    phone: z.string().trim().max(30).optional(),
    city: z.string().trim().max(100).optional(),
    password: z.string().min(12, 'La contraseña debe tener al menos 12 caracteres.'),
    confirmar: z.string(),
  })
  .refine((d) => d.password === d.confirmar, { path: ['confirmar'], message: 'Las contraseñas no coinciden.' })

type DatosRegistro = z.infer<typeof RegistroSchema>
const CAMPOS = ['username', 'email', 'firstName', 'lastName', 'birthDate', 'phone', 'city', 'password'] as const

export default function Registro() {
  const navigate = useNavigate()
  const registro = useRegistrarUsuario()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<DatosRegistro>({ resolver: zodResolver(RegistroSchema) })

  const enviar = ({ confirmar: _c, phone, city, ...d }: DatosRegistro) => {
    registro.mutate(
      { ...d, phone: phone || undefined, city: city || undefined },
      {
        onSuccess: (u) => void navigate(RUTAS.login, { state: { registrado: u.username } }),
        onError: (e) => aplicarErroresServidor(e, setError, CAMPOS),
      },
    )
  }

  const errorGeneral =
    registro.isError && !(registro.error instanceof ApiError && registro.error.status === 400 && Object.keys(registro.error.details).length > 0)
      ? registro.error instanceof ApiError && registro.error.status === 409
        ? 'Ya existe una cuenta con ese usuario o correo.'
        : mensajeDeError(registro.error)
      : null

  return (
    <PantallaAuth
      titulo="Crea tu cuenta"
      lema="Tu próximo plan empieza aquí."
      pie={<>¿Ya tienes cuenta? <Link to={RUTAS.login} className="font-semibold underline underline-offset-4">Inicia sesión</Link></>}
    >
      {errorGeneral && <AlertaEnLinea>{errorGeneral}</AlertaEnLinea>}
      <form onSubmit={handleSubmit(enviar)} noValidate className="grid gap-5 sm:grid-cols-2">
        <Campo etiqueta="Nombre" autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
        <Campo etiqueta="Apellido" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
        <Campo etiqueta="Usuario" autoComplete="username" error={errors.username?.message} {...register('username')} />
        <Campo etiqueta="Correo" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Campo etiqueta="Fecha de nacimiento" type="date" max={hoy()} error={errors.birthDate?.message} {...register('birthDate')} />
        <Campo etiqueta="Ciudad (opcional)" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
        <Campo etiqueta="Teléfono (opcional)" type="tel" autoComplete="tel" error={errors.phone?.message} contenedor="sm:col-span-2" {...register('phone')} />
        <Campo etiqueta="Contraseña" type="password" autoComplete="new-password" ayuda="Mínimo 12 caracteres." error={errors.password?.message} {...register('password')} />
        <Campo etiqueta="Confirmar contraseña" type="password" autoComplete="new-password" error={errors.confirmar?.message} {...register('confirmar')} />
        <Boton type="submit" cargando={registro.isPending} className="w-full sm:col-span-2">Crear cuenta</Boton>
      </form>
    </PantallaAuth>
  )
}
