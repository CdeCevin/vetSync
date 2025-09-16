"use client"
import React, { createContext, useContext, useState } from "react"

interface Usuario {
  id: number
  nombre_completo: string
  id_rol: number
  nombre_rol: string
  id_clinica: number
  nombre_clinica: string
}

interface AuthContextType {
  token: string | null
  usuario: Usuario | null
  setAuthInfo: (token: string, usuario: Usuario) => void
  clearAuthInfo: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  const setAuthInfo = (t: string, u: Usuario) => {
    setToken(t)
    setUsuario(u)
  }

  const clearAuthInfo = () => {
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ token, usuario, setAuthInfo, clearAuthInfo }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
