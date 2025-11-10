"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { format, addMinutes, setHours, setMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { useCitaService, Cita } from "@/hooks/useCitaService"
import { useUserService } from "@/hooks/useUsuarioService"
import { CitaModal } from "./cita-modal"
import { CitaDetallesDialog } from "./cita-modal-det"
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

// Colores por veterinario
const VET_COLORS = [
  "bg-blue-100 border-blue-400 text-blue-800",
  "bg-green-100 border-green-400 text-green-800",
  "bg-purple-100 border-purple-400 text-purple-800",
  "bg-pink-100 border-pink-400 text-pink-800",
  "bg-orange-100 border-orange-400 text-orange-800",
]

// Colores por estado
const ESTADO_COLOR: Record<Cita["estado"], string> = {
  programada: "border-blue-500",
  en_progreso: "border-yellow-500",
  completada: "border-green-500",
  cancelada: "border-red-500",
  no_asistio: "border-gray-400",
}

// Parsear fecha directamente (ya viene local)
function parseCitaDate(dateStr: string): Date {
  return dateStr ? new Date(dateStr) : new Date()
}

// Compara si dos fechas son del mismo día
function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

// Convierte un input "date" en un Date local
function parseDateInputAsLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Día mostrado en la grilla
  const [displayDate, setDisplayDate] = useState<Date>(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  })

  const filteredVets = veterinarios.filter((v) =>
    v.nombre_completo.toLowerCase().includes(queryVet.toLowerCase())
  )

  const handleSelectCita = (cita: Cita) => {
    setSelectedCita(cita)
    setIsDetailsOpen(true)
  }

  useEffect(() => {
    const loadData = async () => {
      const [citasData, usersData] = await Promise.all([getCitas(), getUsers()])
      setCitas(citasData)
      setVeterinarios(usersData.filter((u) => u.id_rol === 2))
    }
    loadData()
  }, [getCitas, getUsers])

  const citasFiltradas = useMemo(() => {
    const desde = filtros.fechaInicio
      ? parseDateInputAsLocal(filtros.fechaInicio)
      : null
    const hasta = filtros.fechaFin
      ? parseDateInputAsLocal(filtros.fechaFin)
      : null

    return citas.filter((c) => {
      const fecha = parseCitaDate(c.fecha_cita)
      const matchFecha = !desde || fecha >= desde
      const matchVet =
        !filtros.veterinarioId || c.id_usuario === filtros.veterinarioId
      const matchEstado =
        selectedEstado === "todos" || c.estado === selectedEstado
      return matchFecha && matchVet && matchEstado
    })
  }, [citas, filtros, selectedEstado])

  const generarHoras = () => {
    const base = new Date(displayDate)
    const inicio = setHours(setMinutes(base, 0), 8)
    const fin = setHours(setMinutes(base, 0), 20)
    const intervalos: Date[] = []
    let current = new Date(inicio)
    while (current <= fin) {
      intervalos.push(new Date(current))
      current = addMinutes(current, 15)
    }
    return intervalos
  }

  const horas = generarHoras()

  useEffect(() => {
    const filtrar = async () => {
      const data = await getCitas()
      setCitas(data)
      if (filtros.fechaInicio)
        setDisplayDate(parseDateInputAsLocal(filtros.fechaInicio))
    }
    filtrar()
  }, [filtros, selectedEstado])

  const limpiarFiltros = () => {
    setFiltros({ fechaInicio: "", fechaFin: "", veterinarioId: null })
    setSelectedEstado("todos")
    setQueryVet("")
    setDisplayDate(new Date())
  }

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

      {/* Filtros */}
      <Card className="mb-6 border rounded-lg shadow-sm">
        <CardContent className="pt-6 grid md:grid-cols-4 gap-4 items-end">
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
                  className="input-like "      
                  onChange={(e) => setQueryVet(e.target.value)}
                  displayValue={(id: number) =>
                    veterinarios.find((v) => v.id === id)?.nombre_completo || ""
                  }
                  placeholder="Seleccionar veterinario..."
                />
                <ComboboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border border-gray-200 bg-white shadow-lg">
                  <ComboboxOption
                    key={"todos"}
                    value={null}
                    className={({ active }) =>
                      `cursor-pointer px-4 py-2 text-sm ${
                        active ? "bg-[#066357]/50" : ""
                      }`
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Día a visualizar</label>
            <Input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="programada">Programada</SelectItem>
                <SelectItem value="en_progreso">En progreso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="no_asistio">No asistió</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 col-span-4 justify-end">
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
                  <DialogTitle>Crear nueva cita</DialogTitle>
                  <DialogDescription>
                    Ingrese los datos de la nueva cita
                  </DialogDescription>
                </DialogHeader>
                <CitaModal
                  onClose={() => setIsAddDialogOpen(false)}
                  citaInicial={selectedCita ?? undefined}
                  onSave={async () => {
                    const citasData = await getCitas()
                    setCitas(citasData)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Día mostrado */}
      <div className="mb-2 text-sm text-gray-600">
        <strong>
          {format(displayDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
        </strong>
      </div>

      {/* Grilla de horarios */}
      <div className="overflow-x-scroll">
        <table className="min-w-full  border-collapse text-sm overflow-x-scroll">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left w-24">Hora</th>
              {veterinariosToShow.map((v, idx) => (
                <th key={v.id} className="border p-2 text-center w-56">
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
            {(() => {
              // Mantiene control sobre qué veterinarios tienen una cita activa y cuándo termina
              const ocupados: Record<number, Date | null> = {}

              return horas.map((hora, hIdx) => (
                <tr key={hIdx} className="h-12">
                  <td className="border p-2 font-medium text-gray-700">
                    {format(hora, "HH:mm")}
                  </td>

                  {veterinariosToShow.map((v, idx) => {
                    // Si este veterinario está ocupado hasta cierta hora, y todavía no pasó, no renderizamos nada (la celda ya está “rowSpaneada”)
                    if (ocupados[v.id] && hora < ocupados[v.id]!) {
                      return null
                    }

                    const cita = citasFiltradas.find((c) => {
                      const cDate = parseCitaDate(c.fecha_cita)
                      return (
                        c.id_usuario === v.id &&
                        isSameDay(cDate, displayDate) &&
                        cDate.getHours() === hora.getHours() &&
                        cDate.getMinutes() === hora.getMinutes()
                      )
                    })

                    if (cita) {
                      const rowsToSpan = Math.ceil(cita.duracion_minutos / 15)
                      // Marcamos que este veterinario estará ocupado hasta esta hora
                      ocupados[v.id] = addMinutes(parseCitaDate(cita.fecha_cita), cita.duracion_minutos)

                      return (
                        <td
                          key={`${v.id}-${hIdx}`}
                          rowSpan={rowsToSpan}
                          className={`border text-center align-middle cursor-pointer transition-all ${VET_COLORS[idx % VET_COLORS.length]} ${ESTADO_COLOR[cita.estado]}`}
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

                    // Si no hay cita en este bloque, el veterinario está libre
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
              ))
            })()}
          </tbody>


        </table>
      </div>

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
