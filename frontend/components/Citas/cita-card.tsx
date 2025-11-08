// cita-card.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Cita } from "@/hooks/useCitaService"

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
        <p><strong>Paciente:</strong> {cita.id_paciente}</p>
        <p><strong>Veterinario:</strong> {cita.id_usuario}</p>
        <p><strong>Tipo:</strong> {cita.tipo_cita}</p>
      </CardContent>
    </Card>
  )
}
