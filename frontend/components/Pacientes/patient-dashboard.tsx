"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Edit, FileText, Phone, Mail, MapPin, Trash2, Loader2 } from "lucide-react"
import { useAlertStore } from "@/hooks/use-alert-store"
import { PacienteModal } from "@/components/Pacientes/PacienteModal" 
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal" 
import { useAuth } from "@/components/user-context"  

import {
  usePacienteService,
  PacienteEnLista,
  PacienteDetallado,
} from "@/hooks/usePacienteService"

type TipoHistorial = "Vacunacion" | "Cirugia" | "Chequeo" | "Tratamiento" | "Emergencia" | "Otro"


export function PatientDashboard() {
  const {
    getPacientes,
    getPacienteDetalle,
    createPaciente,
    updatePaciente,
    deletePaciente,
    createOwner,
    
  } = usePacienteService()
  const { usuario } = useAuth()
  const { onOpen: openAlert } = useAlertStore()
  const [pacientesBase, setPacientesBase] = useState<PacienteEnLista[]>([])
  const [pacientes, setPacientes] = useState<PacienteEnLista[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<PacienteDetallado | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Búsqueda automática con debounce
  const fetchPacientes = useCallback(async () => {
    setIsLoadingList(true)
    try {
      const data = await getPacientes()
      console.log(data)
      setPacientesBase(data)
      setPacientes(data)
    } catch (err: any) {
      openAlert("Error", err.message, "error")
    } finally {
      setIsLoadingList(false)
    }
  }, [getPacientes, openAlert])

  useEffect(() => {
  const term = searchTerm.toLowerCase()
  const filtrados = pacientesBase.filter(
    (p) =>
      p.nombre.toLowerCase().includes(term) ||
      p.raza.toLowerCase().includes(term) ||
      p.dueño?.nombre?.toLowerCase().includes(term)
  )
  setPacientes(filtrados)
}, [searchTerm, pacientesBase])


  const handleSelectPatient = async (paciente: PacienteEnLista) => {
  setIsLoadingDetails(true)
  try {
    const detalle = await getPacienteDetalle(paciente.id)
    console.log(detalle)

    const mappedDetalle: PacienteDetallado = {
    ...detalle,
    dueño: {
      id: detalle.dueño.id,
      nombre: detalle.dueño.nombre,
      telefono: detalle.dueño.telefono,
      correo: detalle.dueño.correo,
      direccion: detalle.dueño.direccion,
    }
  }

    setSelectedPatient(mappedDetalle)
  } catch (err: any) {
    openAlert("Error", err.message, "error")
  } finally {
    setIsLoadingDetails(false)
  }
}


useEffect(() => {
  fetchPacientes()
}, [fetchPacientes])

   const handleCreate = async (data: any) => {
    await createPaciente(data)
  }

   const handleEdit = async (data: any) => {
    if (!selectedPatient) throw new Error("No hay paciente seleccionado")
    await updatePaciente(selectedPatient.mascota.id, data)
  }

   const handleDelete = async () => {
    if (!selectedPatient) throw new Error("No hay paciente seleccionado")
    await deletePaciente(selectedPatient.mascota.id)
  }

  // permisos por rol
  const puedeCRUD = usuario?.nombre_rol === "Recepcionista"

  return (
      <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl">Registros de Pacientes</h1>
          <p className="text-muted-foreground">Administra la información de pacientes y sus historiales.</p>
        </div>
        
      </div>

      {/* Barra de Busqueda y Filtros */}
       <Card className="mb-6">
  <CardHeader>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      
      {/* GRUPO IZQUIERDO  */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
        
            <div className="relative flex-1 max-w-sm">
              <Search className=" absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar pacientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray/80"
              />
            </div>  
        </div>

          {/*  GRUPO DERECHO*/}
          {puedeCRUD && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Registrar Paciente
          </Button>
        )}

        </div>
      </CardHeader>
    </Card>

      {/* Layout de Lista  */}
         <div className="w-full grid gap-6 grid-cols-3 ">
        {/* Izquierda */}
            <div className="lg:col-span-1 ">
               <div className="rounded-xl shadow border bg-card  min-h-97">
            <div className="px-6 pt-6 pb-2">
              <span className="font-semibold ">Pacientes ({pacientes.length})</span>
              {pacientes.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">Sin resultados</p>
              )}
            </div>
            <div className=" max-h-96 overflow-y-auto bg-card">
                {isLoadingList ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  pacientes.map((paciente) => (
                           <div
                      key={paciente.id}
                      className={`
                        flex items-center justify-between p-4 cursor-pointer border-b
                        ${selectedPatient?.mascota.id === paciente.id ? "bg-muted" : ""}
                        hover:bg-muted/50 transition-colors
                      `}
                      onClick={() => handleSelectPatient(paciente)}
                    >
                      <div>
                        <div className="font-semibold">{paciente.nombre}</div>
                        <div className="text-xs text-muted-foreground">
                          {paciente.raza}
                          {paciente.dueño?.nombre}
                          </div>
                      </div>
                      
                    </div>
                        ))
                )}
                     </div>
                  </div>
            </div>

        {/* Derecha */}
            <div className="lg:col-span-2">
          {isLoadingDetails ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
              </CardContent>
            </Card>
          ) : selectedPatient ? (
              
                <DetallesPaciente
                  paciente={selectedPatient}
                  onEditClick={() => setIsEditDialogOpen(true)}
                  onDeleteClick={() => setIsDeleteDialogOpen(true)}
                  puedeCRUD={puedeCRUD}
                />
               ) : (
                  <div className="flex flex-col items-center justify-center h-[410px] w-full bg-card rounded-xl border shadow">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <span className="font-semibold text-lg">Seleccione un Paciente</span>
              <span className="text-muted-foreground">escoja un paciente de la lista para ver sus detalles</span>
            </div>
               )}
            </div>
         </div>


      {/* Modal de Añadir Paciente */}
      <PacienteModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={async (data) => {
          // Si se está creando un nuevo dueño primero se crea
          if (data.id_dueño === 0) {
            const newOwner = await createOwner({
              nombre: data.ownerNombre,
              telefono: data.ownerTelefono,
              correo: data.ownerCorreo,
              direccion: data.ownerDireccion,
            })
            data.id_dueño = newOwner.id
          }
          return handleCreate(data)
        }}
        onSuccess={fetchPacientes} 
        title="Añadir Nuevo Paciente"
        description="Ingresa la información del paciente y dueño."
      />

      {/* Modal de Editar Paciente */}
      <PacienteModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={async (data) => {
          // Actualiza paciente
          return handleEdit(data)
        }}
        onSuccess={async () => {
          await fetchPacientes()
          if (selectedPatient) {
            setSelectedPatient(await getPacienteDetalle(selectedPatient.mascota.id))
          }
        }}
        initialData={selectedPatient ?? null} // paciente + dueño
        isEdit
        title="Editar Paciente"
        description="Actualiza la información del paciente o del dueño."
      />

      {/* Modal de Confirmar Eliminacion */}
      {selectedPatient && (
        <DeleteConfirmModal
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          onSuccess={() => {
            fetchPacientes()
            setSelectedPatient(null)
          }}
          mensajeEx={`El paciente ${selectedPatient.mascota.nombre} se ha eliminado.`}
          mensajeConf={<>¿Estás seguro de que deseas eliminar al paciente <b>{selectedPatient.mascota.nombre}</b>? Esta acción no se puede deshacer.</>}
        />
      )}
    </div>
   )
}

