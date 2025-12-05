"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Package, FileClock, AlertTriangle, Clock, CheckCircle, PawPrint, Activity, ArrowRight, Pill, Search as SearchIcon } from "lucide-react"
import { useAuth } from '@/components/user-context'
import { useDashboardService, LogAuditoria, CitaResumen, PacienteResumen } from "@/hooks/useDashboardService"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardOverviewProps {
  userRole: "Admin" | "Veterinario" | "Recepcionista"
  onNavigate: (section: string) => void
}

export function DashboardOverview({ userRole, onNavigate }: DashboardOverviewProps) {
  const { usuario } = useAuth()
  const { getAdminData, getVetData, getReceptionData, loading } = useDashboardService()

  const [adminStats, setAdminStats] = useState<any>(null)
  const [adminLogs, setAdminLogs] = useState<LogAuditoria[]>([])
  
  const [vetData, setVetData] = useState<{ citasHoy: CitaResumen[], pacientesAtendidos: number, alertasMedicamentos: number } | null>(null)
  
  // Estado Recepcionista
  const [receptionData, setReceptionData] = useState<{ 
    resumenCitas: any, 
    alertasInventario: number,
    pacientesRecientes: PacienteResumen[] 
  } | null>(null)

  useEffect(() => {
    if (userRole === "Admin") {
      getAdminData().then(data => {
        setAdminStats(data.stats)
        setAdminLogs(data.logs)
      })
    } else if (userRole === "Veterinario") {
      getVetData().then(data => setVetData(data))
    } else if (userRole === "Recepcionista") {
      getReceptionData().then(data => setReceptionData(data))
    }
  }, [userRole, getAdminData, getVetData, getReceptionData])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-foreground">
          {userRole === "Veterinario" ? `Bienvenido Dr. ${usuario?.nombre_completo || ""}` : `Bienvenid@, ${usuario?.nombre_completo || "Usuario"}`}
        </h1>
        <p className="text-muted-foreground">Resumen de actividad para hoy</p>
      </div>

      {/* VISTA ADMIN */}
      {userRole === "Admin" && adminStats && (
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle><Users className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{adminStats.usuariosActivos}</div></CardContent></Card>
             <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle><FileClock className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{adminStats.cambiosHoy}</div></CardContent></Card>
          </div>

          <div className="grid mt-6 gap-6 md:grid-cols-2">
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader><CardTitle className="font-serif">Auditoría Reciente</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {adminLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className={`mt-1 w-2 h-2 rounded-full ${log.entidad === 'Usuario' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{log.accion}</p>
                      <p className="text-xs text-muted-foreground">Por <span className="font-semibold">{log.usuario}</span></p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{log.fecha.split(" ")[1]}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-serif">Acciones Rápidas</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                <Button className="justify-start h-auto p-4 w-full bg-primary/10 hover:bg-primary/20 hover:text-primary text-primary border border-primary/10" variant="ghost" onClick={() => onNavigate("users")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm"><Users className="h-5 w-5 text-primary"/></div>
                    <div className="text-left">
                    <span className="block font-bold">Crear Nuevo Usuario</span>
                    <span className="text-xs opacity-70">Registrar personal médico</span>
                  </div>
                   </div>
                </Button>
                <Button className="justify-start h-auto p-4 w-full bg-secondary/10 hover:bg-secondary/20 hover:text-secondary text-secondary border border-secondary/10" variant="ghost" onClick={() => onNavigate("logs")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm"><FileClock className="h-5 w-5 text-primary"/></div>
                    <div className="text-left">
                    <span className="block font-bold">Ver Logs Completos</span>
                    <span className="text-xs opacity-70">Ir a auditoría detallada</span>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* VISTA VETERINARIO */}
      {userRole === "Veterinario" && vetData && (
        <div>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Mis Citas Hoy</CardTitle><Calendar className="h-4 w-4 text-muted-foreground"/></CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{vetData.citasHoy.length}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-orange-500"/> {vetData.citasHoy.filter(c => c.estado === 'pendiente').length} Pendientes</span>
                        <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1 text-green-500"/> {vetData.citasHoy.filter(c => c.estado === 'completada').length} Listas</span>
                    </div>
                </CardContent>
             </Card>
             
             <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle><Users className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{vetData.pacientesAtendidos}</div><p className="text-xs text-muted-foreground mt-1">Pacientes Asociados</p></CardContent></Card>
             <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Medicamentos Críticos</CardTitle><Pill className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{vetData.alertasMedicamentos}</div> <p className="text-xs text-muted-foreground mt-1">Requieren reposición inmediata</p></CardContent></Card>

           </div>

          <div className="grid mt-6 gap-6 md:grid-cols-2">
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Próximas 5 Citas</CardTitle>
                <CardDescription>Agenda pendiente inmediata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vetData.citasHoy
                    .filter(c => c.estado === 'pendiente' || c.estado === 'en-curso')
                    .slice(0, 5)
                    .length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay próximas citas pendientes.</p>
                  ) : (
                    vetData.citasHoy
                        .filter(c => c.estado === 'pendiente' || c.estado === 'en-curso')
                        .slice(0, 5)
                        .map(cita => (
                            <div key={cita.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex gap-3 items-center">
                                    <div className="bg-primary/10 p-1 px-2 rounded font-bold text-primary text-xs text-center min-w-[50px]">
                                        {cita.hora}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{cita.paciente}</span>
                                        <span className="text-xs text-muted-foreground">{cita.motivo}</span>
                                    </div>
                                </div>
                                <Badge variant={cita.estado === 'en-curso' ? "secondary" : "outline"} className="text-[10px]">
                                    {cita.estado}
                                </Badge>
                            </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Accesos Frecuentes</CardTitle>
                <CardDescription>Atajos para tu gestión diaria</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button className="justify-start h-auto p-4 w-full bg-secondary/10 hover:bg-secondary/20 hover:text-secondary text-secondary border border-secondary/10" variant="ghost" onClick={() => onNavigate("patients")}>
                  <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-full shadow-sm"><SearchIcon className="h-5 w-5 text-secondary"/></div><div className="text-left"><span className="block font-bold">Buscar Paciente</span><span className="text-xs opacity-70">Acceder a historial</span></div></div>
                </Button>
                <Button className="justify-start h-auto p-4 w-full bg-[#329c8c]/10 hover:bg-[#329c8c]/20 text-[#29564e] hover:text-[#29564e] border border-[#29564e]/10" variant="ghost" onClick={() => onNavigate("appointments")}>
                  <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-full shadow-sm"><FileClock className="h-5 w-5 text-[#29564e]"/></div><div className="text-left"><span className="block font-bold">Ver Calendario</span><span className="text-xs opacity-70">Consultar agenda</span></div></div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* VISTA RECEPCIONISTA*/}
      {userRole === "Recepcionista" && receptionData && (
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Citas Totales</CardTitle><Calendar className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{receptionData.resumenCitas.total}</div><p className="text-xs text-muted-foreground mt-1">Citas por realizar hoy</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Citas Completadas</CardTitle><Calendar className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{receptionData.resumenCitas.completadas}</div> <p className="text-xs text-muted-foreground mt-1">Citas completadas hoy</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Alertas Stock</CardTitle><Pill className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{receptionData.alertasInventario}</div> <p className="text-xs text-muted-foreground mt-1">Requieren reposición inmediata</p></CardContent></Card>             
          </div>

          <div className="grid mt-6 gap-6 md:grid-cols-2">
            
            {/* Pacientes Recientes */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Pacientes Recientes</CardTitle>
                <CardDescription>Últimos registros ingresados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(receptionData.pacientesRecientes || []).map((paciente) => (
                    <div key={paciente.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <PawPrint className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{paciente.nombre} <span className="text-xs text-muted-foreground">({paciente.especie})</span></p>
                          <p className="text-xs text-muted-foreground">Dueño: {paciente.propietario}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium bg-secondary/10 text-secondary px-2 py-1 rounded">
                        {paciente.fechaRegistro}
                      </span>
                    </div>
                  ))}
                  {(!receptionData.pacientesRecientes || receptionData.pacientesRecientes.length === 0) && (
                    <p className="text-sm text-muted-foreground">No hay registros recientes.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Accesos Directos*/}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Accesos Rápidos</CardTitle>
                <CardDescription>Tareas de recepción</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button className="justify-start h-auto p-4 w-full bg-primary/10 hover:bg-primary/20 hover:text-primary text-primary border border-primary/10" variant="ghost" onClick={() => onNavigate("appointments")}>
                  <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-full shadow-sm"><Calendar className="h-5 w-5 text-primary"/></div><div className="text-left"><span className="block font-bold">Agendar Nueva Cita</span><span className="text-xs opacity-70">Registrar visita</span></div></div>
                </Button>
                
                <Button className="justify-start h-auto p-4 w-full bg-green-50 hover:bg-secondary/20 hover:text-secondary text-secondary border border-secondary/10" variant="ghost" onClick={() => onNavigate("patients")}>
                  <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-full shadow-sm"><Users className="h-5 w-5 text-secondary"/></div><div className="text-left"><span className="block font-bold">Registrar Paciente</span><span className="text-xs opacity-70">Crear ficha nueva</span></div></div>
                </Button>

                <Button className="justify-start h-auto p-4 w-full bg-[#329c8c]/10 hover:bg-[#329c8c]/20 text-[#29564e] hover:text-[#29564e] border border-[#29564e]/10" variant="ghost" onClick={() => onNavigate("inventory")}>
                  <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-full shadow-sm"><Package className="h-5 w-5 text-[#29564e] "/></div><div className="text-left"><span className="block font-bold">Revisar Inventario</span><span className="text-xs opacity-70">Ver stock y alertas</span></div></div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

//REVISAR 
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2"><Skeleton className="h-8 w-[250px] bg-gray-200" /></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-[120px] rounded-xl bg-gray-200" /><Skeleton className="h-[120px] rounded-xl bg-gray-200" /><Skeleton className="h-[120px] rounded-xl bg-gray-200" /><Skeleton className="h-[120px] rounded-xl bg-gray-200" /></div>
      <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-[300px] rounded-xl bg-gray-200" /><Skeleton className="h-[300px] rounded-xl bg-gray-200" /></div>
    </div>
  )
}