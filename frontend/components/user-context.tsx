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
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null
  })

  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    if (typeof window === "undefined") return null
    const storedUser = localStorage.getItem("usuario")
    return storedUser ? JSON.parse(storedUser) : null
  })

  // 🔹 Sincronizar token con localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token)
    else localStorage.removeItem("token")
  }, [token])

  // 🔹 Sincronizar usuario con localStorage
  useEffect(() => {
    if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario))
    else localStorage.removeItem("usuario")
  }, [usuario])

  // 🔹 Logout automático entre pestañas
  useEffect(() => {
    const syncLogout = (event: StorageEvent) => {
      if (event.key === "token" && !event.newValue) {
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
    localStorage.clear()
  }

  // 🔹 Función fetch con manejo automático de errores y token
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(url, { ...options, headers })

    // 🛑 Detectar errores de autenticación o servidor
    if (response.status === 401 || response.status === 403 || response.status >= 500) {
      console.warn("Token inválido o sesión expirada. Cerrando sesión automáticamente...")
      clearAuthInfo()
      if (typeof window !== "undefined") {
        window.location.href = "/" // redirigir al login
      }
      throw new Error("Sesión expirada o error del servidor")
    }

    return response
  }

  return (
    <AuthContext.Provider value={{ token, usuario, setAuthInfo, clearAuthInfo, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