function DetallesPaciente({ 
  paciente,
  onEditClick,
  onDeleteClick,
  puedeCRUD,
}: { 
  paciente: PacienteDetallado
  onEditClick: () => void
  onDeleteClick: () => void
  puedeCRUD: boolean
}) {

  // Se deriva el tipo de historial desde el diagnostico
  const getRecordType = (diagnostico: string): TipoHistorial => {
    const diag = diagnostico.toLowerCase()
    if (diag.includes("vacuna")) return "Vacunacion"
    if (diag.includes("cirug  a") || diag.includes("sutura")) return "Cirugia"
    if (diag.includes("chequeo") || diag.includes("rutina")) return "Chequeo"
    if (diag.includes("tratamiento")) return "Tratamiento"
    if (diag.includes("emergencia")) return "Emergencia"
    return "Otro"
  }

  const getRecordTypeColor = (type: TipoHistorial) => {
      switch (type) {
         case "Vacunacion": return "bg-blue-100 text-blue-800";
         case "Cirugia": return "bg-red-100 text-red-800";
         case "Chequeo": return "bg-green-100 text-green-800";
         case "Tratamiento": return "bg-orange-100 text-orange-800";
         case "Emergencia": return "bg-red-100 text-red-800";
         default: return "bg-gray-100 text-gray-800";
      }
   }

   return (
      <Card>
         <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="font-serif">{paciente.mascota.nombre}</CardTitle>
                  <CardDescription>
                     {paciente.mascota.raza} {paciente.mascota.edad} años
                  </CardDescription>
               </div>
          <div className="flex gap-2">
                {puedeCRUD && (
              <Button variant="outline" size="sm" onClick={onEditClick}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {puedeCRUD && (
              <Button variant="destructive" size="sm" onClick={onDeleteClick}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
            </div>
         </CardHeader>
         <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
               <TabsList>
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="medical">Historial Medico</TabsTrigger>
                  <TabsTrigger value="owner">Info. dueño</TabsTrigger>
               </TabsList>

          {/* Tab de Resumen */}
               <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                     <div className="space-y-3">
                        <h4 className="font-serif font-semibold">Informacion Basica</h4>
                        <div className="space-y-2 text-sm ">
                           <div className="flex justify-between">
                              <span className="text-muted-foreground">Especie:</span>
                              <span>{paciente.mascota.especie}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-muted-foreground">Raza:</span>
                              <span>{paciente.mascota.raza}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-muted-foreground">Peso:</span>
                              <span>{paciente.mascota.peso} kg</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-muted-foreground">Color:</span>
                              <span>{paciente.mascota.color}</span>
                           </div>
                           {paciente.mascota.numero_microchip && (
                              <div className="flex justify-between">
                                 <span className="text-muted-foreground">Microchip:</span>
                                 <span className="font-mono text-xs">{paciente.mascota.numero_microchip}</span>
                              </div>
                           )}
                           <div className="flex justify-between">
                              <span className="text-muted-foreground"> Ultima Visita:</span>
                              <span>
                      {paciente.historial.length > 0 ? 
                        new Date(paciente.historial[paciente.historial.length - 1].fecha_visita).toLocaleDateString() : 
                        "N/A"}
                    </span>
                           </div>
                        </div>
                     </div>

                  </div>
               </TabsContent>

          {/* Tab de Historial Medico */}
               <TabsContent value="medical" className="space-y-4">
                  <div className="flex items-center justify-between">
                     <h4 className="font-serif font-semibold">Historial Medico</h4>

                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {paciente.historial.length > 0 ? (
                       paciente.historial.map((record) => {
                  const recordType = getRecordType(record.diagnostico)
                  return (
                           <Card key={record.id}>
                              <CardContent className="p-4">
                                 <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                       <div className="flex items-center space-x-2">
                                          <Badge className={getRecordTypeColor(recordType)}>{recordType}</Badge>
                                          <span className="text-sm text-muted-foreground">
                                             {new Date(record.fecha_visita).toLocaleDateString()}
                                          </span>
                                       </div>
                                       <h5 className="font-semibold">{record.diagnostico}</h5>
                                       <p className="text-sm text-muted-foreground">Veterinario: {record.veterinario_nombre}</p>
                                       {record.notas && <p className="text-sm">{record.notas}</p>}
                                    </div>

                                 </div>
                              </CardContent>
                           </Card>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay registros medicos.</p>
              )}
                  </div>
               </TabsContent>

          {/* Tab de Info. dueño */}
               <TabsContent value="owner" className="space-y-4">
                  <div className="space-y-4">
                     <h4 className="font-serif font-semibold">Informacion del dueño</h4>
                     <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                      {paciente.dueño.nombre ? paciente.dueño.nombre.charAt(0) : "D"}
                    </span>
                           </div>
                           <div>
                              <p className="font-semibold">{paciente.dueño.nombre}</p>
                              <p className="text-sm text-muted-foreground">dueño de Mascota</p>
                           </div>
                        </div>
                <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                           <Phone className="h-4 w-4 text-muted-foreground" />
                           <span className="text-sm">{paciente.dueño.telefono}</span> 
                        </div>
                        <div className="flex items-center space-x-3">
                           <Mail className="h-4 w-4 text-muted-foreground" />
                           <span className="text-sm">{paciente.dueño.correo}</span>
                        </div>
                        <div className="flex items-start space-x-3">
                           <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                           <span className="text-sm">{paciente.dueño.direccion}</span>
                        </div>
                     </div>
                     </div>
                  </div>
               </TabsContent>
            </Tabs>
         </CardContent>
      </Card>
   )
}
  