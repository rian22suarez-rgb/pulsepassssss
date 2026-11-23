import type { Ticket } from '../lib/esquemas'
import { mensajeDeError } from '../lib/errores'
import { useCancelarTicket } from '../api/consultas'
import { Boton } from './Boton'
import { AlertaEnLinea } from './Estados'
import { Modal } from './Modal'
import { useAviso } from './Aviso'

/** Confirmación de cancelación (FR-FE-TKT-005). El 409 del backend (regla de negocio) se muestra en el modal. */
export function ModalCancelar({ ticket, onCerrar }: { ticket: Ticket | null; onCerrar: () => void }) {
  const cancelar = useCancelarTicket()
  const avisar = useAviso()
  const cerrar = () => {
    cancelar.reset()
    onCerrar()
  }
  return (
    <Modal
      abierto={!!ticket}
      titulo="Cancelar entrada"
      onCerrar={cerrar}
      pie={
        <>
          <Boton variante="fantasma" punto={false} onClick={cerrar}>Conservar</Boton>
          <Boton
            variante="peligro"
            cargando={cancelar.isPending}
            onClick={() =>
              ticket &&
              cancelar.mutate(ticket.ticketCode, {
                onSuccess: () => {
                  avisar('exito', 'Entrada cancelada.')
                  cerrar()
                },
              })
            }
          >
            Cancelar entrada
          </Boton>
        </>
      }
    >
      {ticket && (
        <p>
          Vas a cancelar la entrada <strong className="font-mono">{ticket.ticketCode}</strong> para <strong>{ticket.eventName ?? ticket.eventCode}</strong>. Esta acción no
          se puede deshacer.
        </p>
      )}
      {cancelar.isError && <div className="mt-4"><AlertaEnLinea>{mensajeDeError(cancelar.error)}</AlertaEnLinea></div>}
    </Modal>
  )
}
