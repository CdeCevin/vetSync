"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { format, eachHourOfInterval, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useCitaService, Cita } from "@/hooks/useCitaService"
import { useUserService } from "@/hooks/useUsuarioService"
import { CitaModal } from "./cita-modal"
import { CitaDetallesDialog } from "./cita-modal-det"
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react"
import { addMinutes, setHours, setMinutes } from "date-fns"


// 🎨 Paleta de colores por veterinario
const VET_COLORS = [
  "bg-blue-100 border-blue-400 text-blue-800",
  "bg-green-100 border-green-400 text-green-800",
  "bg-purple-100 border-purple-400 text-purple-800",
  "bg-pink-100 border-pink-400 text-pink-800",
  "bg-orange-100 border-orange-400 text-orange-800",
]

// Estado → color adicional
const ESTADO_COLOR: Record<Cita["estado"], string> = {
  programada: "border-blue-500",
  en_progreso: "border-yellow-500",
  completada: "border-green-500",
  cancelada: "border-red-500",
  no_asistio: "border-gray-400",
}

function parseCitaDate(dateStr: string): Date {
  const hasZulu = dateStr.endsWith("Z")
  const d = new Date(dateStr)
  if (hasZulu) {
    // Si la hora viene en UTC (con "Z"), la pasamos a local
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  }
  // Si ya es local, no tocamos nada
  return d
}


function toLocal(dateStr: string): Date {
  // Asegura que el string ISO se interprete como local sin alterar la hora
  const d = new Date(dateStr)
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000)
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}



