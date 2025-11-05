// services/usePacienteService.ts
import { useAuth } from "@/components/user-context"
import { ROUTES } from "@/apiRoutes"
import { useMemo } from "react"

// --- Interfaces ---
export interface PacienteEnLista {
  id: number
  nombre: string
  raza: string
  dueño: { nombre: string }
}

export interface Mascota {
  id: number
  nombre: string
  especie: string
  raza: string
  color: string
  edad: number
  peso: string
  numero_microchip: string | null
  activo: 1 | 0
  id_dueño: number
}

export interface Dueño {
  id: number
  nombre: string
  telefono?: string
  correo?: string
  direccion?: string
}

export interface HistorialMedico {
  id: number
  fecha_visita: string
  diagnostico: string
  notas: string | null
  id_usuario: number
}

export interface PacienteDetallado {
  mascota: Mascota
  dueño: Dueño
  historial: HistorialMedico[]
}

export function usePacienteService() {
  const { usuario, token } = useAuth()
  const idClinica = usuario?.id_clinica

  const baseUrl = `${ROUTES.base}/${idClinica}/Pacientes`

  return useMemo(() => {
    if (!idClinica || !token) throw new Error("Faltan credenciales.")

    // ✅ Listar pacientes
    const getPacientes = async (q = "") => {
        const res = await fetch(`${baseUrl}/buscar?q=${encodeURIComponent(q)}`, {
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        cache: "no-store",
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error("❌ Error en GET pacientes:", errText)
        throw new Error(`Error al obtener pacientes: ${res.status}`)
      }

      return res.json()
    }

    // ✅ Obtener detalles de un paciente
    const getPacienteDetalle = async (id: number): Promise<PacienteDetallado> => {
      const res = await fetch(`${baseUrl}/${id}`, {
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
      })
      if (!res.ok) throw new Error("Error al cargar detalles del paciente.")
      return res.json()
    }

    // ✅ Crear paciente
    const createPaciente = async (data: any): Promise<PacienteDetallado> => {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Error al crear paciente.")
      }
      return res.json()
    }

    // ✅ Actualizar paciente
    const updatePaciente = async (id: number, data: any): Promise<PacienteDetallado> => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Error al actualizar paciente.")
      }
      return res.json()
    }

    // ✅ Eliminar paciente
    const deletePaciente = async (id: number): Promise<void> => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Error al eliminar paciente.")
      }
    }

    // ✅ Crear dueño
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
    const updateOwner = async (idDueño: number, data: Partial<Dueño>) => {
      const res = await fetch(`${ROUTES.base}/${idClinica}/duenos/${idDueño}`, {
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

    return { getPacientes, getPacienteDetalle, createPaciente, updatePaciente, deletePaciente, createOwner, updateOwner, getOwners }
  }, [idClinica, token])
}
