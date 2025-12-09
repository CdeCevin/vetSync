"use client"

import { useState, useEffect } from "react"
import { useHistorialService } from "@/hooks/useHistorialService"
import { HistorialFormModal } from "./historialModal"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Search, Plus, Calendar, User, Stethoscope, ChevronDown, ChevronUp, 
  Syringe, Pill, FileText, PawPrint, Edit, Trash2, Save, Contact
} from "lucide-react"
import { useAlertStore } from "@/hooks/use-alert-store"
import { HistorialMedico, Procedimiento } from "./historial"
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal"

export function HistorialDashboard() {
  const { 
    historiales, loading, cargarHistoriales, crearHistorial, 
    agregarProcedimiento, editarProcedimiento, eliminarProcedimiento 
  } = useHistorialService()
  console.log(historiales)
  
  const { onOpen: openAlert } = useAlertStore()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isMainModalOpen, setIsMainModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Estados para procedimientos
  const [procModalOpen, setProcModalOpen] = useState(false)
  const [procToDelete, setProcToDelete] = useState<Procedimiento | null>(null)
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null)
  const [procFormData, setProcFormData] = useState<{ id?: number, nombre: string, notas: string }>({ nombre: "", notas: "" })
  const [isEditingProc, setIsEditingProc] = useState(false)

  useEffect(() => {
    cargarHistoriales()
  }, [cargarHistoriales])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    cargarHistoriales(searchTerm)
  }

  const handleCreateHistorial = async (data: any) => {
    try {
      await crearHistorial(data)
      openAlert("Éxito", "Consulta registrada correctamente", "success")
      setIsMainModalOpen(false)
    } catch (err: any) {
      openAlert("Error", err.message || "No se pudo registrar la consulta", "error")
    }
  }

  // GESTIÓN PROCEDIMIENTOS
  const openAddProcModal = (historialId: number) => {
    setCurrentHistoryId(historialId)
    setProcFormData({ nombre: "", notas: "" })
    setIsEditingProc(false)
    setProcModalOpen(true)
  }

  const openEditProcModal = (proc: Procedimiento) => {
    setProcFormData({ id: proc.id, nombre: proc.nombre_procedimiento, notas: proc.notas || "" })
    setIsEditingProc(true)
    setProcModalOpen(true)
  }

  const handleProcSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditingProc && procFormData.id) {
        await editarProcedimiento(procFormData.id, {
          nombre_procedimiento: procFormData.nombre,
          notas: procFormData.notas
        })
        openAlert("Actualizado", "Procedimiento actualizado", "success")
      } else if (currentHistoryId) {
        await agregarProcedimiento({
          id_historial_medico: currentHistoryId,
          nombre_procedimiento: procFormData.nombre,
          notas: procFormData.notas
        })
        openAlert("Creado", "Procedimiento agregado al historial", "success")
      }
      setProcModalOpen(false)
    } catch (err: any) {
      openAlert("Error", err.message, "error")
    }
  }

  const confirmDeleteProc = async () => {
    if (!procToDelete) return
    try {
      await eliminarProcedimiento(procToDelete.id)
      setProcToDelete(null)
      openAlert("Eliminado", "Procedimiento eliminado", "success")
    } catch (err: any) {
      openAlert("Error", err.message, "error")
    }
  }

  const getDiagnosticoColor = (diag: string) => {
    const d = diag.toLowerCase()
    if (d.includes("vacuna")) return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
    if (d.includes("cirug") || d.includes("operacion")) return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
    if (d.includes("control") || d.includes("sano")) return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
    return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
  }

  const getNombrePaciente = (h: HistorialMedico) => h.paciente_nombre || h.paciente?.nombre || "Desconocido"
  const getNombreDueno = (h: HistorialMedico) => h.dueño_nombre || "Desconocido"

  const getNombreVeterinario = (h: HistorialMedico) => h.veterinario_nombre || h.veterinario || "Desconocido"
  const getFecha = (h: HistorialMedico) => h.fecha_visita || (h as any).fecha

  return (
    <div className="p-6 space-y-6 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-slate-900">Historial Médico</h1>
          <p className="text-muted-foreground">Gestión de consultas y procedimientos clínicos.</p>
        </div>
        <Button onClick={() => setIsMainModalOpen(true)} className="bg-[#066357] hover:bg-[#055046] text-white shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Nueva Consulta
        </Button>
      </div>

      {/* Busqueda */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por procedimiento, diagnóstico o paciente..." 
                className="pl-10 border-slate-200 focus:border-[#066357] focus:ring-[#066357]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="ghost" className=" bg-secondary/80 text-white border border-slate-200 hover:bg-secondary">
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Listado */}
      <div className="space-y-4">
        {loading ? (
           <div className="flex justify-center py-12">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#066357]"></div>
           </div>
        ) : historiales.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-300">
             <Stethoscope className="h-12 w-12 mx-auto text-slate-300 mb-3" />
             <h3 className="text-lg font-medium text-slate-900">No hay registros</h3>
             <p className="text-slate-500">No se encontraron consultas con los filtros actuales.</p>
           </div>
        ) : (
          historiales.map((historial) => (
            <Card key={historial.id} className="group border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden ">
              <div 
                className="flex items-center justify-between p-5 md:p-6 cursor-pointer"
                onClick={() => setExpandedId(expandedId === historial.id ? null : historial.id)}
              >
                <div className="flex items-center gap-50 flex-1 min-w-0 mr-4">
                  
                  {/* paciente */}
                  <div className="flex items-center gap-4 shrink-0">
                     <div className="h-10 w-10 shrink-0 rounded-full bg-[#066357]/10 flex items-center justify-center text-[#066357]">
                       <PawPrint className="h-5 w-5" />
                     </div>
                     <div className="flex flex-col min-w-[120px] max-w-[200px]">
                       <span className="font-bold text-base text-slate-900 truncate" title={getNombrePaciente(historial)}>
                         {getNombrePaciente(historial)}
                       </span>
                       <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                        <Contact className="h-3.5 w-3.5 text-slate-400" /> 
                        <span>{getNombreDueno(historial).split(" ")[0]} {getNombreDueno(historial).split(" ")[1]}</span>
                     </div>
                     </div>
                  </div>

                  {/* diagnostico y vet */}
                  <div className="flex flex-col items-left min-w-0 shrink-0 pt-1 ml-5">
                     <div className="flex items-left gap-2 mb-1.5">
                       <Badge variant="outline" className={`${getDiagnosticoColor(historial.diagnostico)} px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide`}>
                          {historial.diagnostico}
                       </Badge>
                     </div>
                     <div className="flex items-left gap-1.5 text-xs text-slate-500 truncate">
                        <User className="h-3.5 w-3.5 text-slate-400" /> 
                        <span>Dr/a. {getNombreVeterinario(historial)}</span>
                     </div>
                  </div>
                </div>

                {/* fecha y chevron*/}
                <div className="flex items-center gap-5 shrink-0"> 
                  <div className="flex flex-col items-end text-right">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 text-sm">
                      <Calendar className="h-4 w-4 text-[#066357]" />
                      {new Date(getFecha(historial)).toLocaleDateString()}
                    </div>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {new Date(getFecha(historial)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 group-hover:text-slate-500 shrink-0 hover:bg-slate-100 rounded-full">
                    {expandedId === historial.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
                </div>

              </div>

              {/* detalles */}
              {expandedId === historial.id && (
                <div className="bg-white/70 border-t border-slate-100 p-6 md:p-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                      <FileText className="h-3.5 w-3.5 " /> Notas Clínicas
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-full">
                      <p className="text-sm text-slate-700 leading-relaxed italic text-slate-600 break-words">
                        {historial.notas_generales || "Sin notas registradas."}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* proc*/}
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Syringe className="h-4 w-4 text-secondary" /> Procedimientos
                        </h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 font-medium"
                          onClick={() => openAddProcModal(historial.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Agregar
                        </Button>
                      </div>

                      <div className="space-y-3 flex-1">
                        {historial.procedimientos && historial.procedimientos.length > 0 ? (
                          historial.procedimientos.map((proc, idx) => {
                            const isObject = typeof proc !== 'string';
                            const nombre = isObject ? proc.nombre_procedimiento : proc;
                            const notas = isObject ? proc.notas : null;
                            
                            return (
                              <div key={isObject ? proc.id : idx} className="group/proc bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 break-words">{nombre}</p>
                                  {notas && <p className="text-xs text-slate-500 mt-1 pl-2 border-l-2 border-slate-200 break-words">{notas}</p>}
                                </div>
                                
                                {isObject && (
                                  <div className="flex gap-1 opacity-0 group-hover/proc:opacity-100 transition-opacity duration-200 shrink-0">
                                    <Button 
                                      variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-primary/10"
                                      onClick={() => openEditProcModal(proc)}
                                      title="Editar"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button 
                                      variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => setProcToDelete(proc)}
                                      title="Eliminar"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-sm text-slate-400 italic p-4 text-center bg-slate-100/50 rounded-lg border border-dashed border-slate-200 h-full flex items-center justify-center">
                              Ninguno realizado.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* tratameintos */}
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Pill className="h-7 w-4 text-emerald-700" /> Tratamientos
                        </h4>
                      </div>

                      <div className="space-y-3 flex-1">
                        {historial.tratamientos && historial.tratamientos.length > 0 ? (
                          historial.tratamientos.map((trat, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3 hover:border-emerald-200/10 transition-colors">
                              <div className="mt-1 h-2 w-2 rounded-full bg-secondary/50 shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 break-words">{trat.medicamento_nombre || "Medicamento"}</p>
                                <div className="text-xs text-slate-600 mt-0.5 font-medium bg-secondary/10 text-emerald-700 px-2 py-0.5 rounded inline-block">
                                  {trat.dosis}
                                </div>
                                {trat.instrucciones && (
                                    <p className="text-xs text-slate-500 italic mt-1 break-words">{trat.instrucciones}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-slate-400 italic p-4 text-center bg-slate-100/50 rounded-lg border border-dashed border-slate-200 h-full flex items-center justify-center">
                              Ningún tratamiento.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <HistorialFormModal 
        isOpen={isMainModalOpen}
        onClose={() => setIsMainModalOpen(false)}
        onSubmit={handleCreateHistorial}
      />

      <Dialog open={procModalOpen} onOpenChange={setProcModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditingProc ? "Editar Procedimiento" : "Agregar Procedimiento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProcSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Procedimiento</Label>
              <Input 
                value={procFormData.nombre} 
                onChange={e => setProcFormData({...procFormData, nombre: e.target.value})} 
                required 
                placeholder="Ej: Limpieza dental"
              />
            </div>
            <div className="space-y-2">
              <Label>Notas / Observaciones</Label>
              <Input 
                value={procFormData.notas} 
                onChange={e => setProcFormData({...procFormData, notas: e.target.value})} 
                placeholder="Detalles de la intervención..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProcModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#066357] hover:bg-[#055046]">
                <Save className="w-4 h-4 mr-2" /> Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {procToDelete && (
        <DeleteConfirmModal
          isOpen={!!procToDelete}
          onClose={() => setProcToDelete(null)}
          onConfirm={confirmDeleteProc}
          mensajeConf={<>¿Eliminar el procedimiento <b>{procToDelete.nombre_procedimiento}</b>?</>}
          mensajeEx="Procedimiento eliminado."
          onSuccess={() => {}} 
        />
      )}

    </div>
  )
}