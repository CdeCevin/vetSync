"use client"

import { useEffect, useState } from "react"
import { useTratamientoService } from "@/hooks/useTratamientoService"
import { Tratamiento } from "./tratamiento"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Pill, Clock, Trash2, CheckCircle } from "lucide-react"
import { TratamientoFormModal } from "./TratamientoFormModal"
import { useAlertStore } from "@/hooks/use-alert-store"
import { useAuth } from "@/components/user-context"
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal"

export function TratamientosPage() {
  const { tratamientos, cargarTratamientos, crearTratamiento, actualizarTratamiento } = useTratamientoService()
  const { onOpen: openAlert } = useAlertStore()
  const { usuario } = useAuth()
  
  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<Tratamiento | null>(null)
  const [busqueda, setBusqueda] = useState("")

  // Estados para Modal de Eliminación/Cancelación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [tratamientoAEliminar, setTratamientoAEliminar] = useState<Tratamiento | null>(null)

  useEffect(() => {
    cargarTratamientos()
  }, [cargarTratamientos])

  // Filtrado
  const filteredTratamientos = tratamientos.filter(t => 
    (t.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.medicamento.toLowerCase().includes(busqueda.toLowerCase())) &&
    t.estado !== "Cancelado" // Ocultar los cancelados de la vista principal
  )

  // Función auxiliar para verificar propiedad
  const esCreador = (t: Tratamiento) => {
    return usuario && String(usuario.id) === String(t.veterinarioId)
  }


  const handleCreateOrUpdate = async (data: any) => {
    try {
        if (tratamientoSeleccionado) {
           
            await actualizarTratamiento(tratamientoSeleccionado.id, data)
            openAlert("Éxito", "Tratamiento modificado correctamente", "success")
        } else {
            await crearTratamiento(data)
            openAlert("Éxito", "Tratamiento prescrito correctamente", "success")
        }
        setIsModalOpen(false)
        setTratamientoSeleccionado(null)
    } catch (error: any) {
        openAlert("Error", error.message || "No se pudo guardar el tratamiento", "error")
    }
  }

  const handleEditClick = (t: Tratamiento) => {
      setTratamientoSeleccionado(t)
      setIsModalOpen(true)
  }

  const handleFinalizarClick = async (t: Tratamiento) => {
      
      await actualizarTratamiento(t.id, { estado: "Completado" })
      openAlert("Completado", `El tratamiento de ${t.pacienteNombre} ha finalizado.`, "success")
  }

  // Preparar eliminación 
  const handleDeleteClick = (t: Tratamiento) => {
      setTratamientoAEliminar(t)
      setIsDeleteModalOpen(true)
  }

  // Confirmar eliminación 
  const onConfirmDelete = async () => {
      if (!tratamientoAEliminar) return
      await actualizarTratamiento(tratamientoAEliminar.id, { estado: "Cancelado" })
  }

  const onDeleteSuccess = () => {
      cargarTratamientos()
      setTratamientoAEliminar(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="font-serif font-bold text-2xl">Gestión de Tratamientos</h1>
            <p className="text-muted-foreground">Prescripciones y seguimiento médico</p>
        </div>
        <Button onClick={() => { setTratamientoSeleccionado(null); setIsModalOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Tratamiento
        </Button>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-lg">Listado de Prescripciones</CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar paciente o medicamento..." 
                        className="pl-8" 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Medicamento / Dosis</TableHead>
                        <TableHead>Instrucciones</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTratamientos.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                No se encontraron tratamientos activos.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredTratamientos.map(t => (
                            <TableRow key={t.id}>
                                <TableCell>
                                    <div className="font-medium">{t.pacienteNombre}</div>
                                    <div className="text-xs text-muted-foreground">Vet: {t.veterinarioNombre}</div>
                                    {t.editado && <Badge variant="outline" className="text-[10px] mt-1 border-blue-200 text-blue-700">Editado</Badge>}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Pill className="h-4 w-4 text-blue-500" /> {t.medicamento}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{t.dosis}</div>
                                </TableCell>
                                <TableCell className="max-w-xs truncate text-sm" title={t.instrucciones}>
                                    {t.instrucciones}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm">
                                        <Clock className="h-3 w-3" /> {t.duracionDias} días
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(t.fechaPrescripcion).toLocaleDateString()}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={t.estado === 'Activo' ? 'default' : 'secondary'} className={t.estado === 'Activo' ? 'bg-green-100 text-green-800' : ''}>
                                        {t.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {/* Lógica de Permisos: Solo el creador ve las opciones */}
                                    {t.estado === 'Activo' && esCreador(t) && (
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(t)} title="Editar Tratamiento">
                                                <FileText className="h-4 w-4 text-gray-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleFinalizarClick(t)} title="Marcar Completado">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(t)} title="Cancelar Tratamiento">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    )}
                                    {/* Si no es creador o no está activo, no se muestran las acciones - solo lectura */}
                                    {!esCreador(t) && t.estado === 'Activo' && (
                                        <span className="text-xs text-muted-foreground italic">Solo lectura</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Modal de Crear/Editar */}
      <TratamientoFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        tratamientoEditar={tratamientoSeleccionado}
      />

      {/* Modal de Confirmación de Eliminación/Cancelación */}
      {tratamientoAEliminar && (
        <DeleteConfirmModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={onConfirmDelete}
            onSuccess={onDeleteSuccess}
            mensajeConf={<>¿Estás seguro de que deseas cancelar el tratamiento de <b>{tratamientoAEliminar.pacienteNombre}</b>?</>}
            mensajeEx="El tratamiento ha sido cancelado correctamente."
        />
      )}
    </div>
  )
}