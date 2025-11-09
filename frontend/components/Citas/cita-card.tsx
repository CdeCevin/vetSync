"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Cita } from "@/hooks/useCitaService"
import { usePacienteService } from "@/hooks/usePacienteService"
import { useUserService } from "@/hooks/useUsuarioService"

interface CitaCardProps {
  cita: Cita
  onSelect?: (cita: Cita) => void
}

const ESTADOS_COLORES: Record<Cita["estado"], string> = {
  programada: "bg-blue-100 text-blue-800",
  en_progreso: "bg-yellow-100 text-yellow-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
  no_asistio: "bg-gray-200 text-gray-700",
}

export function CitaCard({ cita, onSelect }: CitaCardProps) {
  const { getPacientes } = usePacienteService()
  const { getUsers } = useUserService()

  const [pacienteNombre, setPacienteNombre] = useState("Cargando...")
  const [veterinarioNombre, setVeterinarioNombre] = useState("Cargando...")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener listas
        const [pacientes, usuarios] = await Promise.all([getPacientes(""), getUsers()])

        // Buscar nombres
        const paciente = pacientes.find((p: any) => p.id === cita.id_paciente)
        const vet = usuarios.find((u: any) => u.id === cita.id_usuario)

        setPacienteNombre(paciente ? paciente.nombre : "Desconocido")
        setVeterinarioNombre(vet ? vet.nombre_completo : "Desconocido")
      } catch (err) {
        console.error("Error cargando nombres:", err)
      }
    }
    fetchData()
  }, [cita.id_paciente, cita.id_usuario])

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-150"
      onClick={() => onSelect && onSelect(cita)}
    >
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-sm">
          {format(new Date(cita.fecha_cita), "HH:mm", { locale: es })}
        </CardTitle>
        <Badge className={ESTADOS_COLORES[cita.estado]}>
          {cita.estado}
        </Badge>
      </CardHeader>

      <CardContent className="text-sm space-y-1">
        <p><strong>Paciente:</strong> {pacienteNombre}</p>
        <p><strong>Veterinario:</strong> {veterinarioNombre}</p>
        <p><strong>Tipo:</strong> {cita.tipo_cita}</p>
      </CardContent>
    </Card>
  )
}
