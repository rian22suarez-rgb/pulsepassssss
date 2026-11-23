import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { AlertaEnLinea } from '../componentes/Estados'
import { Etiqueta } from '../componentes/Tipografia'
import { mensajeDeError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'

const LoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Escribe tu usuario o correo.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
})
type DatosLogin = z.infer<typeof LoginSchema>

/*
  Login (PRD §9.8). Tras el éxito, la guarda SoloAnonimo redirige a state.desde.
  401 → "Credenciales inválidas" sin revelar si el usuario existe (FR-FE-AUTH-003).
*/
export default function Login() {
  const { iniciarSesion } = useAuth()
  const location = useLocation()
  const estado = (location.state ?? {}) as { motivo?: string; registrado?: string }
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DatosLogin>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: estado.registrado ?? '', password: '' },
  })

  const enviar = async (d: DatosLogin) => {
    setErrorServidor(null)
    try {
      await iniciarSesion(d.identifier, d.password)
    } catch (e) {
      setErrorServidor(mensajeDeError(e, 'login'))
    }
  }

  return (
    <PantallaAuth
      titulo="Bienvenido de vuelta"
      lema="Tus entradas te esperan."
      pie={<>¿No tienes cuenta? <Link to={RUTAS.registro} className="font-semibold underline underline-offset-4">Regístrate</Link></>}
    >
      {estado.motivo === 'expirada' && <AlertaEnLinea tono="info">Tu sesión expiró. Inicia sesión de nuevo para continuar.</AlertaEnLinea>}
      {estado.registrado && <AlertaEnLinea tono="exito">Cuenta creada. Ya puedes iniciar sesión.</AlertaEnLinea>}
      {errorServidor && <AlertaEnLinea>{errorServidor}</AlertaEnLinea>}
      <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-5">
        <Campo etiqueta="Usuario o correo" autoComplete="username" error={errors.identifier?.message} {...register('identifier')} />
        <Campo etiqueta="Contraseña" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <Boton type="submit" cargando={isSubmitting} className="mt-2 w-full">Ingresar</Boton>
      </form>
    </PantallaAuth>
  )
}

/** Composición compartida por Login y Registro: panel verde con lema + formulario. */
export function PantallaAuth({ titulo, lema, pie, children }: { titulo: string; lema: string; pie: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-5 lg:grid-cols-2 lg:py-16">
      <div className="fondo-rejilla relative hidden overflow-hidden rounded-tarjeta bg-bosque-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Etiqueta className="text-lima-400">PulsePass · Acceso</Etiqueta>
        <p className="font-titulo text-8xl leading-[0.85] uppercase">{lema}</p>
        <div className="flex gap-2">
          <span className="size-3 rounded-full bg-lima-400" />
          <span className="size-3 rounded-full bg-rosa-300" />
          <span className="size-3 rounded-full bg-naranja-400" />
        </div>
      </div>
      <div className="rounded-tarjeta border border-tinta/10 bg-white p-7 sm:p-10 dark:border-white/10 dark:bg-[#15151f]">
        <h1 className="text-5xl">{titulo}</h1>
        <div className="mt-8 flex flex-col gap-5">{children}</div>
        <p className="mt-8 text-sm opacity-80">{pie}</p>
      </div>
    </div>
  )
}
