"use client"
import React, { createContext, useContext, useState, useEffect } from "react"

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
  // Inicializa a partir de sessionStorage
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? sessionStorage.getItem("token") : null
  })
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    if (typeof window === "undefined") return null
    const storedUser = sessionStorage.getItem("usuario") // CAMBIO AQUÍ
    return storedUser ? JSON.parse(storedUser) : null
  })

  // Guarda cambios en sessionStorage automáticamente
  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", token) // CAMBIO AQUÍ
    } else {
      sessionStorage.removeItem("token") // CAMBIO AQUÍ
    }
  }, [token])

  useEffect(() => {
    if (usuario) {
      sessionStorage.setItem("usuario", JSON.stringify(usuario)) // CAMBIO AQUÍ
    } else {
      sessionStorage.removeItem("usuario") // CAMBIO AQUÍ
    }
  }, [usuario])

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