"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Dialog,DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useCitaService, Cita } from "@/hooks/useCitaService"
import { CitaModal } from "./cita-modal"
import { DayView, WeekView, MonthView } from "./cita-vistas"
import { CitaDetallesDialog } from "./cita-modal-det"
import { es } from "date-fns/locale"


export function CitasPage() {
  const { getCitas, getStatsHoy } = useCitaService()
  const [citas, setCitas] = useState<Cita[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [stats, setStats] = useState<{ total: number; completadas: string; pendientes: string }>({ total: 0, completadas: "0", pendientes: "0" })
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

const handleSelectCita = (cita: Cita) => {
  // Forzar reset antes de abrir el modal
  setIsDetailsOpen(false)
  setSelectedCita(null)

  // Pequeño retraso para asegurar desmontaje del diálogo anterior
  setTimeout(() => {
    setSelectedCita({ ...cita }) 
    setIsDetailsOpen(true)
  }, 0)
}

const loadData = async () => {
  const [citasData, statsData] = await Promise.all([getCitas(), getStatsHoy()])
  setCitas(citasData)
  setStats(statsData)
}

useEffect(() => { loadData() }, [])

  useEffect(() => {
    const loadData = async () => {
      const [citasData, statsData] = await Promise.all([getCitas(), getStatsHoy()])
      setCitas(citasData)
      setStats(statsData)
    }
    loadData()
  }, [])

  const citasDelDia = citas.filter(c => 
    new Date(c.fecha_cita).toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0]
  )

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
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                      <DialogTitle>Crear nueva cita </DialogTitle>
                      <DialogDescription>Ingrese los datos de la nueva cita </DialogDescription>
                    </DialogHeader>
                        <CitaModal onClose={() => setIsAddDialogOpen(false)} />
                    </DialogContent>
                    </Dialog>
              </div>
            </div>
            </CardHeader>
            </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle>Calendario</CardTitle></CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
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
        <div className="lg:col-span-3">
          {viewMode === "day" && <DayView citas={citasDelDia} onSelect={handleSelectCita} />}
          {viewMode === "week" && <WeekView selectedDate={selectedDate} citas={citas} onSelect={handleSelectCita} />}
          {viewMode === "month" && <MonthView selectedDate={selectedDate} citas={citas} onSelect={handleSelectCita} />}

        </div>
        <CitaDetallesDialog
            key={selectedCita?.id || "new"}
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
