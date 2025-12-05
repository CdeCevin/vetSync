"use client"

import { useState, useCallback } from "react"

export interface LogAuditoria {
  id: string
  accion: string
  usuario: string
  rol: string
  entidad: string
  fecha: string
  detalles: string
}

export interface CitaResumen {
  id: string
  hora: string
  paciente: string
  motivo: string
  estado: "pendiente" | "completada" | "cancelada" | "en-curso"
}

export interface PacienteResumen {
  id: string
  nombre: string
  especie: string
  propietario: string
  fechaRegistro: string
}

// MOCK DATA: Logs
const MOCK_LOGS: LogAuditoria[] = [
  { id: "1", accion: "Creación Usuario", usuario: "Admin Principal", rol: "Admin", entidad: "Usuario", fecha: "2024-03-10 10:00", detalles: "Creó usuario 'Dr. House'" },
  { id: "2", accion: "Ajuste Stock", usuario: "Ana Recepción", rol: "Recepcionista", entidad: "Inventario", fecha: "2024-03-10 11:30", detalles: "Añadió 50 unidades de Amoxicilina" },
  { id: "3", accion: "Edición Historial", usuario: "Dr. House", rol: "Veterinario", entidad: "Paciente", fecha: "2024-03-10 12:15", detalles: "Agregó diagnóstico a 'Firulais'" },
  { id: "4", accion: "Eliminación Cita", usuario: "Ana Recepción", rol: "Recepcionista", entidad: "Cita", fecha: "2024-03-10 14:00", detalles: "Canceló cita #884" },
]

// MOCK DATA: Citas
const MOCK_CITAS: CitaResumen[] = [
  { id: "101", hora: "09:00", paciente: "Max", motivo: "Vacunación", estado: "completada" },
  { id: "102", hora: "10:30", paciente: "Luna", motivo: "Chequeo General", estado: "en-curso" },
  { id: "103", hora: "11:15", paciente: "Thor", motivo: "Revisión Pata", estado: "pendiente" },
  { id: "104", hora: "14:00", paciente: "Rocky", motivo: "Cirugía", estado: "pendiente" },
  { id: "105", hora: "15:30", paciente: "Coco", motivo: "Revisión", estado: "pendiente" },
  { id: "106", hora: "16:45", paciente: "Simba", motivo: "Vacunación", estado: "pendiente" },
  { id: "107", hora: "17:15", paciente: "Nala", motivo: "Consulta", estado: "pendiente" },
]

// MOCK DATA: Pacientes Recientes (VS-021)
const MOCK_PACIENTES_RECIENTES: PacienteResumen[] = [
  { id: "p1", nombre: "Bolita", especie: "Gato", propietario: "María Paz", fechaRegistro: "Hoy 09:30" },
  { id: "p2", nombre: "Kaiser", especie: "Perro", propietario: "Juan Soto", fechaRegistro: "Hoy 11:00" },
  { id: "p3", nombre: "Lola", especie: "Perro", propietario: "Ana Rivas", fechaRegistro: "Ayer 16:45" },
]

export function useDashboardService() {
  const [loading, setLoading] = useState(false)

  // VS-008: Admin
  const getAdminData = useCallback(async () => {
    setLoading(true)
    return new Promise<{ stats: any, logs: LogAuditoria[] }>((resolve) => {
      setTimeout(() => {
        resolve({
          stats: { usuariosActivos: 12, cambiosHoy: 4, erroresSistema: 0 },
          logs: MOCK_LOGS
        })
        setLoading(false)
      }, 500)
    })
  }, [])

  // VS-014: Veterinario
  const getVetData = useCallback(async () => {
    setLoading(true)
    return new Promise<{ citasHoy: CitaResumen[], pacientesAtendidos: number, alertasMedicamentos: number }>((resolve) => {
      setTimeout(() => {
        resolve({
          citasHoy: MOCK_CITAS,
          pacientesAtendidos: 145,
          alertasMedicamentos: 3 
        })
        setLoading(false)
      }, 500)
    })
  }, [])

  // VS-021: Recepcionista
  const getReceptionData = useCallback(async () => {
    setLoading(true)
    return new Promise<{ 
      resumenCitas: any, 
      alertasInventario: number, 
      pacientesRecientes: PacienteResumen[]
    }>((resolve) => {
      setTimeout(() => {
        resolve({
          resumenCitas: { total: 15, pendientes: 8, completadas: 5, canceladas: 2 },
          alertasInventario: 5,
          pacientesRecientes: MOCK_PACIENTES_RECIENTES
        })
        setLoading(false)
      }, 500)
    })
  }, [])

  return { loading, getAdminData, getVetData, getReceptionData }
}