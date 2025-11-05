// services/userService.ts
import { ROUTES } from "@/apiRoutes"
import { useAuth } from "@/components/user-context" // ajusta la ruta según tu estructura

export interface Dueño {
  id: number
  nombre: string
  telefono?: string
  correo: string
  direccion?: string
}

// Hook de servicio que usa el contexto
export function useDueñoService() {
  const { usuario, token } = useAuth()
  const idClinica = usuario?.id_clinica

  const createOwner = async (data: Partial<Dueño>) => {
    const res = await fetch(`${ROUTES.base}/${idClinica}/duenos`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("No se pudo crear dueño")
    return res.json()
  }

  // ✅ Actualizar dueño
  const updateOwner = async (data: Partial<Dueño>) => {
    const res = await fetch(`${ROUTES.base}/${idClinica}/duenos/${data.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("No se pudo actualizar dueño")
    return res.json()
  }

  const getOwners = async () => {
      if (!idClinica || !token) throw new Error("Faltan credenciales.")
      const res = await fetch(`${ROUTES.base}/${idClinica}/duenos`, {
          headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      })
      if (!res.ok) throw new Error("Error al obtener la lista de dueños.")
      return res.json()
      }
    
  const deleteOwner = async (userId: number): Promise<any> => {
    if (!idClinica || !token) throw new Error("Faltan credenciales o clínica.")
    const res = await fetch(`${ROUTES.base}/${idClinica}/duenos/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Error al eliminar el usuario.")
    }
    return res.json()
  }
  
  return { createOwner, updateOwner, getOwners, deleteOwner }
}
