// cita-vistas.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, startOfWeek, endOfWeek, isSameDay, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { Cita } from "@/hooks/useCitaService"
import { CitaCard } from "./cita-card"

interface DayViewProps {
  citas: Cita[]
  onSelect?: (cita: Cita) => void
}

interface WeekViewProps {
  citas: Cita[]
  selectedDate: Date
  onSelect?: (cita: Cita) => void
}

interface MonthViewProps {
  citas: Cita[]
  selectedDate: Date
  onSelect?: (cita: Cita) => void
}

// --- DAY VIEW ---
export function DayView({ citas, onSelect }: DayViewProps) {
  return (
    <div className="space-y-3">
      {citas.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          No hay citas para este día.
        </p>
      ) : (
        citas
          .sort((a, b) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime())
          .map((cita) => (
            <CitaCard
              key={cita.id}
              cita={cita}
              onSelect={() => onSelect?.(cita)} 
            />
          ))
      )}
    </div>
  )
}

// --- WEEK VIEW ---
export function WeekView({ citas, selectedDate, onSelect }: WeekViewProps) {
  const inicioSemana = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const finSemana = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const diasSemana = eachDayOfInterval({ start: inicioSemana, end: finSemana })

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {diasSemana.map((dia) => {
        const citasDia = citas.filter((c) => isSameDay(new Date(c.fecha_cita), dia))
        return (
          <Card key={dia.toISOString()}>
            <CardHeader>
              <CardTitle className="text-base">
                {format(dia, "EEEE d 'de' MMMM", { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {citasDia.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  Sin citas
                </p>
              ) : (
                <div className="space-y-2">
                  {citasDia.map((cita) => (
                    <CitaCard
                      key={cita.id}
                      cita={cita}
                     onSelect={() => onSelect?.(cita)} 
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// --- MONTH VIEW ---
export function MonthView({ citas, selectedDate, onSelect }: MonthViewProps) {
  const mes = format(selectedDate, "MMMM yyyy", { locale: es })
  const citasPorDia: Record<string, Cita[]> = {}

  citas.forEach((cita) => {
    const dia = format(new Date(cita.fecha_cita), "yyyy-MM-dd")
    if (!citasPorDia[dia]) citasPorDia[dia] = []
    citasPorDia[dia].push(cita)
  })

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
          {diasOrdenados.map((dia) => (
            <div key={dia} className="border rounded-lg p-4">
              <h3 className="font-medium mb-3 text-lg">
                {format(new Date(dia), "EEEE d 'de' MMMM", { locale: es })}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {citasPorDia[dia].map((cita) => (
                  <CitaCard
                    key={cita.id}
                    cita={cita}
                    onSelect={() => onSelect?.(cita)} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
