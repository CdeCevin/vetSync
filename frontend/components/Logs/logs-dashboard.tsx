"use client"

import { useEffect, useState, useMemo } from "react"
import { AuditFilters } from "./logs-filters"
import { AuditList } from "./logs-table"
import { useLogService } from "@/hooks/useLogService"

export function AuditDashboard() {
  const { logs, loading, getLogs } = useLogService()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAction, setSelectedAction] = useState("all")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")

  useEffect(() => {
    getLogs()
  }, [getLogs])

  // Lógica de filtrado en frontend
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      //  Filtro Texto
      const matchesSearch =
        log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.correo_electronico.toLowerCase().includes(searchTerm.toLowerCase())
      
      //  Filtro Acción
      const matchesAction =
        selectedAction === "all" || log.accion === selectedAction
      
      //  Filtro Fecha
      let matchesDate = true
      if (dateStart || dateEnd) {
        const logDate = new Date(log.fecha).getTime()
        const start = dateStart 
          ? new Date(`${dateStart}T00:00:00`).getTime() 
          : 0
          
        const end = dateEnd 
          ? new Date(`${dateEnd}T23:59:59`).getTime() 
          : Infinity

        if (logDate < start || logDate > end) {
          matchesDate = false
        }
      }

      return matchesSearch && matchesAction && matchesDate
    })
  }, [logs, searchTerm, selectedAction, dateStart, dateEnd])

  const uniqueActions = useMemo(() => 
    Array.from(new Set(logs.map(log => log.accion))), 
  [logs])

  return (
    <div className="min-h-screen">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="font-serif font-bold text-2xl">Auditoría del Sistema</h1>
            <p className="text-gray-600">Registro detallado de acciones y seguridad.</p>
          </div>

          <AuditFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            dateStart={dateStart}
            setDateStart={setDateStart}
            dateEnd={dateEnd}
            setDateEnd={setDateEnd}
            uniqueActions={uniqueActions}
          />

          {loading ? (
            <div className="text-center py-10">Cargando registros...</div>
          ) : (
            <AuditList logs={filteredLogs} />
          )}
          
        </main>
      </div>
    </div>
  )
}