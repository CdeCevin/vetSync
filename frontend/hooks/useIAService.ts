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

export interface ItemPrediccion {
  id: number
  nombre: string
  stock_actual: number
  stock_minimo: number
  unidad: string
  // Campos específicos
  dias_restantes?: number
  cantidad_sugerida?: number
  motivo?: string
  dias_sin_movimiento?: number
}

export interface IAPrediccionResponse {
  resumen_general: string
  metricas_clave: {
    total_criticos: number
    total_items: number
  }
  alertas_compra: ItemPrediccion[]
  stock_estancado: ItemPrediccion[]
  inventario_saludable: ItemPrediccion[]
}

export function useAIService() {
  const { usuario, token, fetchWithAuth } = useAuth()
  const [loadingAI, setLoadingAI] = useState(false)
  
  const idClinica = usuario?.id_clinica
  const baseUrl = idClinica ? `${ROUTES.base}/${idClinica}/IA` : ""

  const consultarHistorialIA = useCallback(async (consulta: string): Promise<IAHistorialResponse | null> => {
    if (!idClinica || !token) return null

    setLoadingAI(true)
    try {
      const response = await fetchWithAuth(`${baseUrl}/historial`, {
        method: "POST",
        body: JSON.stringify({ consulta }),
      })

      if (!response.ok) throw new Error("Error en el análisis de IA")
      return await response.json()
    } catch (error) {
      console.error("Error AI service:", error)
      throw error 
    } finally {
      setLoadingAI(false)
    }
  }, [idClinica, token, fetchWithAuth, baseUrl])

  const obtenerPrediccionInventario = useCallback(async (): Promise<IAPrediccionResponse | null> => {
    if (!idClinica || !token) return null

    setLoadingAI(true)
    try {
      const response = await fetchWithAuth(`${baseUrl}/prediccion`, {
        method: "GET", 
      })

      if (!response.ok) throw new Error("Error al obtener predicción de inventario")
      
      return await response.json()
    } catch (error) {
      console.error("Error AI Inventory:", error)
      throw error
    } finally {
      setLoadingAI(false)
    }
  }, [idClinica, token, fetchWithAuth, baseUrl])

  return {
    consultarHistorialIA,
    obtenerPrediccionInventario,
    loadingAI
  }
}