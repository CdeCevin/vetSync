// services/usePacienteService.ts
import { useAuth } from "@/components/user-context"
import { ROUTES } from "@/apiRoutes"

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
  nombre: string
  telefono: string
  correo: string
  direccion: string
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

  // ✅ Listar pacientes
  const getPacientes = async (q = ""): Promise<PacienteEnLista[]> => {
    if (!idClinica || !token) throw new Error("Faltan credenciales.")
    const res = await fetch(`${baseUrl}/buscar?q=${encodeURIComponent(q)}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })
    if (!res.ok) throw new Error("Error al obtener pacientes.")
    return res.json()
  }

  // ✅ Obtener detalles de un paciente
  const getPacienteDetalle = async (id: number): Promise<PacienteDetallado> => {
    if (!idClinica || !token) throw new Error("Faltan credenciales.")
    const res = await fetch(`${baseUrl}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error("Error al cargar detalles del paciente.")
    return res.json()
  }

  // ✅ Crear paciente
  const createPaciente = async (data: any): Promise<PacienteDetallado> => {
    if (!idClinica || !token) throw new Error("Faltan credenciales.")
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    if (!idClinica || !token) throw new Error("Faltan credenciales.")
    const res = await fetch(`${baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    if (!idClinica || !token) throw new Error("Faltan credenciales.")
    const res = await fetch(`${baseUrl}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Error al eliminar paciente.")
    }
  }

  return {
    getPacientes,
    getPacienteDetalle,
    createPaciente,
    updatePaciente,
    deletePaciente,
  }
}
