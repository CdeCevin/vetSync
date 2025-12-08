"use client"

import { useState, useCallback, useMemo } from "react"
import { useAuth } from "@/components/user-context"
import { ROUTES } from "@/apiRoutes" 
import { Tratamiento } from "@/components/Tratamientos/tratamiento"

export function useTratamientoService() {
  const { usuario, token, fetchWithAuth } = useAuth()
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [loading, setLoading] = useState(false)

  const idClinica = usuario?.id_clinica
  const baseUrl = idClinica ? `${ROUTES.base}/${idClinica}/tratamientos` : ""

  const cargarTratamientos = useCallback(async () => {
    if (!idClinica || !token) return

    setLoading(true)
    try {
      const response = await fetchWithAuth(baseUrl, {
        cache: "no-store",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
      })
      
      if (!response.ok) {
          throw new Error(`Error al cargar: ${response.status}`)
      }
      
      const data = await response.json()
      const tratamientosFormateados = data.map((t: any) => ({
        ...t,
        medicamento: t.medicamento || t.nombre_medicamento || t.producto?.nombre || "Sin asignar"
      }))

      setTratamientos(tratamientosFormateados)
    } catch (error) {
      console.error("Error loading tratamientos:", error)
    } finally {
      setLoading(false)
    }
  }, [idClinica, token, fetchWithAuth, baseUrl])

  const crearTratamiento = useCallback(async (data: Partial<Tratamiento>) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    // mapeo de datos
    const payload = {
        id_medicamento: Number(data.medicamentoId),
        dosis: data.dosis,
        cantidad: 1, 
        instrucciones: data.instrucciones,
        duracion_dias: Number(data.duracionDias),
        notas: data.notas || "",
        id_paciente: Number(data.pacienteId),
        prescripto_por: Number(usuario?.id)
    }
    if (!payload.id_medicamento || payload.id_medicamento === 0) {
        throw new Error("El ID del medicamento es inválido (0 o null).")
    }

    const response = await fetchWithAuth(baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al crear tratamiento")
    }
    
    await cargarTratamientos()
  }, [idClinica, fetchWithAuth, baseUrl, cargarTratamientos, usuario, token])

  const actualizarTratamiento = useCallback(async (id: number, data: Partial<Tratamiento>) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const payload: any = {}
    
    if (data.medicamentoId) payload.id_medicamento = Number(data.medicamentoId)
    if (data.dosis) payload.dosis = data.dosis
    if (data.instrucciones) payload.instrucciones = data.instrucciones
    if (data.duracionDias) payload.duracion_dias = Number(data.duracionDias)
    if (data.notas) payload.notas = data.notas

    const response = await fetchWithAuth(`${baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
        if (data.estado === 'Cancelado') {
             await eliminarTratamiento(id);
             return;
        }
        const errText = await response.text()
        console.error("Error Backend (PUT):", errText)
        throw new Error("Error al actualizar tratamiento")
    }
    await cargarTratamientos()
  }, [idClinica, fetchWithAuth, baseUrl, cargarTratamientos, token])

  const eliminarTratamiento = useCallback(async (id: number) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const response = await fetchWithAuth(`${baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "No se pudo eliminar el tratamiento")
    }
    
    await cargarTratamientos()
  }, [idClinica, fetchWithAuth, baseUrl, cargarTratamientos, token])

  return useMemo(() => ({
    tratamientos, 
    loading, 
    cargarTratamientos, 
    crearTratamiento, 
    actualizarTratamiento, 
    eliminarTratamiento
  }), [
    tratamientos, 
    loading, 
    cargarTratamientos, 
    crearTratamiento, 
    actualizarTratamiento, 
    eliminarTratamiento
  ])
}