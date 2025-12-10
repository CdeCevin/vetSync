"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/components/user-context"
import { ROUTES } from "@/apiRoutes" 

export interface LogEntry {
  id: number
  accion: string
  entidad: string
  id_entidad: number
  detalles: string 
  fecha: string
  usuario: string
  correo_electronico: string
  rol: string
}

export function useLogService() {
  const { usuario, token, fetchWithAuth } = useAuth()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)

  const idClinica = usuario?.id_clinica
  const baseUrl = idClinica ? `${ROUTES.base}/${idClinica}/verLogs` : ""

  const getLogs = useCallback(async () => {
    if (!idClinica || !token) return

    setLoading(true)
    try {
      const response = await fetchWithAuth(baseUrl, {
        cache: "no-store",
      })
      
      if (!response.ok) throw new Error("Error al cargar los logs")
      
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error("Error loading logs:", error)
    } finally {
      setLoading(false)
    }
  }, [idClinica, token, fetchWithAuth, baseUrl])

  return {
    logs,
    loading,
    getLogs
  }
}