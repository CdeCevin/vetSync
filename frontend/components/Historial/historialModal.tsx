"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Check, ChevronsUpDown, Pill, Syringe, User } from "lucide-react"
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, ComboboxButton } from '@headlessui/react'
import { useAlertStore } from "@/hooks/use-alert-store"
import { useInventoryService } from "@/hooks/useInventarioService"
import { usePacienteService, PacienteEnLista } from "@/hooks/usePacienteService"
import { useAuth } from "@/components/user-context"

interface ProcedimientoForm {
  nombre: string
  notas: string
}

interface TratamientoForm {
  id_medicamento: number
  medicamento_nombre: string
  dosis: string
  instrucciones: string
  duracion_dias: number
  notas: string
  cantidad: number
}

interface HistorialFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  pacienteId?: number
  pacienteNombre?: string
  citaId?: number
}

export function HistorialFormModal({ isOpen, onClose, onSubmit, pacienteId, pacienteNombre, citaId }: HistorialFormModalProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const { usuario } = useAuth()
  const { onOpen: openAlert } = useAlertStore()
  const { productos, cargarProductos } = useInventoryService()
  const { getPacientes } = usePacienteService()
  const [procedimientos, setProcedimientos] = useState<ProcedimientoForm[]>([])
  const [tratamientos, setTratamientos] = useState<TratamientoForm[]>([])
  const [queryMedicamento, setQueryMedicamento] = useState("")
  const [selectedMedId, setSelectedMedId] = useState<number>(0)
  const [tempTratamiento, setTempTratamiento] = useState<Partial<TratamientoForm>>({
    dosis: "", instrucciones: "", duracion_dias: 1, notas: ""
  })
  const [pacientesList, setPacientesList] = useState<PacienteEnLista[]>([])
  const [queryPaciente, setQueryPaciente] = useState("")
  const [selectedPacienteId, setSelectedPacienteId] = useState<number>(0)
  const [selectedPacienteNombre, setSelectedPacienteNombre] = useState("")
  const [tempProcedimiento, setTempProcedimiento] = useState<ProcedimientoForm>({ nombre: "", notas: "" })

  // carga inicial
  useEffect(() => {
    if (isOpen) {
      cargarProductos()
      getPacientes().then(setPacientesList).catch(console.error)

      // Resetear formulario completo
      setProcedimientos([])
      setTratamientos([])
      reset({ diagnostico: "", notas_generales: "" })
      setTempTratamiento({ dosis: "", instrucciones: "", duracion_dias: 1, notas: "" })
      setTempProcedimiento({ nombre: "", notas: "" })

      // Manejar pre-selección de paciente
      if (pacienteId && pacienteNombre) {
        setSelectedPacienteId(pacienteId)
        // Establece el nombre directamente desde los props
        setSelectedPacienteNombre(pacienteNombre)
      } else {
        setSelectedPacienteId(0)
        setSelectedPacienteNombre("")
        setQueryPaciente("")
      }
      setSelectedMedId(0)
      setQueryMedicamento("")
    }
  }, [isOpen, cargarProductos, reset, pacienteId, pacienteNombre, getPacientes])

  const filteredProductos = productos.filter(p =>
    p.nombre?.toLowerCase().includes(queryMedicamento.toLowerCase()) && p.stockActual > 0
  )

  const filteredPacientes = queryPaciente === ""
    ? pacientesList
    : pacientesList.filter((paciente: any) => {
      const term = queryPaciente.toLowerCase()
      const nombreDueño = paciente.dueño?.nombre || paciente.dueno?.nombre || ""
      return paciente.nombre.toLowerCase().includes(term) || nombreDueño.toLowerCase().includes(term)
    })

  const handleAddTratamiento = () => {
    if (selectedMedId === 0) {
      openAlert("Error", "Por favor seleccione un medicamento válido del inventario.", "error")
      return
    }
    if (!tempTratamiento.dosis) {
      openAlert("Error", "El campo dosis es obligatorio.", "error")
      return
    }
    const producto = productos.find(p => String(p.id) === String(selectedMedId))

    setTratamientos([...tratamientos, {
      id_medicamento: selectedMedId,
      medicamento_nombre: producto?.nombre || "Medicamento",
      dosis: tempTratamiento.dosis || "",
      instrucciones: tempTratamiento.instrucciones || "",
      duracion_dias: Number(tempTratamiento.duracion_dias) || 1,
      notas: tempTratamiento.notas || "",
      cantidad: 1
    } as TratamientoForm])

    setSelectedMedId(0)
    setTempTratamiento({ dosis: "", instrucciones: "", duracion_dias: 1, notas: "" })
    setQueryMedicamento("")
  }

  const handleAddProcedimiento = () => {
    if (!tempProcedimiento.nombre) return
    setProcedimientos([...procedimientos, { ...tempProcedimiento }])
    setTempProcedimiento({ nombre: "", notas: "" })
  }

  const onMainSubmit = async (formData: any) => {
    if (!selectedPacienteId) {
      openAlert("Error", "Debe seleccionar un paciente para registrar la consulta.", "error")
      return
    }

    const payload = {
      paciente_id: selectedPacienteId,
      cita_id: citaId || null,
      diagnostico: formData.diagnostico,
      notas_generales: formData.notas_generales,
      procedimientos: procedimientos.length > 0 ? procedimientos : undefined,
      tratamientos: tratamientos.length > 0 ? tratamientos : undefined
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>
            {pacienteId ? `Nueva Consulta: ${pacienteNombre}` : "Registrar Nueva Consulta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onMainSubmit)} className="space-y-4 mt-2">

          {!pacienteId && (
            <div className=" p-4 ">
              <Label className="mb-2 block font-semibold text-slate-700">Seleccionar Paciente*</Label>
              <Combobox
                value={selectedPacienteId}
                onChange={(val) => {
                  const pid = Number(val)
                  setSelectedPacienteId(pid)
                  const p = pacientesList.find(x => x.id === pid)
                  if (p) setSelectedPacienteNombre(p.nombre)
                }}
              >
                <div className="relative mt-1">
                  <div className="relative w-full cursor-default overflow-hidden rounded-md border border-input bg-background text-left shadow-sm focus:outline-none sm:text-sm">
                    <ComboboxInput
                      className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none"
                      displayValue={() => selectedPacienteNombre}
                      onChange={(event) => setQueryPaciente(event.target.value)}
                      placeholder="Buscar por nombre de mascota o dueño..."
                      autoComplete="off"
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </ComboboxButton>
                  </div>
                  <ComboboxOptions className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {filteredPacientes.length === 0 && queryPaciente !== "" ? (
                      <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                        No se encontraron pacientes.
                      </div>) : (
                      filteredPacientes.map((p: any) => (
                        <ComboboxOption key={p.id} value={p.id} className={({ active }) => `cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-[#066357]/10 text-[#066357]' : 'text-gray-900'}`}>
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {p.nombre} <span className="text-gray-500 text-xs">({p.dueño?.nombre || p.dueno?.nombre})</span>
                              </span>
                              {selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#066357]"><Check className="h-5 w-5" /></span> : null}
                            </>
                          )}
                        </ComboboxOption>
                      ))
                    )}
                  </ComboboxOptions>
                </div>
              </Combobox>
            </div>
          )}

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Diagnóstico</TabsTrigger>
              <TabsTrigger value="procedimientos">Procedimientos ({procedimientos.length})</TabsTrigger>
              <TabsTrigger value="tratamientos">Tratamientos ({tratamientos.length})</TabsTrigger>
            </TabsList>

            {/* tab 1: diagnostico */}
            <TabsContent value="general" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="diagnostico" className="text-base font-semibold">Diagnóstico Principal*</Label>
                <Input
                  id="diagnostico"
                  placeholder="Ej: Gastritis Aguda"
                  {...register("diagnostico", { required: true })}
                  required
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas">Notas Generales</Label>
                <Textarea
                  id="notas"
                  placeholder="Síntomas, temperatura, peso en consulta..."
                  {...register("notas_generales")}
                  className="min-h-[150px]"
                />
              </div>
            </TabsContent>

            {/* tab 2: proc */}
            <TabsContent value="procedimientos" className="space-y-4 py-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2 text-slate-700">
                  <Syringe className="h-4 w-4" /> Nuevo Procedimiento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Nombre (ej: Ecografía, Limpieza)"
                    value={tempProcedimiento.nombre}
                    onChange={e => setTempProcedimiento({ ...tempProcedimiento, nombre: e.target.value })}
                  />
                  <Input
                    placeholder="Notas (ej: Sin sedación)"
                    value={tempProcedimiento.notas}
                    onChange={e => setTempProcedimiento({ ...tempProcedimiento, notas: e.target.value })}
                  />
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddProcedimiento} disabled={!tempProcedimiento.nombre} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Agregar a la lista
                </Button>
              </div>
              <div className="space-y-2">
                {procedimientos.map((proc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                    <div>
                      <div className="font-semibold text-sm">{proc.nombre}</div>
                      {proc.notas && <div className="text-xs text-muted-foreground">{proc.notas}</div>}
                    </div>
                    <Button className=" text-slate-400 hover:text-red-600 hover:bg-red-500/10" type="button" variant="ghost" size="icon" onClick={() => setProcedimientos(prev => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-4 w-4 " />
                    </Button>
                  </div>
                ))}
                {procedimientos.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No hay procedimientos agregados.</p>}
              </div>
            </TabsContent>

            {/* tab 3: tratamientos */}
            <TabsContent value="tratamientos" className="space-y-4 py-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2 text-slate-700">
                  <Pill className="h-4 w-4" /> Añadir tratamiento
                </h4>
                <div className="space-y-1">
                  <Label className="text-xs">Producto (Stock disponible)</Label>
                  <Combobox value={selectedMedId} onChange={(val) => setSelectedMedId(Number(val))}>
                    <div className="relative">
                      <div className="relative w-full cursor-default overflow-hidden rounded-md border border-input bg-white text-left shadow-sm focus:outline-none sm:text-sm">
                        <ComboboxInput
                          className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none"
                          displayValue={(id: number) => productos.find(p => String(p.id) === String(id))?.nombre || ""}
                          onChange={(event) => setQueryMedicamento(event.target.value)}
                          placeholder="Buscar medicamento..."
                          autoComplete="off"
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </ComboboxButton>
                      </div>
                      <ComboboxOptions className="absolute z-[9999] mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {filteredProductos.length === 0 ? (
                          <div className="relative cursor-default select-none px-4 py-2 text-gray-700">{queryMedicamento === "" ? "Escriba para buscar..." : "No encontrado."}</div>
                        ) : (
                          filteredProductos.map((producto) => (
                            <ComboboxOption key={producto.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-[#066357]/10 text-[#066357]" : "text-gray-900"}`} value={producto.id}>
                              {({ selected, active }) => (
                                <>
                                  <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                    {producto.nombre} <span className="text-xs text-gray-500">(Stock: {producto.stockActual})</span>
                                  </span>
                                  {selected ? (
                                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-[#066357]" : "text-teal-600"}`}>
                                      <Check className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </ComboboxOption>
                          ))
                        )}
                      </ComboboxOptions>
                    </div>
                  </Combobox>
                </div>

                <div className="grid grid-cols-1">
                  <div>
                    <Label className="text-xs">Dosis*</Label>
                    <Input placeholder="Ej: 1 comprimido" value={tempTratamiento.dosis} onChange={e => setTempTratamiento({ ...tempTratamiento, dosis: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Instrucciones</Label>
                  <Input placeholder="Ej: Cada 8 horas con comida" value={tempTratamiento.instrucciones} onChange={e => setTempTratamiento({ ...tempTratamiento, instrucciones: e.target.value })} />
                </div>

                <Button type="button" variant="secondary" size="sm" onClick={handleAddTratamiento} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Agregar Tratamiento
                </Button>
              </div>
              <div className="space-y-2">
                {tratamientos.map((t, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 bg-white border rounded-md shadow-sm">
                    <div className="grid gap-1">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <Pill className="h-3 w-3 text-primary" /> {t.medicamento_nombre}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.dosis} - {t.instrucciones}
                      </div>
                    </div>
                    <Button className=" text-slate-400 hover:text-red-600 hover:bg-red-500/10" type="button" variant="ghost" size="icon" onClick={() => setTratamientos(prev => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {tratamientos.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No hay tratamientos agregados.</p>}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#066357] hover:bg-[#055046]">
              {isSubmitting ? "Guardando..." : "Guardar Consulta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}