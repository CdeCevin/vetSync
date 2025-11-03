"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, FileText, Phone, Mail, MapPin, Trash2, Loader2 } from "lucide-react"

// Hooks y Contexto
import { ROUTES } from '../../apiRoutes';
import { useAuth } from "../user-context"
import { useAlertStore } from "@/hooks/use-alert-store"

// --- 1. IMPORTA TUS MODALES ---
import { PacienteModal } from "@/components/Pacientes/PacienteModal" 
import { DeleteConfirmModal } from "@/components/Usuarios/delete-confirm-modal" 

const API_BASE = process.env.NEXT_PUBLIC_API_URL

// --- 2. Interfaces Basadas en tu API ---

interface PacienteEnLista {
  id: number
  nombre: string
  raza: string
  dueno: { nombre: string }
}

interface Mascota {
  id: number
  nombre: string
  especie: string
  raza: string
  color: string
  edad: number
  peso: string
  numero_microchip: string | null
  activo: 1 | 0
  id_dueño: number
}

interface Dueño {
  nombre: string
  telefono: string
  correo: string
  direccion: string
}

interface HistorialMedico {
  id: number
  fecha_visita: string
  diagnostico: string
  notas: string | null
  id_usuario: number
}

interface PacienteDetallado {
  mascota: Mascota
  dueño: Dueño
  historial: HistorialMedico[]
}

type TipoHistorial = "Vacunación" | "Cirugía" | "Chequeo" | "Tratamiento" | "Emergencia" | "Otro"

// --- 3. Componente Principal (Dashboard) ---

export function PatientDashboard() {
  // --- Estados ---
  const { usuario } = useAuth()
  const idClinica = usuario?.id_clinica
  const [pacientes, setPacientes] = useState<PacienteEnLista[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<PacienteDetallado | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const { onOpen: openAlert } = useAlertStore()

  // --- 4. Funciones de API (solo la lógica de fetch y error) ---

  const fetchPacientes = useCallback(async (q: string = "") => {
    if (!idClinica) return
    setIsLoadingList(true)
    try {
      const res = await fetch(`${ROUTES.base}/${idClinica}/Pacientes/buscar?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error("Error al obtener pacientes")
      const data = await res.json()
      setPacientes(data)
    } catch (err: any) {
      openAlert("Error", err.message || "No se pudieron cargar los pacientes", "error")
    } finally {
      setIsLoadingList(false)
    }
  }, [idClinica, openAlert])

  useEffect(() => {
    if (idClinica) {
      fetchPacientes()
    }
  }, [fetchPacientes, idClinica])

  const handleSelectPatient = async (paciente: PacienteEnLista) => {
    if (selectedPatient?.mascota.id === paciente.id) return
    
    setIsLoadingDetails(true)
    setSelectedPatient(null)
    try {
      const res = await fetch(`${ROUTES.base}/${idClinica}/Pacientes/${paciente.id}`)
      if (!res.ok) throw new Error("Error al cargar detalles del paciente")
      const data: PacienteDetallado = await res.json()
      setSelectedPatient(data)
    } catch (err: any) {
      openAlert("Error", err.message, "error")
    } finally {
      setIsLoadingDetails(false)
    }
  }
  const handleSearch = async () => {
    await fetchPacientes(searchTerm)
  }
 // Estas funciones solo definen la API. El modal manejará el 'try/catch'.
  const handleCreate = async (data: any) => {
    const res = await fetch(`${ROUTES.base}/${idClinica}/Pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Error al crear paciente")
    }
     return res.json()
  }

  const handleEdit = async (data: any) => {
    if (!selectedPatient?.mascota.id) throw new Error("No hay paciente seleccionado")
    const res = await fetch(`${ROUTES.base}/${idClinica}/Pacientes/${selectedPatient.mascota.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Error al actualizar paciente")
    }
    return res.json()
  }

  const handleDelete = async () => {
    if (!selectedPatient?.mascota.id) throw new Error("No hay paciente seleccionado")
    const res = await fetch(`${ROUTES.base}/${idClinica}/Pacientes/${selectedPatient.mascota.id}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Error al eliminar paciente")
    }
    return res.json()
  }

  // --- 5. Renderizado (Layout del Ejemplo) ---
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Título y Botón de Añadir */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-foreground">Registros de Pacientes</h1>
          <p className="text-muted-foreground">Administra la información de pacientes y sus historiales.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Paciente
        </Button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes, dueños o razas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Layout de Lista / Detalle */}
      <div className="w-full grid gap-6 lg:grid-cols-3">
        {/* Columna de la Lista (Izquierda) */}
        <div className="lg:col-span-1">
          <div className="bg-muted/10 rounded-xl shadow border">
            <div className="px-6 pt-6 pb-2">
              <span className="font-semibold">Patients ({pacientes.length})</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
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
                        <div className="text-xs text-muted-foreground">{paciente.raza} • {paciente.dueno.nombre}</div>
                      </div>
                      
                    </div>
                  ))
                )}
              </div>
            </div>
        </div>

        {/* Columna de Detalles (Derecha) */}
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
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[410px] w-full bg-muted/10 rounded-xl border shadow">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <span className="font-semibold text-lg">Select a Patient</span>
              <span className="text-muted-foreground">Choose a patient from the list to view their details</span>
            </div>
          )}
        </div>
      </div>

      {/* --- 6. Modales (Renderizado) --- */}

      {/* Modal de Añadir */}
      <PacienteModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleCreate} 
        onSuccess={fetchPacientes} // Pasa la función de refresco
        isEdit={false}
        title="Añadir Nuevo Paciente"
        description="Ingresa la información del paciente y dueño."
      />

      {/* Modal de Editar */}
      <PacienteModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEdit} 
        onSuccess={async () => {
          await fetchPacientes();
          // Vuelve a cargar los detalles
          if (selectedPatient) {
            await handleSelectPatient(selectedPatient.mascota as any); 
          }
        }}
        isEdit={true}
        initialData={selectedPatient} // Pasa el PacienteDetallado
        title="Editar Paciente"
        description="Actualiza la información del paciente."
      />

      {/* Modal de Confirmar Eliminación */}
      {selectedPatient && (
        <DeleteConfirmModal
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete} 
          onSuccess={() => {
            fetchPacientes(); // Refresca la lista
            setSelectedPatient(null); // Limpia el detalle
          }}
          userName={selectedPatient.mascota.nombre}
        />
      )}
    </div>
  )
}


