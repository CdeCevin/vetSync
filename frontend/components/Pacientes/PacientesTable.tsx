"use client"

import { Button } from "@/components/ui/button"
// 🎨 Importaciones estéticas de shadcn/ui y lucide-react
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"

interface Paciente {
   id: number
   nombre: string
   raza: string
   dueno: {
      nombre: string
   }
}

interface PacientesTableProps {
   pacientes: Paciente[]
   onEdit: (paciente: Paciente) => void
   onDelete: (id: number) => void
  isTableLoading: boolean // Para deshabilitar acciones mientras se carga
}

export function PacientesTable({ pacientes, onEdit, onDelete, isTableLoading }: PacientesTableProps) {
   return (
    // 🎨 Envolvemos la tabla en un borde redondeado
    <div className="rounded-md border">
        <Table>
           <TableHeader>
              <TableRow>
                 <TableHead>Nombre</TableHead>
                 <TableHead>Raza</TableHead>
                 <TableHead>Dueño</TableHead>
                 <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
           </TableHeader>
           <TableBody>
              {pacientes.length > 0 ? (
            pacientes.map((paciente) => (
                   <TableRow key={paciente.id}>
                      <TableCell className="font-medium">{paciente.nombre}</TableCell>
                      <TableCell>{paciente.raza}</TableCell>
                      <TableCell>{paciente.dueno.nombre}</TableCell>
                      <TableCell className="text-right">
                  {/* 🎨 Menú de acciones (estilo shadcn) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" disabled={isTableLoading}>
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(paciente)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(paciente.id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                      </TableCell>
                   </TableRow>
                ))
          ) : (
            // 🎨 Mensaje de "no hay datos"
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No se encontraron pacientes.
              </TableCell>
            </TableRow>
          )}
           </TableBody>
        </Table>
    </div>
   )
}