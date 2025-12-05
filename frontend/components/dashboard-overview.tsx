import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Package, FileClock, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { useAuth } from '@/components/user-context'
import { useState } from "react"


interface DashboardOverviewProps {
  userRole: "Admin" | "Veterinario" | "Recepcionista"
}


export function DashboardOverview({ userRole }: DashboardOverviewProps) {
  const { usuario, token, setAuthInfo, clearAuthInfo } = useAuth()
  const [usuariosActivos] = useState(247)
  const [ultimosCambios] = useState(156)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-foreground">
          {userRole === "Veterinario" ? `Bienvenido Dr. ${usuario?.nombre_completo}` : `Bienvenid@, ${usuario?.nombre_completo}`}
        </h1>
        <p className="text-muted-foreground">Esto es lo que está pasando hoy</p>
      </div>

      {userRole === "Admin" && (
        <div >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{usuariosActivos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Últimos Cambios</CardTitle>
                <FileClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{ultimosCambios}</div>
                <div className="flex items-center space-x-2 text-xs">

                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones Rápidas */}
          <div className="grid mt-6 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Actividad Reciente</CardTitle>
                <CardDescription>Últimas actualizaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Usuario creado</p>
                    <p className="text-xs text-muted-foreground">Admin - Juan Pérez</p>
                  </div>
                  <span className="text-xs text-muted-foreground">hace 2 minutos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cambio de permisos</p>
                    <p className="text-xs text-muted-foreground">Recepcionista - María López</p>
                  </div>
                  <span className="text-xs text-muted-foreground">hace 15 minutos</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Acciones Rápidas</CardTitle>
                <CardDescription>Tareas comunes para administradores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button className="justify-start h-auto p-4">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-serif font-semibold">Crear Usuario</span>
                      <span className="text-xs opacity-80">Agregar un nuevo usuario al sistema</span>
                    </div>
                  </Button>
                  <Button variant="secondary" className="justify-start h-auto p-4">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-serif font-semibold">Administrar Usuarios</span>
                      <span className="text-xs opacity-80">Editar o eliminar usuarios existentes</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-serif font-semibold">Últimos Cambios</span>
                      <span className="text-xs opacity-80">Visualizar cambios recientes</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {userRole === "Veterinario" && (
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citas de Hoy</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>9 completadas</span>
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span>3 pendientes</span>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">247</div>
                <p className="text-xs text-muted-foreground">+12 nuevos este mes</p>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado del Inventario</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">156</div>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge variant="destructive" className="text-xs">
                    5 Bajo Stock
                  </Badge>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tareas Urgentes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">3</div>
                <p className="text-xs text-muted-foreground">Requieren de atención inmediata</p>
              </CardContent>
            </Card>
          </div>


          {/* Recent Activity & Quick Actions */}
          <div className="grid mt-6 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Actividad Reciente</CardTitle>
                <CardDescription>Últimas actualizaciones de su consulta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cita completada</p>
                    <p className="text-xs text-muted-foreground">Bella (Golden Retriever) - Vacunación</p>
                  </div>
                  <span className="text-xs text-muted-foreground">hace 2 minutos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Alerta de bajo inventario</p>
                    <p className="text-xs text-muted-foreground">Vacuna de rabia - 3 unidades restantes</p>
                  </div>
                  <span className="text-xs text-muted-foreground">hace 15 minutos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nueva cita programada</p>
                    <p className="text-xs text-muted-foreground">Max (Pastor Alemán) - Chequeo</p>
                  </div>
                  <span className="text-xs text-muted-foreground">hace 1 hora</span>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Acciones Rápidas</CardTitle>
                <CardDescription>Tareas comunes para doctores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button className="justify-start h-auto p-4">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-serif font-semibold">Programar Cita</span>
                      <span className="text-xs opacity-80">Agendar visita para nuevo paciente</span>
                    </div>
                  </Button>
                  <Button variant="secondary" className="justify-start h-auto p-4">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-serif font-semibold">Buscar Paciente</span>
                      <span className="text-xs opacity-80">Buscar registros médicos</span>
                    </div>
                  </Button>
                  {userRole === "Veterinario" && (
                    <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                      <div className="flex flex-col items-start space-y-1">
                        <span className="font-serif font-semibold">Agregar Tratamiento</span>
                        <span className="text-xs opacity-80">Registrar nuevo tratamiento</span>
                      </div>
                    </Button>
                  )}
                  <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-serif font-semibold">Enviar Mensaje</span>
                      <span className="text-xs opacity-80">Contactar al dueño de la mascota</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {userRole === "Recepcionista" && (
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">247</div>
                <p className="text-xs text-muted-foreground">+12 nuevos este mes</p>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado del Inventario</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">156</div>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge variant="destructive" className="text-xs">
                    5 Bajo Stock
                  </Badge>
                </div>
              </CardContent>
            </Card>

          </div>


          {/* Recent Activity & Quick Actions */}
          <div className="grid mt-6 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Actividad Reciente</CardTitle>
                <CardDescription>Últimas actualizaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cita completada</p>
                    <p className="text-xs text-muted-foreground">Bella (Golden Retriever) - Vacunación</p>
                  </div>
                  <span className="text-xs text-muted-foreground">hace 2 minutos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Alerta de bajo inventario</p>
                    <p className="text-xs text-muted-foreground">Vacuna de rabia - 3 unidades restantes</p>
                  </div>
                  <span className="text-xs text-muted-foreground">hace 15 minutos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nueva cita programada</p>
                    <p className="text-xs text-muted-foreground">Max (Pastor Alemán) - Chequeo</p>
                  </div>
                  <span className="text-xs text-muted-foreground">hace 1 hora</span>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Acciones Rápidas</CardTitle>
                <CardDescription>Tareas comunes para recepcionistas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button className="justify-start h-auto p-4">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-serif font-semibold">Programar Cita</span>
                      <span className="text-xs opacity-80">Agendar visita para nuevo paciente</span>
                    </div>
                  </Button>
                  <Button variant="secondary" className="justify-start h-auto p-4">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-serif font-semibold">Buscar Paciente</span>
                      <span className="text-xs opacity-80">Buscar registros médicos</span>
                    </div>
                  </Button>

                  <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-serif font-semibold">Actualizar Inventario</span>
                      <span className="text-xs opacity-80">Ingresar movimientos de inventario recientes</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Key Metrics */}

    </div>
  )
}
