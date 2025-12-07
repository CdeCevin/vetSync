"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Package, FileClock, Clock, CheckCircle, PawPrint, Pill, Search as SearchIcon } from "lucide-react"
import { useAuth } from '@/components/user-context'
import { useDashboardService } from "@/hooks/useDashboardService"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardOverviewProps {
  userRole: "Admin" | "Veterinario" | "Recepcionista"
  onNavigate: (section: string) => void
}

export function DashboardOverview({ userRole, onNavigate }: DashboardOverviewProps) {
  const { usuario } = useAuth()

  const { 
    loading, 
    adminData, 
    vetData, 
    receptionData, 
    cargarAdminData, 
    cargarVetData, 
    cargarReceptionData 
  } = useDashboardService()

  // useEffect para decidir que se cargar segun rol
  useEffect(() => {
    if (!usuario?.id_clinica) return

    if (userRole === "Admin") {
      cargarAdminData()
    } else if (userRole === "Veterinario") {
      cargarVetData()
    } else if (userRole === "Recepcionista") {
      cargarReceptionData()
    }
  }, [userRole, usuario, cargarAdminData, cargarVetData, cargarReceptionData])

  // formatos para la visualizacion correcta
  const formatTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return "--:--"; }
  }

  const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleDateString();
      } catch (e) { return dateString; }
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-foreground">
          {userRole === "Veterinario" ? `Bienvenido Dr. ${usuario?.nombre_completo || ""}` : `Bienvenid@, ${usuario?.nombre_completo || "Usuario"}`}
        </h1>
        <p className="text-muted-foreground">Resumen de actividad para hoy</p>
      </div>

      {/* --- VISTA ADMIN */}
      {userRole === "Admin" && adminData && (
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle><Users className="h-4 w-4 text-muted-foreground"/></CardHeader>
                <CardContent><div className="text-2xl font-bold text-primary">{adminData.totalUsuarios}</div></CardContent>
             </Card>
             <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Movimientos Recientes</CardTitle><FileClock className="h-4 w-4 text-muted-foreground"/></CardHeader>
                <CardContent><div className="text-2xl font-bold text-primary">{adminData.ultimosCambios}</div></CardContent>
             </Card>
          </div>

          <div className="grid mt-6 gap-6 md:grid-cols-2">
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader><CardTitle className="font-serif">Auditoría Reciente</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {(adminData.actividadReciente || []).slice(0, 5).map((log, index) => {
                  
                  //formateo del detalle
                  let contenidoDetalle = <span className="italic">{log.detalles}</span>;

                  try {
                    // Si parece JSON  se parsea para mostrarlo como cambio
                    if (log.detalles && log.detalles.startsWith("{")) {
                      const parsed = JSON.parse(log.detalles);
                      contenidoDetalle = (
                        <div className="flex flex-col gap-1 mt-1">
                          {Object.entries(parsed).map(([campo, val]: [string, any]) => (
                            <div key={campo} className="flex flex-wrap items-center gap-1 text-[11px]">
                              <span className="font-semibold capitalize text-slate-700">{campo}:</span>
                              <span className="text-slate-400 line-through decoration-slate-300">
                                {val.anterior !== null ? String(val.anterior) : "Vacío"}
                              </span>
                              <span className="text-slate-400">→</span>
                              <span className="text-green-600 font-medium">
                                {val.nuevo !== null ? String(val.nuevo) : "Vacío"}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                  } catch (e) {
                    // Si falla el parseo, se queda como el valor por defecto
                  }

                  return (
                    <div key={index} className="flex items-start space-x-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div 
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                          log.entidad === 'Usuario' ? 'bg-blue-500' : 
                          log.entidad === 'Paciente' ? 'bg-green-500' : 'bg-orange-500'
                        }`} 
                      />
                      
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <p className="text-sm font-medium leading-none text-slate-900">
                          {log.accion.replace(/_/g, " ")} 
                          <span className="text-slate-400 font-normal mx-1">-</span> 
                          {log.entidad}
                        </p>
                        
                        {/* Detalles - variable procesada */}
                        <div className="text-xs text-muted-foreground break-words">
                          {contenidoDetalle}
                        </div>
                        
                        <p className="text-[10px] text-slate-400 pt-1">
                          Por <span className="font-medium text-slate-600">{log.nombre_completo}</span> ({log.nombre_rol})
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-400 whitespace-nowrap tabular-nums">
                        {log.tiempo_transcurrido}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-serif">Acciones Rápidas</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                <Button className="justify-start h-auto p-4 w-full bg-primary/10 hover:bg-primary/20 hover:text-primary text-primary border border-primary/10" variant="ghost" onClick={() => onNavigate("users")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm"><Users className="h-5 w-5 text-primary"/></div>
                    <div className="text-left"><span className="block font-bold">Gestión Usuarios</span><span className="text-xs opacity-70">Administrar personal</span></div>
                   </div>
                </Button>
                <Button className="justify-start h-auto p-4 w-full bg-secondary/10 hover:bg-secondary/20 hover:text-secondary text-secondary border border-secondary/10" variant="ghost" onClick={() => onNavigate("logs")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm"><FileClock className="h-5 w-5 text-primary"/></div>
                    <div className="text-left"><span className="block font-bold">Ver Logs</span><span className="text-xs opacity-70">Auditoría completa</span></div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* VISTA VETERINARIO*/}
      {userRole === "Veterinario" && vetData && (
        <div>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Mis Citas Hoy</CardTitle><Calendar className="h-4 w-4 text-muted-foreground"/></CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{vetData.citasHoy.total}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-orange-500"/> {vetData.citasHoy.pendientes} Pendientes</span>
                        <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1 text-green-500"/> {vetData.citasHoy.completadas} Listas</span>
                    </div>
                </CardContent>
             </Card>
             
             <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle><Users className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{vetData.totalPacientes}</div><p className="text-xs text-muted-foreground mt-1">Pacientes registrados</p></CardContent></Card>
             <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Stock Crítico</CardTitle><Pill className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{vetData.stockCritico}</div> <p className="text-xs text-muted-foreground mt-1">Productos bajo mínimo</p></CardContent></Card>
           </div>

          <div className="grid mt-6 gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Próximas Citas</CardTitle>
                <CardDescription>Agenda programada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(!vetData.proximasCitas || vetData.proximasCitas.length === 0) ? (
                    <p className="text-muted-foreground text-sm">No hay próximas citas pendientes.</p>
                  ) : (
                    vetData.proximasCitas.slice(0, 5).map((cita, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex gap-3 items-center">
                                <div className="bg-primary/10 p-1 px-2 rounded font-bold text-primary text-xs text-center min-w-[50px]">
                                    {formatTime(cita.fecha_cita)}
                                    <div className="text-[9px] font-normal text-muted-foreground">{formatDate(cita.fecha_cita)}</div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm">{cita.paciente}</span>
                                    <span className="text-xs text-muted-foreground">Dueño: {cita.dueno}</span>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[10px]">
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
                <CardTitle className="font-serif">Atajos</CardTitle>
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
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Citas Hoy</CardTitle><Calendar className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{receptionData.citasHoy.total}</div><p className="text-xs text-muted-foreground mt-1">Total programadas</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completadas</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{receptionData.citasHoy.completadas}</div> <p className="text-xs text-muted-foreground mt-1">Finalizadas con éxito</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Alertas Stock</CardTitle><Pill className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{receptionData.alertasStock}</div> <p className="text-xs text-muted-foreground mt-1">Atención requerida</p></CardContent></Card>            
          </div>

          <div className="grid mt-6 gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Pacientes Recientes</CardTitle>
                <CardDescription>Últimos registros ingresados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(receptionData.pacientesRecientes || []).map((paciente, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <PawPrint className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{paciente.nombre} <span className="text-xs text-muted-foreground">({paciente.especie} - {paciente.raza})</span></p>
                          <p className="text-xs text-muted-foreground">Dueño: {paciente.dueno}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium bg-secondary/10 text-secondary px-2 py-1 rounded">
                        {formatDate(paciente.creado_en)}
                      </span>
                    </div>
                  ))}
                  {(!receptionData.pacientesRecientes || receptionData.pacientesRecientes.length === 0) && (
                    <p className="text-sm text-muted-foreground">No hay registros recientes.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="font-serif">Accesos Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button className="justify-start h-auto p-4 w-full bg-primary/10 hover:bg-primary/20 hover:text-primary text-primary border border-primary/10" variant="ghost" onClick={() => onNavigate("appointments")}>
                  <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-full shadow-sm"><Calendar className="h-5 w-5 text-primary"/></div><div className="text-left"><span className="block font-bold">Agendar Cita</span><span className="text-xs opacity-70">Registrar visita</span></div></div>
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

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2"><Skeleton className="h-8 w-[250px] bg-gray-200" /></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-[120px] rounded-xl bg-gray-200" /><Skeleton className="h-[120px] rounded-xl bg-gray-200" /><Skeleton className="h-[120px] rounded-xl bg-gray-200" /><Skeleton className="h-[120px] rounded-xl bg-gray-200" /></div>
      <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-[300px] rounded-xl bg-gray-200" /><Skeleton className="h-[300px] rounded-xl bg-gray-200" /></div>
    </div>
  )
}