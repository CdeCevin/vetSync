"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus } from "lucide-react"

interface UserFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedRole: string
  setSelectedRole: (role: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  onCreateUser: () => void
}

export function UserFilters({
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  onCreateUser,
}: UserFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className=" absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray/80"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px] border-gray/80">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="Veterinario">Veterinario</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Recepcionista">Recepcionista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-secondary hover:bg-secondary/80" onClick={onCreateUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}
