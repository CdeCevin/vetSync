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
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
  })

  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    if (typeof window === "undefined") return null
    const storedUser = localStorage.getItem("usuario")
    return storedUser ? JSON.parse(storedUser) : null
  })

  // Guarda cambios en sessionStorage automáticamente
  useEffect(() => {
  if (token) localStorage.setItem("token", token)
  else localStorage.removeItem("token")
  }, [token])

  useEffect(() => {
  if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario))
  else localStorage.removeItem("usuario")
  }, [usuario])
  
  useEffect(() => {
  const syncLogout = (event: StorageEvent) => {
    if (event.key === "token" && !event.newValue) {
      // Si se elimina el token desde otra pestaña
      clearAuthInfo()
    }
  }
  window.addEventListener("storage", syncLogout)
  return () => {
    window.removeEventListener("storage", syncLogout)
  }
}, [])

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