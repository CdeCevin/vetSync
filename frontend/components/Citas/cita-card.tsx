"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Cita } from "@/hooks/useCitaService"
import { useCitaService } from "@/hooks/useCitaService"
import { useAlertStore } from "@/hooks/use-alert-store"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface CitaCardProps {
  cita: Cita
  onSelect?: (cita: Cita) => void
  onEstadoChange?: () => void
  pacienteNombre: string
  veterinarioNombre: string
  onComplete?: (cita: Cita) => void
}

const ESTADOS_COLORES: Record<Cita["estado"], string> = {
  programada: "bg-blue-100 text-blue-800",
  en_progreso: "bg-yellow-100 text-yellow-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
  no_asistio: "bg-gray-200 text-gray-700",
}

export function CitaCard({ cita, onSelect, onEstadoChange, pacienteNombre, veterinarioNombre, onComplete }: CitaCardProps) {
  const { patchEstadoCita } = useCitaService()
  const { onOpen: openAlert } = useAlertStore()
  const [estado, setEstado] = useState<Cita["estado"]>(cita.estado)

  useEffect(() => {
    setEstado(cita.estado)
  }, [cita.estado])


  const handleEstadoChange = async (nuevoEstado: Cita["estado"]) => {
    try {
      if (nuevoEstado === 'completada' && onComplete) {
        onComplete(cita)
        return // Detener aquí para que no se actualice el estado visualmente aún
      }
      setEstado(nuevoEstado)
      await patchEstadoCita(cita.id, nuevoEstado)
      openAlert("Éxito", `Estado actualizado a "${nuevoEstado}".`, "success")
      if (onEstadoChange) onEstadoChange() // Llama a la recarga del padre
    } catch (err) {
      console.error(err)
      openAlert("Error", "No se pudo actualizar el estado de la cita.", "error")
    }
  }

  return (
    <Card
      className="hover:shadow-md transition-shadow duration-150"
      onClick={() => onSelect && onSelect(cita)}
    >
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-sm">
          {format(new Date(cita.fecha_cita), "HH:mm", { locale: es })}
        </CardTitle>
        <Select
          value={estado}
          onValueChange={handleEstadoChange}
        >
          <SelectTrigger
            className={`w-[150px] ${ESTADOS_COLORES[estado]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="programada">Programada</SelectItem>
            <SelectItem value="en_progreso">En progreso</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="no_asistio">No asistió</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="text-sm space-y-1">
        <p><strong>Paciente:</strong> {pacienteNombre}</p>
        <p><strong>Veterinario:</strong> {veterinarioNombre}</p>
        <p><strong>Tipo:</strong> {cita.tipo_cita}</p>
      </CardContent>
    </Card>
  )
}
