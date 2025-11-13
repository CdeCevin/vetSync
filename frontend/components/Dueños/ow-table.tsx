"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"

interface OwnerTableProps {
  owners: any[]
  onEditOwner: (owner: any) => void
  onDeleteOwner: (owner: any) => void
}

export function OwnerTable({ owners, onEditOwner, onDeleteOwner }: OwnerTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Dueños ({owners.length})</CardTitle>
        {owners.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">Sin resultados</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {owners.map((owner) => (
            <div key={owner.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/10">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {(owner.nombre || "")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{owner.nombre}</h3>
                  <p className="text-sm text-gray-500">{owner.correo}</p>
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
                    <DropdownMenuItem onClick={() => onEditOwner(owner)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteOwner(owner)} className="text-red-600">
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
