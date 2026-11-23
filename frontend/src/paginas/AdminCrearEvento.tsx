import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { useCrearEvento, useSedesActivas } from '../api/consultas'
import { Boton } from '../componentes/Boton'
import { AreaTexto, Campo, Selector } from '../componentes/Campo'
import { AlertaEnLinea } from '../componentes/Estados'
import { useAviso } from '../componentes/Aviso'
import { Pagina } from '../componentes/Layout'
import { EncabezadoSeccion } from '../componentes/Tipografia'
import { recordarEventoAdmin } from '../lib/almacen'
import { mensajeDeError } from '../lib/errores'
import { EventCategorySchema } from '../lib/esquemas'
import { aplicarErroresServidor } from '../lib/formularios'
import { ApiError } from '../lib/http'
import { NOMBRE_CATEGORIA } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

const CrearSchema = z.object({
  eventCode: z.string().trim().min(3, 'Mínimo 3 caracteres.').max(50).regex(/^[A-Z0-9-]+$/, 'Usa MAYÚSCULAS, números y guiones (ej. CMF-2026).'),
  name: z.string().trim().min(3, 'Mínimo 3 caracteres.').max(150),
  description: z.string().trim().max(2000).optional(),
  category: EventCategorySchema,
  // datetime-local entrega "YYYY-MM-DDTHH:mm"; el backend espera LocalDateTime con segundos.
  eventDate: z.string().min(1, 'Indica fecha y hora.'),
  minimumAge: z.coerce.number<string>().int('Debe ser un número entero.').min(0, 'No puede ser negativa.').max(99),
  venueCode: z.string().min(1, 'Elige una sede.'),
})
type DatosCrear = z.input<typeof CrearSchema>
type DatosCrearSalida = z.output<typeof CrearSchema>
const CAMPOS = ['eventCode', 'name', 'description', 'category', 'eventDate', 'minimumAge', 'venueCode'] as const

/** Crear evento (PRD §9.17, FR-FE-ADM-001/002). El evento nace en DRAFT según la regla del backend. */
export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const avisar = useAviso()
  const sedes = useSedesActivas()
  const crear = useCrearEvento()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<DatosCrear, unknown, DatosCrearSalida>({
    resolver: zodResolver(CrearSchema),
    defaultValues: { category: 'MUSIC', minimumAge: '0', venueCode: '' },
  })

  const enviar = (d: DatosCrearSalida) => {
    crear.mutate(
      { ...d, description: d.description || undefined, eventDate: d.eventDate.length === 16 ? `${d.eventDate}:00` : d.eventDate },
      {
        onSuccess: (ev) => {
          recordarEventoAdmin(ev.eventCode)
          avisar('exito', `Evento ${ev.eventCode} creado como borrador.`)
          void navigate(RUTAS.adminEvento(ev.eventCode))
        },
        onError: (e) => aplicarErroresServidor(e, setError, CAMPOS),
      },
    )
  }

  const errorGeneral =
    crear.isError && !(crear.error instanceof ApiError && crear.error.status === 400 && Object.keys(crear.error.details).length > 0)
      ? mensajeDeError(crear.error)
      : null

  return (
    <Pagina className="max-w-3xl">
      <Link to={RUTAS.adminEventos} className="font-mono text-xs tracking-widest uppercase opacity-70 hover:opacity-100">← Administrar eventos</Link>
      <EncabezadoSeccion className="mt-4" nivel={1} etiqueta="Admin" titulo="Nuevo evento" descripcion="Se crea como borrador. Podrás publicarlo y asociar artistas después." />

      <form onSubmit={handleSubmit(enviar)} noValidate className="mt-10 grid gap-5 rounded-tarjeta border border-tinta/10 bg-white p-6 sm:grid-cols-2 sm:p-8 dark:border-white/10 dark:bg-[#15151f]">
        {errorGeneral && <div className="sm:col-span-2"><AlertaEnLinea>{errorGeneral}</AlertaEnLinea></div>}
        <Campo etiqueta="Código del evento" placeholder="CMF-2026" className="font-mono uppercase" error={errors.eventCode?.message} {...register('eventCode', { setValueAs: (v: string) => v.toUpperCase() })} />
        <Selector etiqueta="Categoría" error={errors.category?.message} {...register('category')}>
          {EventCategorySchema.options.map((c) => <option key={c} value={c}>{NOMBRE_CATEGORIA[c]}</option>)}
        </Selector>
        <Campo etiqueta="Nombre" contenedor="sm:col-span-2" error={errors.name?.message} {...register('name')} />
        <AreaTexto etiqueta="Descripción (opcional)" contenedor="sm:col-span-2" error={errors.description?.message} {...register('description')} />
        <Campo etiqueta="Fecha y hora" type="datetime-local" error={errors.eventDate?.message} {...register('eventDate')} />
        <Campo etiqueta="Edad mínima" type="number" inputMode="numeric" min={0} max={99} error={errors.minimumAge?.message} {...register('minimumAge')} />
        <Selector
          etiqueta="Sede"
          contenedor="sm:col-span-2"
          disabled={sedes.isPending}
          error={errors.venueCode?.message ?? (sedes.isError ? 'No pudimos cargar las sedes.' : undefined)}
          {...register('venueCode')}
        >
          <option value="">{sedes.isPending ? 'Cargando sedes…' : 'Elige una sede'}</option>
          {sedes.data?.map((s) => <option key={s.code} value={s.code}>{s.name} · {s.city} ({s.capacity.toLocaleString('es-CO')})</option>)}
        </Selector>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <Boton type="submit" cargando={crear.isPending}>Crear evento</Boton>
          <Link to={RUTAS.adminEventos} className="inline-flex h-12 items-center px-4 font-semibold underline-offset-4 hover:underline">Cancelar</Link>
        </div>
      </form>
    </Pagina>
  )
}
