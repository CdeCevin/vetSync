"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Users, FileText, Package, CreditCard, Settings, Home, Stethoscope } from "lucide-react"

interface SidebarNavProps {
  userRole: "veterinarian" | "receptionist"
  activeSection: string
  onSectionChange: (section: string) => void
}

export function SidebarNav({ userRole, activeSection, onSectionChange }: SidebarNavProps) {
  const navigationItems = [
    {
      title: "Panel Principal",
      icon: Home,
      id: "dashboard",
      roles: ["veterinarian", "receptionist"],
    },
    {
      title: "Citas",
      icon: Calendar,
      id: "appointments",
      roles: ["veterinarian", "receptionist"],
    },
    {
      title: "Pacientes",
      icon: Users,
      id: "patients",
      roles: ["veterinarian", "receptionist"],
    },
    {
      title: "Historiales Médicos",
      icon: FileText,
      id: "records",
      roles: ["veterinarian"],
    },
    {
      title: "Tratamientos",
      icon: Stethoscope,
      id: "treatments",
      roles: ["veterinarian"],
    },
    {
      title: "Inventario",
      icon: Package,
      id: "inventory",
      roles: ["veterinarian", "receptionist"],
    },
    {
      title: "Facturación",
      icon: CreditCard,
      id: "billing",
      roles: ["receptionist"],
    },
    {
      title: "Configuración",
      icon: Settings,
      id: "settings",
      roles: ["veterinarian", "receptionist"],
    },
  ]

  const filteredItems = navigationItems.filter((item) => item.roles.includes(userRole))

  return (
    <div className="h-screen w-64 flex flex-col bg-card border-r">
      <div className="p-6">
        <h2 className="font-serif font-black text-xl text-primary">VetSync</h2>
        <p className="text-sm text-muted-foreground mt-1">Gestión profesional veterinaria</p>
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
          Conectado como {userRole === "veterinarian" ? "Veterinario" : "Recepcionista"}
        </div>
      </div>
    </div>
  )
}
