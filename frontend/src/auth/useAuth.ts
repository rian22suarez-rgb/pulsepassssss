import { use } from 'react'
import { AuthContext, type ValorAuth } from './AuthContext'

export function useAuth(): ValorAuth {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
