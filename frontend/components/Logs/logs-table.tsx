"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, ArrowRight, Clock, Shield, User, Calendar } from "lucide-react"
import { LogEntry } from "@/hooks/useLogService"

interface AuditListProps {
  logs: LogEntry[]
}

// Helper para visualizar los cambios
function DetailParser({ details }: { details: string }) {
  try {
    if (details.startsWith("{")) {
      const parsed = JSON.parse(details)
      return (
        <div className="bg-white p-4 rounded-md border border-slate-200 w-full">
          <p className="font-semibold mb-3 text-slate-800 text-sm flex items-center gap-2">
            Detalle de Cambios
          </p>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(parsed).map(([key, val]: [string, any]) => (
              <div key={key} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center py-2 border border-slate-100 last:border-0">
                <span className="col-span-1 md:col-span-2 font-medium capitalize text-slate-700 bg-slate-50 px-2 py-1 rounded text-sm">
                  {key}
                </span>
                
                <div className="col-span-1 md:col-span-10 flex items-center flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500 font-medium mr-1">Antes:</span>
                    <span className="line-through text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 break-all">
                      {val.anterior !== null ? String(val.anterior) : "Vacío"}
                    </span>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-slate-400 hidden md:block" />
                  
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500 font-medium mr-1">Ahora:</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-100 break-all">
                      {val.nuevo !== null ? String(val.nuevo) : "Vacío"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  } catch (e) {}
  
  // Fallback para texto plano
  return (
    <div className="bg-white p-4 rounded-md border border-slate-200 w-full">
      <p className="text-sm text-slate-600 italic">{details}</p>
    </div>
  )
}

export function AuditList({ logs }: AuditListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getActionColor = (action: string) => {
    if (action.includes("LOGIN")) return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
    if (action.includes("CREAR")) return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
    if (action.includes("MODIFICAR") || action.includes("EDITAR")) return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
    if (action.includes("ELIMINAR") || action.includes("CANCELAR")) return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
    return "bg-slate-50 text-slate-700 border-slate-200"
  }

  return (
    <Card className="shadow-none border-0 sm:border sm:shadow-sm">
      <CardHeader className="pb-2 border-b-0">
        <CardTitle>Historial de Movimientos ({logs.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {logs.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-10 text-slate-500">
             <Shield className="h-12 w-12 mb-3 opacity-20" />
             <p className="text-base text-slate-600">No se encontraron registros de auditoría.</p>
           </div>
        ) : (
          <div className="w-full">
            
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4 pl-2">Usuario / Email</div>
              <div className="col-span-2">Acción</div>
              <div className="col-span-3">Entidad</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="group transition-colors hover:bg-slate-50">
                  <div 
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer min-h-[5.5rem]"
                    onClick={() => toggleExpand(log.id)}
                  >
                    <div className="col-span-4 flex items-start gap-4 pr-2 overflow-hidden">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200 mt-1">
                        {log.usuario.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 justify-center">
                        <span className="font-semibold text-sm text-slate-900 leading-tight truncate mb-0.5" title={log.usuario}>
                          {log.usuario}
                        </span>
                        <span className="text-sm text-slate-500 truncate" title={log.correo_electronico}>
                          {log.correo_electronico}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 truncate uppercase">
                          {log.rol}
                        </span>
                      </div>
                    </div>

                    {/* ACCIÓN */}
                    <div className="col-span-2 flex items-center justify-start">
                      <Badge variant="outline" className={`font-medium text-xs py-1 px-3 shadow-none rounded-md uppercase ${getActionColor(log.accion)}`}>
                        {log.accion.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    {/* ENTIDAD */}
                    <div className="col-span-3 flex items-center justify-start">
                      <span className="font-medium text-sm text-slate-700 mr-2 truncate">{log.entidad} #{log.id_entidad}</span> 
                    </div>

                    {/* FECHA */}
                    <div className="col-span-2 flex flex-col justify-center items-start pl-0">
                      <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-0.5">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {new Date(log.fecha).toLocaleDateString()}
                      </div>
                      <span className="text-xs text-slate-400 pl-6">
                          {new Date(log.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>

                    {/*CHEVRON */}
                    <div className="col-span-1 flex justify-end pr-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600">
                        {expandedId === log.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>

                  {/* DETALLES EXPANDIDOS*/}
                  {expandedId === log.id && (
                    <div className="bg-slate-50/50 border-t border-slate-200 animate-in fade-in duration-200">
                      <div className="p-6 w-full">
                        <DetailParser details={log.detalles} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}