"use client"
import { ROUTES } from '../apiRoutes';
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarNav } from "@/components/sidebar-nav"
import { DashboardOverview } from "@/components/dashboard-overview"
import { PatientRecords } from "@/components/patient-records"
import { AppointmentScheduling } from "@/components/appointment-scheduling"
import { InventoryManagement } from "@/components/inventory-management"
import { BillingModule } from "../components/billing-module"
import { UserManagementDashboard } from "../components/Usuarios/user-dashboard"
import { useAuth } from '@/components/user-context'

export default function VetManagementHome() {
  const { usuario, token, setAuthInfo, clearAuthInfo } = useAuth()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<"Admin" | "Veterinario" | "Recepcionista" | null>(null)
  const [activeSection, setActiveSection] = useState("dashboard")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const [selectedRole, setSelectedRole] = useState<"Veterinario" | "Recepcionista">("Veterinario")

  const handleLogin = async () => {
    setLoginError(null)
    try {
      const response = await fetch(ROUTES.postLogin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo_electronico: email,
          contraseña: password,
        }),
      })
      const data = await response.json()
      if (response.ok && data.token) {
        setIsLoggedIn(true)
        setUserName(data.usuario.nombre_completo)
        setAuthInfo(data.token, data.usuario)
        switch (data.usuario.id_rol) {
          case 1:
            setUserRole("Admin")
            break
          case 2:
            setUserRole("Veterinario")
            break
          case 3:
            setUserRole("Recepcionista")
            break
          default:
            setUserRole(null)
        }
      } else {
        setLoginError(data.error || "Error al iniciar sesión")
      }
    } catch (error) {
      setLoginError("Error de conexión con el servidor")
    }
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    setActiveSection("dashboard")
    setEmail("")
    setPassword("")
    setLoginError(null)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen h-full bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-end space-x-1 mb-4">
            <div className="w-6 h-6 bg-secondary rounded"></div>
            <div className="w-6 h-6 bg-primary rounded"></div>
            <div className="w-6 h-6 bg-accent rounded"></div>
            <div className="w-6 h-6 bg-muted rounded"></div>
            <div className="w-6 h-6 bg-muted-foreground rounded"></div>
            <div className="w-6 h-6 bg-foreground rounded"></div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="font-serif font-black text-4xl text-accent">VetSync</h1>
            <p className="text-muted-foreground">Gestión profesional veterinaria</p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="font-serif font-bold text-primary">Inicio de Sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@dominio.com"
                  className="bg-background border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="**********"
                  className="bg-background border-border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {loginError && <p className="text-red-600 text-center">{loginError}</p>}

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                onClick={handleLogin}
                disabled={!email || !password}
              >
                Ingresar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen h-full bg-background flex">
      <SidebarNav userRole={userRole!} activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4">
              <h2 className="font-serif font-semibold text-lg capitalize">
                {activeSection === "dashboard"
                  ? "Panel Principal"
                  : activeSection === "appointments"
                  ? "Citas"
                  : activeSection === "patients"
                  ? "Pacientes"
                  : activeSection === "inventory"
                  ? "Inventario"
                  : activeSection === "billing"
                  ? "Facturación"
                  : activeSection}
              </h2>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Bienvenid@, {userRole === "Veterinario" ? "Dr." : ""} {userName}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-0 p-6">
          {activeSection === "dashboard" && userRole && <DashboardOverview userRole={userRole} />}

          {activeSection === "patients" && <PatientRecords />}

          {activeSection === "appointments" && <AppointmentScheduling />}

          {activeSection === "inventory" && <InventoryManagement />}

          {activeSection === "billing" && <BillingModule />}

          {activeSection === "users" && <UserManagementDashboard />}
          
          {activeSection === "logs" && <BillingModule />}

          {activeSection !== "dashboard" &&
            activeSection !== "patients" &&
            activeSection !== "appointments" &&
            activeSection !== "inventory" &&
            activeSection !== "billing" && 
            activeSection !== "users" && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-serif font-bold text-2xl text-foreground capitalize">{activeSection}</h1>
                  <p className="text-muted-foreground">Gestión de {activeSection} para su práctica veterinaria</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Próximamente</CardTitle>
                    <CardDescription>El módulo de {activeSection} está actualmente en desarrollo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Esta sección contendrá herramientas completas de gestión de {activeSection}.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
        </main>
      </div>
    </div>
  )
}
