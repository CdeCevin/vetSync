"use client"

import { useEffect, useState } from "react"
import { useTratamientoService } from "@/hooks/useTratamientoService"
import { Tratamiento } from "./tratamiento"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Pill, Clock, Trash2, Edit } from "lucide-react"
import { TratamientoFormModal } from "./TratamientoFormModal"
import { useAlertStore } from "@/hooks/use-alert-store"
import { useAuth } from "@/components/user-context"
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal"

export function TratamientosPage() {
  const { tratamientos, cargarTratamientos, crearTratamiento, actualizarTratamiento, eliminarTratamiento } = useTratamientoService()
  const { onOpen: openAlert } = useAlertStore()
  const { usuario } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<Tratamiento | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [tratamientoAEliminar, setTratamientoAEliminar] = useState<Tratamiento | null>(null)

  useEffect(() => {
    cargarTratamientos()
  }, [cargarTratamientos])


  const filteredTratamientos = tratamientos.filter(t => 
    (t.pacienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.medicamento.toLowerCase().includes(busqueda.toLowerCase()))
  )

  const esCreador = (t: Tratamiento) => {
    return usuario && Number(usuario.id) === Number(t.veterinarioId)
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

  const handleDeleteClick = (t: Tratamiento) => {
      setTratamientoAEliminar(t)
      setIsDeleteModalOpen(true)
  }

  const onConfirmDelete = async () => {
      if (!tratamientoAEliminar) return
      try {
        await eliminarTratamiento(tratamientoAEliminar.id)
        setIsDeleteModalOpen(false)
        onDeleteSuccess()
      } catch (error) {
        openAlert("Error", "No se pudo eliminar", "error")
      }
  }

  const onDeleteSuccess = () => {
      setTratamientoAEliminar(null)
      openAlert("Eliminado", "El tratamiento ha sido eliminado.", "success")
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
                                    {t.editado && <Badge variant="outline" className="text-[10px] mt-1 border-blue-200 text-primary">Editado</Badge>}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Pill className="h-4 w-4 text-primary" /> {t.medicamento}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{t.dosis}</div>
                                </TableCell>
                                <TableCell className="max-w-xs truncate text-sm" title={t.instrucciones}>
                                    {t.instrucciones ? t.instrucciones : <p className="italic text-primary/40">Sin registros</p> }
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
                                    {esCreador(t) ? (
                                        <div className="flex justify-end gap-1">
                                            <Button className="text-slate-400 hover:text-primary hover:bg-primary/10" variant="ghost" size="icon" onClick={() => handleEditClick(t)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button className=" text-slate-400 hover:text-red-600 hover:bg-red-500/10" variant="ghost" size="icon" onClick={() => handleDeleteClick(t)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-1">
                                            <p className="italic text-xs text-primary/40">No disponible</p>
                                        </div>    
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <TratamientoFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        tratamientoEditar={tratamientoSeleccionado}
      />

      {tratamientoAEliminar && (
        <DeleteConfirmModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={onConfirmDelete}
            onSuccess={() => {}}
            mensajeConf={<>¿Estás seguro de que deseas eliminar el tratamiento de <b>{tratamientoAEliminar.pacienteNombre}</b>?</>}
            mensajeEx="El tratamiento ha sido eliminado correctamente."
        />
      )}
    </div>
  )
}