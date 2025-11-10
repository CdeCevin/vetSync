// services/useCitaService.ts
import { useAuth } from "@/components/user-context"
import { ROUTES } from "@/apiRoutes"

export interface Cita {
  id: number
  id_paciente: number
  id_usuario: number
  fecha_cita: string
  duracion_minutos: number
  motivo: string
  tipo_cita: string
  notas?: string
  estado: "programada" | "en_progreso" | "completada" | "cancelada" | "no_asistio"
}

export interface StatsHoy {
  total: number
  completadas: string
  pendientes: string
}

export function useCitaService() {
  const { usuario, token, fetchWithAuth } = useAuth()
  const idClinica = usuario?.id_clinica

  if (!idClinica || !token) throw new Error("Faltan credenciales.")

  const baseUrl = `${ROUTES.base}/${idClinica}/Citas`

  //  Listar todas las citas
  const getCitas = async (): Promise<Cita[]> => {
    const res = await fetchWithAuth(baseUrl, {
      method: "GET",
      cache: "no-store",
    })
    if (!res.ok) throw new Error("Error al obtener citas.")
    return res.json()
  }

  // Crear una cita
  const createCita = async (data: Omit<Cita, "id" | "estado">) => {
    const res = await fetchWithAuth(baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Error al crear cita.")
    return res.json()
  }

  // Editar cita
  const updateCita = async (id: number, data: Partial<Cita>) => {
    const res = await fetchWithAuth(`${baseUrl}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Error al actualizar cita.")
    return res.json()
  }

  // Eliminar cita
  const deleteCita = async (id: number) => {
    const res = await fetchWithAuth(`${baseUrl}/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Error al eliminar cita.")
    return res.json()
  }

  // Estadísticas del día
  const getStatsHoy = async (): Promise<StatsHoy> => {
    const res = await fetchWithAuth(`${baseUrl}/statsHoy`)
    if (!res.ok) throw new Error("Error al obtener estadísticas del día.")
    return res.json()
  }

  // Cambiar estado de la cita
  const patchEstadoCita = async (id: number, estado: Cita["estado"]) => {
    const res = await fetchWithAuth(`${baseUrl}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    })
    if (!res.ok) throw new Error("Error al actualizar el estado de la cita.")
    return res.json()
  }

  return { getCitas, createCita, updateCita, deleteCita, getStatsHoy, patchEstadoCita }
}
