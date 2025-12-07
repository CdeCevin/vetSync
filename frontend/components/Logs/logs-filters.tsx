"use client"

import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface AuditFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedAction: string
  setSelectedAction: (action: string) => void
  dateStart: string
  setDateStart: (date: string) => void
  dateEnd: string
  setDateEnd: (date: string) => void
  uniqueActions: string[]
}

export function AuditFilters({
  searchTerm,
  setSearchTerm,
  selectedAction,
  setSelectedAction,
  dateStart,
  setDateStart,
  dateEnd,
  setDateEnd,
  uniqueActions
}: AuditFiltersProps) {
  
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedAction("all")
    setDateStart("")
    setDateEnd("")
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <div className="relative flex-1 sm:min-w-[320px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por usuario o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipo de Acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto xl:ml-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-gray-500 whitespace-nowrap font-medium">Desde:</span>
              <Input 
                type="date" 
                value={dateStart} 
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full sm:w-auto" 
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-gray-500 whitespace-nowrap font-medium">Hasta:</span>
              <Input 
                type="date" 
                value={dateEnd} 
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>
            
            {(searchTerm || selectedAction !== "all" || dateStart || dateEnd) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary hover:text-primary hover:bg-primary/20 whitespace-nowrap">
                <X className="h-4 w-4 mr-2" /> Limpiar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}