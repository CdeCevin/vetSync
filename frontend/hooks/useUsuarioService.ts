// services/userService.ts
import { ROUTES } from "@/apiRoutes"
import { useAuth } from "@/components/user-context" // ajusta la ruta según tu estructura

export interface User {
  id: number
  id_rol: number
  nombre_completo: string
  correo_electronico: string
  contraseña?: string
}

// Hook de servicio que usa el contexto
export function useUserService() {
  const { usuario, token } = useAuth()
  const idClinica = usuario?.id_clinica

  // 🟢 Obtener todos los usuarios
  const getUsers = async (): Promise<User[]> => {
    if (!idClinica || !token) throw new Error("Faltan credenciales o clínica.")
    const res = await fetch(`${ROUTES.base}/${idClinica}/usuarios`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error("Error al obtener los usuarios.")
    return res.json()
  }
  
  // 🟢 Crear usuario
  const createUser = async (userData: Partial<User>): Promise<User> => {
    if (!idClinica || !token) throw new Error("Faltan credenciales o clínica.")
    const body = {
      nombre_completo: userData.nombre_completo,
      correo_electronico: userData.correo_electronico,
      id_rol: userData.id_rol,
      contraseña: userData.contraseña,
    }

    const res = await fetch(`${ROUTES.base}/${idClinica}/usuarios/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Error al crear el usuario.")
    }

    return res.json()
  }

  // 🟢 Actualizar usuario
  const updateUser = async (userData: Partial<User>): Promise<User> => {
    if (!idClinica || !token) throw new Error("Faltan credenciales o clínica.")
    const res = await fetch(`${ROUTES.base}/${idClinica}/usuarios/${userData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Error al actualizar el usuario.")
    }

    return res.json()
  }

  // 🟢 Eliminar usuario
  const deleteUser = async (userId: number): Promise<any> => {
    if (!idClinica || !token) throw new Error("Faltan credenciales o clínica.")
    const res = await fetch(`${ROUTES.base}/${idClinica}/usuarios/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Error al eliminar el usuario.")
    }
    return res.json()
  }

  return { getUsers, createUser, updateUser, deleteUser }
}
