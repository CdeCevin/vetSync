"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Users, FileText, Package, CreditCard, Settings, Home, Stethoscope, UsersRound, FileClock } from "lucide-react"

interface SidebarNavProps {
  userRole: "Admin" | "Veterinario" | "Recepcionista"
  activeSection: string
  onSectionChange: (section: string) => void
}

export function SidebarNav({ userRole, activeSection, onSectionChange }: SidebarNavProps) {
  const navigationItems = [
    {
      title: "Panel Principal",
      icon: Home,
      id: "dashboard",
      roles: ["Veterinario", "Recepcionista"],
    },
    {
      title: "Citas",
      icon: Calendar,
      id: "appointments",
      roles: ["Veterinario", "Recepcionista"],
    },
    {
      title: "Pacientes",
      icon: Users,
      id: "patients",
      roles: ["Veterinario", "Recepcionista"],
    },
    {
      title: "Historiales Médicos",
      icon: FileText,
      id: "records",
      roles: ["Veterinario"],
    },
    {
      title: "Tratamientos",
      icon: Stethoscope,
      id: "treatments",
      roles: ["Veterinario"],
    },
    {
      title: "Inventario",
      icon: Package,
      id: "inventory",
      roles: ["Veterinario", "Recepcionista"],
    },
    {
      title: "Facturación",
      icon: CreditCard,
      id: "billing",
      roles: ["Recepcionista"],
    },
    {
      title: "Configuración",
      icon: Settings,
      id: "settings",
      roles: ["Veterinario", "Recepcionista"],
    },
    {
      title: "Usuarios",
      icon: UsersRound,
      id: "users",
      roles: ["Admin"],
    },
    {
      title: "Logs",
      icon: FileClock,
      id: "logs",
      roles: ["Admin"],
    }
  ]

  const filteredItems = navigationItems.filter((item) => item.roles.includes(userRole))

  return (
    <div className="h-screen w-64 flex flex-col bg-card border-r">
      <div className="p-6">
        <img src="/LOGO_T.png" alt="VetSync Logo" className="h-10 w-auto" />
        <p className="text-sm text-muted-foreground mt-1">Gestión veterinaria profesional</p>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-3">
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  activeSection === item.id && "bg-secondary text-secondary-foreground",
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <div className="text-xs text-muted-foreground">
        Conectado como{" "}
        {userRole === "Admin" ? "Administrador" : userRole === "Veterinario" ? "Veterinario" : "Recepcionista"}
</div>
      </div>
    </div>
  )
}
