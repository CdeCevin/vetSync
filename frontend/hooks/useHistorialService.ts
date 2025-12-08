"use client"

import { useState, useCallback, useMemo } from "react"
import { useAuth } from "@/components/user-context"
import { ROUTES } from "@/apiRoutes" 
import { HistorialMedico, Procedimiento } from "../components/Historial/historial"

export function useHistorialService() {
  const { usuario, token, fetchWithAuth } = useAuth()
  const [historiales, setHistoriales] = useState<HistorialMedico[]>([])
  const [loading, setLoading] = useState(false)
  const idClinica = usuario?.id_clinica
  const baseUrl = idClinica ? `${ROUTES.base}/${idClinica}/historial` : ""
  const procUrl = idClinica ? `${ROUTES.base}/${idClinica}/procedimientos` : ""
  
  //historial
  const cargarHistoriales = useCallback(async (query = "") => {
    if (!idClinica || !token) return

    setLoading(true)
    try {
      const url = query 
        ? `${baseUrl}/buscar?q=${encodeURIComponent(query)}` 
        : `${baseUrl}/`

      const response = await fetchWithAuth(url, { cache: "no-store" })
      
      if (!response.ok) throw new Error("Error al cargar historiales")
      
      const data = await response.json()
      setHistoriales(data)
    } catch (error) {
      console.error("Error loading history:", error)
    } finally {
      setLoading(false)
    }
  }, [idClinica, token, fetchWithAuth, baseUrl])

  const crearHistorial = useCallback(async (data: any) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const response = await fetchWithAuth(baseUrl, {
      method: "POST",
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al crear historial")
    }
    
    await cargarHistoriales()
    return response.json()
  }, [idClinica, fetchWithAuth, baseUrl, cargarHistoriales])

  const editarHistorial = useCallback(async (id: number, data: any) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const response = await fetchWithAuth(`${baseUrl}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    })

    if (!response.ok) throw new Error("Error al actualizar historial")
    
    await cargarHistoriales()
  }, [idClinica, fetchWithAuth, baseUrl, cargarHistoriales])

  const eliminarHistorial = useCallback(async (id: number) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const response = await fetchWithAuth(`${baseUrl}/${id}`, { method: "DELETE" })

    if (!response.ok) throw new Error("No se pudo eliminar el historial")
    
    await cargarHistoriales()
  }, [idClinica, fetchWithAuth, baseUrl, cargarHistoriales])


  //Procedimientos
  const agregarProcedimiento = useCallback(async (data: { id_historial_medico: number, nombre_procedimiento: string, notas?: string }) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const response = await fetchWithAuth(procUrl, {
      method: "POST",
      body: JSON.stringify(data)
    })

    if (!response.ok) throw new Error("Error al agregar procedimiento")
    await cargarHistoriales() 
  }, [idClinica, fetchWithAuth, procUrl, cargarHistoriales])

  const editarProcedimiento = useCallback(async (id: number, data: { nombre_procedimiento?: string, notas?: string }) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const response = await fetchWithAuth(`${procUrl}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    })

    if (!response.ok) throw new Error("Error al editar procedimiento")
    await cargarHistoriales()
  }, [idClinica, fetchWithAuth, procUrl, cargarHistoriales])

  const eliminarProcedimiento = useCallback(async (id: number) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const response = await fetchWithAuth(`${procUrl}/${id}`, { method: "DELETE" })

    if (!response.ok) throw new Error("Error al eliminar procedimiento")
    await cargarHistoriales()
  }, [idClinica, fetchWithAuth, procUrl, cargarHistoriales])

  return useMemo(() => ({
    historiales,
    loading,
    cargarHistoriales,
    crearHistorial,
    editarHistorial,
    eliminarHistorial,
    agregarProcedimiento,
    editarProcedimiento,
    eliminarProcedimiento
  }), [
    historiales,
    loading,
    cargarHistoriales,
    crearHistorial,
    editarHistorial,
    eliminarHistorial,
    agregarProcedimiento,
    editarProcedimiento,
    eliminarProcedimiento
  ])
}