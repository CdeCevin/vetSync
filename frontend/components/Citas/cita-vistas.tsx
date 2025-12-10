"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, startOfWeek, endOfWeek, isSameDay, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { Cita } from "@/hooks/useCitaService"
import { CitaCard } from "./cita-card"

type Paciente = {
  id: number
  nombre: string
}

type Veterinario = {
  id: number
  nombre_completo: string
}

interface DayViewProps {
  citas: Cita[]
  isLoading: boolean
  onSelect?: (cita: Cita) => void
  pacientes: Paciente[]
  veterinarios: Veterinario[]
  onEstadoChange: () => void
  onComplete?: (cita: Cita) => void
}

interface WeekViewProps {
  citas: Cita[]
  isLoading: boolean
  selectedDate: Date
  onSelect?: (cita: Cita) => void
  pacientes: Paciente[]
  veterinarios: Veterinario[]
  onEstadoChange: () => void
  onComplete?: (cita: Cita) => void
}

interface MonthViewProps {
  citas: Cita[]
  isLoading: boolean
  selectedDate: Date
  onSelect?: (cita: Cita) => void
  pacientes: Paciente[]
  veterinarios: Veterinario[]
  onEstadoChange: () => void
  onComplete?: (cita: Cita) => void
}

// Vista diaria
export function DayView({ citas, onSelect, isLoading, pacientes, veterinarios, onEstadoChange, onComplete }: DayViewProps) {
  const citasOrdenadas = [...citas].sort(
    (a, b) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime()
  )
  if (isLoading) {
    return (
      <p className="text-muted-foreground text-center py-6">
        Cargando datos...
      </p>
    )
  }
  return (
    <div className="space-y-3">
      {citasOrdenadas.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          No hay citas para este día.
        </p>
      ) : (
        citasOrdenadas.map((cita) => {
          const paciente = pacientes.find(p => p.id === cita.id_paciente)
          const vet = veterinarios.find(v => v.id === cita.id_usuario)

          return (
            <CitaCard
              key={cita.id}
              cita={cita}
              onSelect={() => onSelect?.(cita)}
              pacienteNombre={paciente ? paciente.nombre : "Desconocido"}
              veterinarioNombre={vet ? vet.nombre_completo : "Desconocido"}
              onEstadoChange={onEstadoChange}
              onComplete={onComplete}
            />
          )
        })
      )}
    </div>
  )
}

// Vista semanal
export function WeekView({ citas, selectedDate, onSelect, isLoading, pacientes, veterinarios, onEstadoChange, onComplete }: WeekViewProps) {
  const inicioSemana = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const finSemana = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const diasSemana = eachDayOfInterval({ start: inicioSemana, end: finSemana })

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-center py-6">
        Cargando datos...
      </p>
    )
  }

  // Filtrar citas solo dentro del rango de la semana seleccionada
  const citasSemana = citas.filter((c) => {
    const fecha = new Date(c.fecha_cita)
    return fecha >= inicioSemana && fecha <= finSemana
  })

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {diasSemana.map((dia) => {
        const citasDia = citasSemana
          .filter((c) => isSameDay(new Date(c.fecha_cita), dia))
          .sort((a, b) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime())

        return (
          <Card key={dia.toISOString()}>
            <CardHeader>
              <CardTitle className="text-base">
                {format(dia, "EEEE d 'de' MMMM", { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {citasDia.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">Sin citas</p>
              ) : (
                <div className="space-y-2">
                  {citasDia.map((cita) => {
                    const paciente = pacientes.find(p => p.id === cita.id_paciente)
                    const vet = veterinarios.find(v => v.id === cita.id_usuario)

                    return (
                      <CitaCard
                        key={cita.id}
                        cita={cita}
                        onSelect={() => onSelect?.(cita)}
                        pacienteNombre={paciente ? paciente.nombre : "Desconocido"}
                        veterinarioNombre={vet ? vet.nombre_completo : "Desconocido"}
                        onEstadoChange={onEstadoChange}
                        onComplete={onComplete}
                      />
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Vista mensual
export function MonthView({ citas, selectedDate, isLoading, onSelect, pacientes, veterinarios, onEstadoChange, onComplete }: MonthViewProps) {
  const mesActual = selectedDate.getMonth()
  const añoActual = selectedDate.getFullYear()

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-center py-6">
        Cargando datos...
      </p>
    )
  }

  // Filtrar solo citas del mes/año seleccionados
  const citasFiltradas = citas.filter((cita) => {
    const fecha = new Date(cita.fecha_cita)
    return (
      fecha.getMonth() === mesActual &&
      fecha.getFullYear() === añoActual
    )
  })

  const mes = format(selectedDate, "MMMM yyyy", { locale: es })
  const citasPorDia: Record<string, Cita[]> = {}

  citasFiltradas.forEach((cita) => {
    const dia = format(new Date(cita.fecha_cita), "yyyy-MM-dd")
    if (!citasPorDia[dia]) citasPorDia[dia] = []
    citasPorDia[dia].push(cita)
  })

  // Ordenar días y citas dentro de cada día
  const diasOrdenados = Object.keys(citasPorDia).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold capitalize">{mes}</h2>
      {diasOrdenados.length === 0 ? (
        <p className="text-center text-muted-foreground py-6">
          No hay citas este mes.
        </p>
      ) : (
        <div className="space-y-4">
          {diasOrdenados.map((dia) => {
            const citasOrdenadas = citasPorDia[dia].sort(
              (a, b) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime()
            )

            return (
              <div key={dia} className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 text-lg">
                  {format(new Date(dia), "EEEE d 'de' MMMM", { locale: es })}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {citasOrdenadas.map((cita) => {
                    const paciente = pacientes.find(p => p.id === cita.id_paciente)
                    const vet = veterinarios.find(v => v.id === cita.id_usuario)

                    return (
                      <CitaCard
                        key={cita.id}
                        cita={cita}
                        onSelect={() => onSelect?.(cita)}
                        pacienteNombre={paciente ? paciente.nombre : "Desconocido"}
                        veterinarioNombre={vet ? vet.nombre_completo : "Desconocido"}
                        onEstadoChange={onEstadoChange}
                        onComplete={onComplete}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
