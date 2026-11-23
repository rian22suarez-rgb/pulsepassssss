import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from './http'

/**
 * 400 del backend → errores por campo (PRD §11.2). GlobalExceptionHandler devuelve
 * details: { campo: mensaje } desde MethodArgumentNotValidException.
 * Devuelve true si pudo asignar al menos un campo.
 */
export function aplicarErroresServidor<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, campos: readonly Path<T>[]): boolean {
  if (!(error instanceof ApiError) || error.status !== 400) return false
  let alguno = false
  for (const [campo, mensaje] of Object.entries(error.details)) {
    if ((campos as readonly string[]).includes(campo)) {
      setError(campo as Path<T>, { type: 'server', message: mensaje })
      alguno = true
    }
  }
  return alguno
}
