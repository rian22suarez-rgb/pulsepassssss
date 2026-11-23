import { describe, expect, it, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge, TONO_ESTADO_EVENTO, TONO_ESTADO_TICKET } from '../componentes/Badge'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Modal } from '../componentes/Modal'
import { EventStatusSchema, TicketStatusSchema } from '../lib/esquemas'

afterEach(() => vi.restoreAllMocks())

describe('componentes base', () => {
  it('cada estado de evento y ticket tiene tono asignado (mapa completo)', () => {
    EventStatusSchema.options.forEach((s) => expect(TONO_ESTADO_EVENTO[s]).toBeTruthy())
    TicketStatusSchema.options.forEach((s) => expect(TONO_ESTADO_TICKET[s]).toBeTruthy())
  })

  it('Badge renderiza su contenido', () => {
    render(<Badge tono="lima">Publicado</Badge>)
    expect(screen.getByText('Publicado')).toBeInTheDocument()
  })

  it('Boton en carga queda deshabilitado y con aria-busy', () => {
    render(<Boton cargando>Guardar</Boton>)
    const b = screen.getByRole('button', { name: 'Guardar' })
    expect(b).toBeDisabled()
    expect(b).toHaveAttribute('aria-busy', 'true')
  })

  it('Campo asocia label, aria-invalid y mensaje de error', () => {
    render(<Campo etiqueta="Correo" error="Correo inválido" />)
    const input = screen.getByLabelText('Correo')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Correo inválido')
  })

  it('Modal se cierra con el botón Cerrar', async () => {
    const onCerrar = vi.fn()
    render(<Modal abierto titulo="Confirmar" onCerrar={onCerrar}>Hola</Modal>)
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar', hidden: true }))
    expect(onCerrar).toHaveBeenCalled()
  })
})
