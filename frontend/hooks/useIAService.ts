"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/components/user-context"
import { ROUTES } from "@/apiRoutes"

export interface IAHistorialResponse {
  resumen_paciente: string
  analisis_general: string
  registros: {
    id: number
    relevancia: number
    fragmento_destacado: string
    razon: string
    paciente: string
    fecha: string
    diagnostico_completo: string
  }[]
}

export function useAIService() {
  const { usuario, token, fetchWithAuth } = useAuth()
  const [loadingAI, setLoadingAI] = useState(false)
  
  const idClinica = usuario?.id_clinica
  // Endpoint: localhost:3001/api/{idClinica}/IA/historial
  const baseUrl = idClinica ? `${ROUTES.base}/${idClinica}/IA` : ""

  const consultarHistorialIA = useCallback(async (consulta: string): Promise<IAHistorialResponse | null> => {
    if (!idClinica || !token) return null

    setLoadingAI(true)
    try {
      const response = await fetchWithAuth(`${baseUrl}/historial`, {
        method: "POST",
        body: JSON.stringify({ consulta }),
      })

      if (!response.ok) {
        throw new Error("Error en el análisis de IA")
      }

      return await response.json()
    } catch (error) {
      console.error("Error AI service:", error)
      throw error // Re-lanzamos para manejarlo en el componente
    } finally {
      setLoadingAI(false)
    }
  }, [idClinica, token, fetchWithAuth, baseUrl])

  return {
    consultarHistorialIA,
    loadingAI
  }
}