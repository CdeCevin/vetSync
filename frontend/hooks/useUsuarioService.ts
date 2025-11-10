// services/userService.ts
import { ROUTES } from "@/apiRoutes"
import { useAuth } from "@/components/user-context"

export interface User {
  id: number
  id_rol: number
  nombre_completo: string
  correo_electronico: string
  contraseña?: string
}

export function useUserService() {
  const { usuario, token, fetchWithAuth } = useAuth()
  const idClinica = usuario?.id_clinica

  if (!idClinica || !token) throw new Error("Faltan credenciales o clínica.")

  // Obtener todos los usuarios
  const getUsers = async (): Promise<User[]> => {
    const res = await fetchWithAuth(`${ROUTES.base}/${idClinica}/usuarios`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error("Error al obtener los usuarios.")
    return res.json()
  }

  // Crear usuario
  const createUser = async (userData: Partial<User>): Promise<User> => {
    const body = {
      nombre_completo: userData.nombre_completo,
      correo_electronico: userData.correo_electronico,
      id_rol: userData.id_rol,
      contraseña: userData.contraseña,
    }

    const res = await fetchWithAuth(`${ROUTES.base}/${idClinica}/usuarios/`, {
      method: "POST",
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Error al crear el usuario.")
    }

    return res.json()
  }

  // Actualizar usuario
  const updateUser = async (userData: Partial<User>): Promise<User> => {
    const res = await fetchWithAuth(`${ROUTES.base}/${idClinica}/usuarios/${userData.id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Error al actualizar el usuario.")
    }

    return res.json()
  }

  // Eliminar usuario
  const deleteUser = async (userId: number): Promise<any> => {
    const res = await fetchWithAuth(`${ROUTES.base}/${idClinica}/usuarios/${userId}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Error al eliminar el usuario.")
    }
    return res.json()
  }

  return { getUsers, createUser, updateUser, deleteUser }
}