export function CitasRecepcionistaPage() {
  const { getCitas } = useCitaService()
  const { getUsers } = useUserService()

  const [citas, setCitas] = useState<Cita[]>([])
  const [veterinarios, setVeterinarios] = useState<any[]>([])
  const [selectedEstado, setSelectedEstado] = useState<string>("todos")

  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    veterinarioId: null as number | null,
  })
  const [queryVet, setQueryVet] = useState("")
  const filteredVets = veterinarios.filter((v) =>
    v.nombre_completo.toLowerCase().includes(queryVet.toLowerCase())
  )

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // displayDate: día usado para renderizar la grilla horaria.
  // Si no hay fechaInicio, por defecto hoy.
  const [displayDate, setDisplayDate] = useState<Date>(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  })
  const handleSelectCita = (cita: Cita) => {
    setSelectedCita(cita)
    setIsDetailsOpen(true)
  }

  useEffect(() => {
    const loadData = async () => {
      const [citasData, usersData] = await Promise.all([getCitas(), getUsers()])
      setCitas(citasData)
      setVeterinarios(usersData.filter((u) => u.id_rol === 2)) // veterinarios
    }
    loadData()
  }, [getCitas, getUsers])

  // 📅 Filtro dinámico de citas (aplica sobre todas las citas; la grilla luego filtra por displayDate)
        const citasFiltradas = useMemo(() => {
        const desde = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null
        const hasta = filtros.fechaFin ? new Date(filtros.fechaFin) : null

        return citas.filter((c) => {
            const fecha = toLocal(c.fecha_cita)

            const matchFecha =
            (!desde || fecha >= desde) &&
            (!hasta || fecha <= hasta)

            const matchVet =
            !filtros.veterinarioId || c.id_usuario === filtros.veterinarioId

            const matchEstado =
            selectedEstado === "todos" || c.estado === selectedEstado

            return matchFecha && matchVet && matchEstado
        })
        }, [citas, filtros, selectedEstado])

  // 🕘 Horas del día basadas en displayDate (9 a 18)
  const generarHoras = () => {
    const base = new Date(displayDate)
    const inicio = setHours(setMinutes(base, 0), 8) // 08:00
    const fin = setHours(setMinutes(base, 0), 20)   // 20:00
    const intervalos: Date[] = []
    let current = new Date(inicio)

    while (current <= fin) {
      intervalos.push(new Date(current))
      current = addMinutes(current, 15)
    }

  return intervalos
}


  const horas = generarHoras()

  // Aplicar filtros: recarga datos y actualiza displayDate si hay fechaInicio
    useEffect(() => {
    const filtrar = async () => {
        const data = await getCitas()
        setCitas(data)

        // Si el usuario seleccionó fechaInicio, actualiza displayDate
        if (filtros.fechaInicio) {
          const newDate = new Date(filtros.fechaInicio)
          newDate.setHours(0, 0, 0, 0)
          setDisplayDate(newDate)
        } 

    }
    filtrar()
    }, [filtros, selectedEstado])


  const limpiarFiltros = () => {
    setFiltros({ fechaInicio: "", fechaFin: "", veterinarioId: null })
    setSelectedEstado("todos")
    setQueryVet("")
    setDisplayDate(new Date())
  }

  // 🧑‍⚕️ Veterinarios visibles (respeta el filtro asistido)
  const veterinariosToShow = filtros.veterinarioId
    ? veterinarios.filter((v) => v.id === filtros.veterinarioId)
    : veterinarios

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="font-serif font-bold text-2xl">Agenda Global</h1>
        <p className="text-gray-600">
          Visualiza y gestiona las citas de todos los veterinarios
        </p>
      </div>

      {/* 🎛️ Filtros */}
      <Card className="mb-6 border rounded-lg shadow-sm">
        <CardContent className="pt-6 grid md:grid-cols-4 gap-4 items-end">
          {/* 🩺 Veterinario (Combobox asistido) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Veterinario</label>
            <Combobox
              value={filtros.veterinarioId}
              onChange={(value: number | null) =>
                setFiltros((prev) => ({ ...prev, veterinarioId: value }))
              }
            >
              <div className="relative mt-1">
                <ComboboxInput
                  className="input-like w-full"
                  onChange={(e) => setQueryVet(e.target.value)}
                  displayValue={(id: number) =>
                    veterinarios.find((v) => v.id === id)?.nombre_completo || ""
                  }
                  placeholder="Seleccionar veterinario..."
                />
                <ComboboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border border-gray-200 bg-white shadow-lg">
                  {/* Opción para "Todos" */}
                  <ComboboxOption
                    key={"todos"}
                    value={null}
                    className={({ active }) =>
                      `cursor-pointer px-4 py-2 text-sm ${active ? "bg-[#066357]/50" : ""}`
                    }
                  >
                    — Todos los veterinarios —
                  </ComboboxOption>

                  {filteredVets.length === 0 && (
                    <div className="px-2.5 py-2 text-sm text-gray-500">
                      Sin coincidencias
                    </div>
                  )}
                  {filteredVets.map((v) => (
                    <ComboboxOption
                      key={v.id}
                      value={v.id}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 text-sm ${
                          active ? "bg-[#066357]/50" : ""
                        }`
                      }
                    >
                      {v.nombre_completo} — {v.correo_electronico}
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </div>
            </Combobox>
          </div>

          {/* 📅 Fecha inicio */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Desde (día mostrado)</label>
            <Input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))
              }
            />
          </div>

          {/* 📅 Fecha fin */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hasta</label>
            <Input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))
              }
            />
          </div>

          {/* 🔘 Estado */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <select
              className="border rounded-md p-2 w-full"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="programada">Programada</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="no_asistio">No asistió</option>
            </select>
          </div>

          {/* 🔘 Botones */}
          <div className="flex gap-2 col-span-4 justify-end">
            {/* <Button onClick={aplicarFiltros}>Aplicar filtros</Button>*/}
            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#066357] hover:bg-[#054d46]">
                  + Nueva Cita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                      <DialogTitle>Crear nueva cita </DialogTitle>
                      <DialogDescription>Ingrese los datos de la nueva cita </DialogDescription>
                    </DialogHeader>
                <CitaModal
                    onClose={() => setIsAddDialogOpen(false)}
                    citaInicial={selectedCita ?? undefined} // <- null → undefined
                    />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* indicador del día mostrado */}
      <div className="mb-2 text-sm text-gray-600">
        <strong>{format(displayDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}</strong>
      </div>

      {/* 🗓️ Vista Multi-Veterinario */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left w-24">Hora</th>
              {veterinariosToShow.map((v, idx) => (
                <th key={v.id} className="border p-2 text-center">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      VET_COLORS[idx % VET_COLORS.length]
                    }`}
                  >
                    {v.nombre_completo}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horas.map((hora, hIdx) => (
              <tr key={hIdx} className="h-12">
                <td className="border p-2 font-medium text-gray-700">
                  {format(hora, "HH:mm")}
                </td>

                {veterinariosToShow.map((v, idx) => {
                  // buscamos cita que comience en este horario
                  const cita = citasFiltradas.find((c) => {
                    const cDate = parseCitaDate(c.fecha_cita)
                    return (
                      c.id_usuario === v.id &&
                      cDate.getHours() === hora.getHours() &&
                      cDate.getMinutes() === hora.getMinutes() &&
                      isSameDay(cDate, displayDate)
                    )
                  })


                  // evitar duplicar celdas en intervalos ocupados
                  const citaEnCurso = citasFiltradas.find((c) => {
                    const start = parseCitaDate(c.fecha_cita)
                    const end = addMinutes(start, c.duracion_minutos)

                    const horaNum = hora.getTime()
                    return (
                      c.id_usuario === v.id &&
                      isSameDay(start, displayDate) &&
                      horaNum > start.getTime() &&
                      horaNum < end.getTime()
                    )
                  })

                  if (citaEnCurso) return null // salto filas ocupadas

                  if (cita) {
                    const rowsToSpan = Math.ceil(cita.duracion_minutos / 15)

                    return (
                      <td
                        key={`${v.id}-${hIdx}`}
                        rowSpan={rowsToSpan}
                        className={`border text-center align-middle cursor-pointer transition-all ${
                          `${VET_COLORS[idx % VET_COLORS.length]} ${ESTADO_COLOR[cita.estado]}`
                        }`}
                        onClick={() => handleSelectCita(cita)}
                      >
                        <div className="p-2">
                          <strong>{cita.tipo_cita}</strong>
                          <p className="text-xs">{cita.motivo}</p>
                          <p className="text-[10px] text-gray-600">
                            {format(parseCitaDate(cita.fecha_cita), "HH:mm")} -{" "}
                            {format(
                              addMinutes(parseCitaDate(cita.fecha_cita), cita.duracion_minutos),
                              "HH:mm"
                            )}
                          </p>
                        </div>
                      </td>
                    )
                  }

                  // si no hay cita, celda normal
                  return (
                    <td
                      key={`${v.id}-${hIdx}`}
                      className="border text-center cursor-pointer hover:bg-gray-50 transition-all"
                      onClick={() => {
                        const nuevaFecha = new Date(displayDate)
                        nuevaFecha.setHours(hora.getHours(), hora.getMinutes(), 0, 0)
                        setSelectedCita({
                          id_usuario: v.id,
                          fecha_cita: nuevaFecha.toISOString(),
                        } as any)
                        setIsAddDialogOpen(true)
                      }}
                    >
                      <span className="text-xs text-gray-400">Libre</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🩺 Modal de detalles */}
      <CitaDetallesDialog
        open={isDetailsOpen}
        cita={selectedCita}
        onClose={() => setIsDetailsOpen(false)}
        onUpdate={async () => {
          const citasData = await getCitas()
          setCitas(citasData)
        }}
      />
    </div>
  )
}
