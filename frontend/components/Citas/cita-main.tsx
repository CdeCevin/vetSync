"use client"

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useCitaService, Cita } from "@/hooks/useCitaService"
import { usePacienteService } from "@/hooks/usePacienteService"
import { useUserService } from "@/hooks/useUsuarioService"
import { CitaModal } from "./cita-modal"
import { DayView, WeekView, MonthView } from "./cita-vistas"
import { CitaDetallesDialog } from "./cita-modal-det"
import { es } from "date-fns/locale"


export function CitasPage() {
  const { getCitas, getStatsHoy } = useCitaService()
  const { getPacientes } = usePacienteService()
  const { getUsers, getVeterinarios } = useUserService()
  const [citas, setCitas] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])
  const [veterinarios, setVeterinarios] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [stats, setStats] = useState<{ total: number; completadas: string; pendientes: string }>({ total: 0, completadas: "0", pendientes: "0" })
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const [citasData, statsData, pacientesData, usersData] = await Promise.all([
      getCitas(),
      getStatsHoy(),
      getPacientes(),
      getVeterinarios()
    ])
    setCitas(citasData)
    setStats(statsData)
    setPacientes(pacientesData || [])
    setVeterinarios(usersData || []) // Ya viene filtrado desde el backend (solo vets)
    setIsLoading(false)
  }, [getCitas, getStatsHoy, getPacientes, getVeterinarios])

  // Un solo useEffect para la carga inicial
  useEffect(() => {
    loadData()
  }, [])

  const handleSelectCita = (cita: Cita) => {
    setSelectedCita({ ...cita })
    setIsDetailsOpen(true)
  }
  const citasDelDia = citas.filter(c =>
    new Date(c.fecha_cita).toDateString() === selectedDate.toDateString())
  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="font-serif font-bold text-2xl">Gestión de Citas</h1>
            <p className="text-gray-600">Administra y programa las citas de la clínica</p>
          </div>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                      <TabsList>
                        <TabsTrigger value="day">Día</TabsTrigger>
                        <TabsTrigger value="week">Semana</TabsTrigger>
                        <TabsTrigger value="month">Mes</TabsTrigger>
                      </TabsList>
                    </Tabs>


                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>

                    <DialogTrigger asChild>
                      <Button><Plus className="h-4 w-4 mr-2" />Nueva Cita</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                      <DialogHeader>
                        <DialogTitle>Crear nueva cita </DialogTitle>
                        <DialogDescription>Ingrese los datos de la nueva cita </DialogDescription>
                      </DialogHeader>
                      <CitaModal
                        onClose={() => setIsAddDialogOpen(false)}
                        onSave={() => {
                          loadData()
                          setIsAddDialogOpen(false)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6 lg:grid-cols-4">
            <div className=" lg:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle>Calendario</CardTitle></CardHeader>
                <CardContent className="p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className=""
                    locale={es}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Estadísticas de hoy</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span>Total</span><Badge>{stats.total}</Badge></div>
                  <div className="flex justify-between"><span>Completadas</span><Badge className="bg-green-100 text-green-800">{stats.completadas}</Badge></div>
                  <div className="flex justify-between"><span>Pendientes</span><Badge className="bg-blue-100 text-blue-800">{stats.pendientes}</Badge></div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3  space-y-4">
              {viewMode === "day" && <DayView isLoading={isLoading} citas={citasDelDia} onSelect={handleSelectCita} pacientes={pacientes} veterinarios={veterinarios} onEstadoChange={loadData} />}
              {viewMode === "week" && <WeekView isLoading={isLoading} selectedDate={selectedDate} citas={citas} onSelect={handleSelectCita} pacientes={pacientes} veterinarios={veterinarios} onEstadoChange={loadData} />}
              {viewMode === "month" && <MonthView isLoading={isLoading} selectedDate={selectedDate} citas={citas} onSelect={handleSelectCita} pacientes={pacientes} veterinarios={veterinarios} onEstadoChange={loadData} />}

            </div>
            <CitaDetallesDialog
              open={isDetailsOpen}
              cita={selectedCita}
              onClose={() => setIsDetailsOpen(false)}
              onUpdate={loadData}
            />

          </div>
        </main>
      </div>
    </div>
  )
}
