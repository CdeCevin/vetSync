"use client"

import { useState, useCallback, useMemo } from "react"
import { useAuth } from "@/components/user-context"
import { ROUTES } from "@/apiRoutes"

// Admin
export interface ActividadReciente {
  accion: string
  entidad: string
  detalles: string
  nombre_completo: string
  nombre_rol: string
  creado_en: string
  tiempo_transcurrido: string
}

export interface AdminDashboardData {
  totalUsuarios: number
  ultimosCambios: number
  actividadReciente: ActividadReciente[]
}

// Veterinario
export interface ProximaCita {
  fecha_cita: string
  paciente: string
  dueno: string
  estado: string
}

export interface VetDashboardData {
  citasHoy: {
    total: number
    pendientes: string | number
    completadas: string | number
  }
  totalPacientes: number
  stockCritico: number
  proximasCitas: ProximaCita[]
}

// Recepcionista
export interface PacienteReciente {
  nombre: string
  especie: string
  raza: string
  dueno: string
  creado_en: string
}

export interface RecepDashboardData {
  citasHoy: {
    total: number
    completadas: string | number
  }
  alertasStock: number
  pacientesRecientes: PacienteReciente[]
}

export function useDashboardService() {
  const { usuario, token, fetchWithAuth } = useAuth()
  
  // estados internos
  const [loading, setLoading] = useState(false)
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null)
  const [vetData, setVetData] = useState<VetDashboardData | null>(null)
  const [receptionData, setReceptionData] = useState<RecepDashboardData | null>(null)

  const idClinica = usuario?.id_clinica
  const baseUrl = idClinica ? `${ROUTES.base}/${idClinica}` : ""

  // Cargar Dashboard Admin
  const cargarAdminData = useCallback(async () => {
    if (!idClinica || !token) return

    setLoading(true)
    try {
      const response = await fetchWithAuth(`${baseUrl}/adminDashboard`, {
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Error al cargar dashboard admin")

      const data = await response.json()
      setAdminData(data)
    } catch (error) {
      console.error("Error loading admin dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [idClinica, token, fetchWithAuth, baseUrl])

  // Cargar Dashboard Veterinario
  const cargarVetData = useCallback(async () => {
    if (!idClinica || !token) return

    setLoading(true)
    try {
      const response = await fetchWithAuth(`${baseUrl}/vetDashboard`, {
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Error al cargar dashboard veterinario")

      const data = await response.json()
      setVetData(data)
    } catch (error) {
      console.error("Error loading vet dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [idClinica, token, fetchWithAuth, baseUrl])

  // Cargar Dashboard Recepcionista
  const cargarReceptionData = useCallback(async () => {
    if (!idClinica || !token) return

    setLoading(true)
    try {
      const response = await fetchWithAuth(`${baseUrl}/recepDashboard`, {
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Error al cargar dashboard recepcionista")

      const data = await response.json()
      setReceptionData(data)
    } catch (error) {
      console.error("Error loading reception dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [idClinica, token, fetchWithAuth, baseUrl])

  return useMemo(() => ({
    loading,
    adminData,
    vetData,
    receptionData,
    cargarAdminData,
    cargarVetData,
    cargarReceptionData
  }), [
    loading,
    adminData,
    vetData,
    receptionData,
    cargarAdminData,
    cargarVetData,
    cargarReceptionData
  ])
}