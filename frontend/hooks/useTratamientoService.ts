"use client"

import { useState, useCallback } from "react"
import { Tratamiento } from "../components/Tratamientos/tratamiento"

// Datos iniciales de prueba
let MOCK_TRATAMIENTOS: Tratamiento[] = [
  {
    id: "1",
    pacienteId: "p1",
    pacienteNombre: "Max (Perro)",
    veterinarioId: "v1",
    veterinarioNombre: "Dr. Juan Pérez",
    fechaPrescripcion: new Date().toISOString(),
    medicamento: "Amoxicilina",
    dosis: "500mg cada 12 horas",
    instrucciones: "Dar con comida",
    duracionDias: 7,
    estado: "Activo"
  },
  {
    id: "2",
    pacienteId: "p2",
    pacienteNombre: "Luna (Gato)",
    veterinarioId: "v1",
    veterinarioNombre: "Dr. Juan Pérez",
    fechaPrescripcion: new Date(Date.now() - 86400000 * 2).toISOString(), // Hace 2 días
    medicamento: "Meloxicam",
    dosis: "0.5mg una vez al día",
    instrucciones: "Agitar antes de usar",
    duracionDias: 3,
    estado: "Activo"
  }
]

export function useTratamientoService() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>(MOCK_TRATAMIENTOS)
  const [loading, setLoading] = useState(false)

  const cargarTratamientos = useCallback(async () => {
    setLoading(true)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // más reciente primero
        const ordenados = [...MOCK_TRATAMIENTOS].sort((a, b) => 
            new Date(b.fechaPrescripcion).getTime() - new Date(a.fechaPrescripcion).getTime()
        )
        setTratamientos(ordenados)
        setLoading(false)
        resolve()
      }, 500)
    })
  }, [])

  const crearTratamiento = async (data: Omit<Tratamiento, "id" | "fechaPrescripcion" | "editado" | "estado">) => {
    setLoading(true)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const nuevo: Tratamiento = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          fechaPrescripcion: new Date().toISOString(),
          estado: "Activo",
          editado: false
        }
        MOCK_TRATAMIENTOS = [nuevo, ...MOCK_TRATAMIENTOS]
        cargarTratamientos()
        resolve()
      }, 500)
    })
  }

  const actualizarTratamiento = async (id: string, data: Partial<Tratamiento>) => {
    setLoading(true)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const index = MOCK_TRATAMIENTOS.findIndex(t => t.id === id)
        if (index !== -1) {
          MOCK_TRATAMIENTOS[index] = { 
            ...MOCK_TRATAMIENTOS[index], 
            ...data, 
            editado: true // Marca de auditoría 
          }
        }
        cargarTratamientos()
        resolve()
      }, 500)
    })
  }

  return { tratamientos, loading, cargarTratamientos, crearTratamiento, actualizarTratamiento }
}