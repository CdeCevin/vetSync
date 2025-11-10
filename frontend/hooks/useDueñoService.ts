// services/userService.ts 
import { ROUTES } from "@/apiRoutes"
import { useAuth } from "@/components/user-context"

export interface Dueño {
  id: number
  nombre: string
  telefono?: string
  correo: string
  direccion?: string
}

export function useDueñoService() {
  const { usuario, fetchWithAuth } = useAuth()
  const idClinica = usuario?.id_clinica

  // Crear dueño
  const createOwner = async (data: Partial<Dueño>) => {
    if (!idClinica) throw new Error("Falta ID de clínica.")
    const res = await fetchWithAuth(`${ROUTES.base}/${idClinica}/duenos`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("No se pudo crear dueño")
    return res.json()
  }

  // Actualizar dueño
  const updateOwner = async (data: Partial<Dueño>) => {
    if (!idClinica || !data.id) throw new Error("Datos insuficientes para actualizar dueño.")
    const res = await fetchWithAuth(`${ROUTES.base}/${idClinica}/duenos/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("No se pudo actualizar dueño")
    return res.json()
  }

  // Get todos los dueños
  const getOwners = async () => {
    if (!idClinica) throw new Error("Falta ID de clínica.")
    const res = await fetchWithAuth(`${ROUTES.base}/${idClinica}/duenos`)
    if (!res.ok) throw new Error("Error al obtener la lista de dueños.")
    return res.json()
  }

  // Eliminar dueño
  const deleteOwner = async (userId: number) => {
    if (!idClinica) throw new Error("Falta ID de clínica.")
    const res = await fetchWithAuth(`${ROUTES.base}/${idClinica}/duenos/${userId}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Error al eliminar el usuario.")
    }
    return res.json()
  }

  return { createOwner, updateOwner, getOwners, deleteOwner }
}