// --- 7. Componente de Detalles (Sub-componente) ---

function DetallesPaciente({ 
  paciente, 
  onEditClick,
  onDeleteClick 
}: { 
  paciente: PacienteDetallado,
  onEditClick: () => void,
  onDeleteClick: () => void
}) {

  // Derivamos el tipo de historial desde el diagnóstico
  const getRecordType = (diagnostico: string): TipoHistorial => {
    const diag = diagnostico.toLowerCase()
    if (diag.includes("vacuna")) return "Vacunación"
    if (diag.includes("cirugía") || diag.includes("sutura")) return "Cirugía"
    if (diag.includes("chequeo") || diag.includes("rutina")) return "Chequeo"
    if (diag.includes("tratamiento")) return "Tratamiento"
    if (diag.includes("emergencia")) return "Emergencia"
    return "Otro"
  }

  const getRecordTypeColor = (type: TipoHistorial) => {
    switch (type) {
      case "Vacunación": return "bg-blue-100 text-blue-800";
      case "Cirugía": return "bg-red-100 text-red-800";
      case "Chequeo": return "bg-green-100 text-green-800";
      case "Tratamiento": return "bg-orange-100 text-orange-800";
      case "Emergencia": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  const estadoPaciente = paciente.mascota.activo === 1 ? "Activo" : "Inactivo";
  const estadoColor = estadoPaciente === "Activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif">{paciente.mascota.nombre}</CardTitle>
            <CardDescription>
              {paciente.mascota.raza} • {paciente.mascota.edad} años
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEditClick}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={onDeleteClick}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="medical">Historial Médico</TabsTrigger>
            <TabsTrigger value="owner">Info. Dueño</TabsTrigger>
          </TabsList>

          {/* Tab de Resumen */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-serif font-semibold">Información Básica</h4>
                <div className="space-y-2 text-sm">
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
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif font-semibold">Información de Visita</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Última Visita:</span>
                    <span>
                      {paciente.historial.length > 0 ? 
                        new Date(paciente.historial[paciente.historial.length - 1].fecha_visita).toLocaleDateString() : 
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge className={estadoColor}>{estadoPaciente}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab de Historial Médico */}
          <TabsContent value="medical" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-semibold">Historial Médico</h4>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Registro
              </Button>
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
                            <p className="text-sm text-muted-foreground">Veterinario: (ID: {record.id_usuario})</p>
                            {record.notas && <p className="text-sm">{record.notas}</p>}
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay registros médicos.</p>
              )}
            </div>
          </TabsContent>

          {/* Tab de Info. Dueño */}
          <TabsContent value="owner" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-serif font-semibold">Información del Dueño</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {paciente.dueño.nombre ? paciente.dueño.nombre.charAt(0) : "D"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{paciente.dueño.nombre}</p>
                    <p className="text-sm text-muted-foreground">Dueño de Mascota</p>
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