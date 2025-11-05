"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"

const roleColors = {
  Veterinario: "bg-blue-100 text-blue-800",
  Administrador: "bg-purple-100 text-purple-800",
  Recepcionista: "bg-orange-100 text-orange-800",
}

const rolMap: Record<number, string> = {
  1: "Administrador",
  2: "Veterinario",
  3: "Recepcionista",
}
interface UserTableProps {
  users: any[]
  onEditUser: (user: any) => void
  onDeleteUser: (user: any) => void
}

export function OwnerTable({ users, onEditUser, onDeleteUser }: UserTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Usuarios ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/10">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {(user.nombre_completo || "")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{user.nombre_completo}</h3>
                  <p className="text-sm text-gray-500">{user.correo_electronico}</p>
                  <p className="text-xs text-gray-400">{rolMap[user.id_rol]}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditUser(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteUser(user)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
