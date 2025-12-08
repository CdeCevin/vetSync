"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, ComboboxButton } from '@headlessui/react'
import { Check, ChevronsUpDown } from "lucide-react"
import { useAlertStore } from "@/hooks/use-alert-store"
import { Tratamiento } from "./tratamiento"
import { useAuth } from "@/components/user-context"
import { useInventoryService } from "@/hooks/useInventarioService"
import { usePacienteService, PacienteEnLista } from "@/hooks/usePacienteService"

interface TratamientoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  tratamientoEditar?: Tratamiento | null
}

export function TratamientoFormModal({ isOpen, onClose, onSubmit, tratamientoEditar }: TratamientoFormModalProps) {

  const formRef = useRef<HTMLFormElement>(null)
  
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<Tratamiento>()
  const { usuario } = useAuth()
  const { onOpen: openAlert } = useAlertStore()
  const { productos, cargarProductos } = useInventoryService()
  const { getPacientes } = usePacienteService()

  const [queryMedicamento, setQueryMedicamento] = useState("")
  const [pacientesList, setPacientesList] = useState<PacienteEnLista[]>([])
  const [queryPaciente, setQueryPaciente] = useState("")

  const selectedMedicamentoId = watch("medicamentoId")
  const selectedMedicamentoNombre = watch("medicamento")
  const selectedPacienteId = watch("pacienteId")
  const selectedPacienteNombre = watch("pacienteNombre")

 useEffect(() => {
    if (isOpen) {
      cargarProductos()
      getPacientes()
        .then((data) => setPacientesList(data))
        .catch((err) => console.error("Error cargando pacientes:", err))
    }

    if (tratamientoEditar) {
      reset({
        ...tratamientoEditar,
        pacienteId: tratamientoEditar.pacienteId ?? 0,
        medicamentoId: tratamientoEditar.medicamentoId ?? 0,
        medicamento: tratamientoEditar.medicamento || "",
        pacienteNombre: tratamientoEditar.pacienteNombre || "",
        instrucciones: tratamientoEditar.instrucciones || "",
        notas: tratamientoEditar.notas || ""
      })
    } else {
      reset({
        pacienteId: 0,
        pacienteNombre: "",
        medicamento: "",
        medicamentoId: 0,
        dosis: "",
        instrucciones: "",
        duracionDias: 1,
        notas: "",
        veterinarioNombre: usuario?.nombre_completo || "Veterinario Actual",
        veterinarioId: usuario?.id || 0
      })
    }
  }, [tratamientoEditar, isOpen, reset, usuario, cargarProductos, getPacientes])

  const filteredProductos = productos.filter((producto) => {
    const matchesSearch = producto.nombre?.toLowerCase().includes(queryMedicamento.toLowerCase())
    const hasStock = producto.stockActual > 0
    return matchesSearch && hasStock
  })

  const filteredPacientes = queryPaciente === "" 
    ? pacientesList 
    : pacientesList.filter((paciente: any) => {
        const searchLower = queryPaciente.toLowerCase()
        const nombreDueño = paciente.dueño?.nombre || paciente.dueno?.nombre || ""
        return (
          paciente.nombre.toLowerCase().includes(searchLower) ||
          nombreDueño.toLowerCase().includes(searchLower)
        )
      })
  const onFormSubmit = async (data: Tratamiento) => {
    if (!data.pacienteId || data.pacienteId === 0) {
        openAlert("Error", "Por favor seleccione un paciente válido de la lista.", "error")
        return
    }
    if (!data.medicamentoId || data.medicamentoId === 0) {
        openAlert("Error", "Por favor seleccione un medicamento válido del inventario.", "error")
        return
    }
    data.duracionDias = Number(data.duracionDias)
    await onSubmit(data)
  }
  const handleNativeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formRef.current && !formRef.current.checkValidity()) {
        formRef.current.reportValidity()
        return
    }
    handleSubmit(onFormSubmit)()
  }

  const handleSelectMedicamento = (productoId: number) => {
    const producto = productos.find(p => p.id === String(productoId) )
    if (producto) {
        setValue("medicamentoId", Number(producto.id))
        setValue("medicamento", producto.nombre)
    }
  }

  const handleSelectPaciente = (pacienteId: number) => {
    const paciente = pacientesList.find(p => p.id === pacienteId)
    if (paciente) {
        setValue("pacienteId", paciente.id)
        setValue("pacienteNombre", paciente.nombre)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] overflow-visible">
        <DialogHeader>
          <DialogTitle>{tratamientoEditar ? "Editar Tratamiento" : "Registrar Nuevo Tratamiento"}</DialogTitle>
        </DialogHeader>
        
        <form ref={formRef} onSubmit={handleNativeSubmit} className="space-y-4 py-4" noValidate={false}>
          
          {/* select paciente con combobox*/}
          {!tratamientoEditar ? (
             <div className="space-y-2 flex flex-col">
                <Label>Paciente *</Label>
                <Combobox
                    value={selectedPacienteId}
                    onChange={(val) => val && handleSelectPaciente(Number(val))}
                >
                    <div className="relative mt-1">
                        <div className="relative w-full cursor-default overflow-hidden rounded-md border border-input bg-background text-left shadow-sm focus:outline-none sm:text-sm">
                            <ComboboxInput
                                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none"
                                displayValue={(id: number) => 
                                    pacientesList.find(p => p.id === id)?.nombre || selectedPacienteNombre || ""
                                }
                                onChange={(event) => setQueryPaciente(event.target.value)}
                                placeholder="Buscar paciente o dueño..."
                                autoComplete="off"
                                required
                            />
                            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </ComboboxButton>
                        </div>
                        
                        <ComboboxOptions className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {filteredPacientes.length === 0 && queryPaciente !== "" ? (
                                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                    No se encontraron pacientes.
                                </div>
                            ) : (
                                filteredPacientes.map((paciente: any) => (
                                    <ComboboxOption
                                        key={paciente.id}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                active ? "bg-[#066357]/10 text-[#066357]" : "text-gray-900"
                                            }`
                                        }
                                        value={paciente.id}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                                    {paciente.nombre} 
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        (Dueño: {paciente.dueño?.nombre || paciente.dueno?.nombre || "N/A"}) - {paciente.raza}
                                                    </span>
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
                <input type="hidden" {...register("pacienteId")} />
             </div>
          ) : (
             <div className="space-y-2">
                <Label>Paciente</Label>
                <Input value={tratamientoEditar.pacienteNombre} disabled className="bg-muted" />
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            
            {/* select medicamento con combobox*/}
            <div className="space-y-2 flex flex-col">
                <Label>Medicamento *</Label>
                
                <Combobox
                    value={selectedMedicamentoId}
                    onChange={(val) => val && handleSelectMedicamento(Number(val))}
                >
                    <div className="relative mt-1">
                        <div className="relative w-full cursor-default overflow-hidden rounded-md border border-input bg-background text-left shadow-sm focus:outline-none sm:text-sm">
                            <ComboboxInput
                                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none"
                                displayValue={(id: number) => 
                                    productos.find(p => String(p.id) === String(id))?.nombre || selectedMedicamentoNombre || ""
                                }
                                onChange={(event) => setQueryMedicamento(event.target.value)}
                                placeholder="Buscar en inventario..."
                                autoComplete="off"
                                required
                            />
                            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </ComboboxButton>
                        </div>
                        
                        <ComboboxOptions className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {filteredProductos.length === 0 ? (
                                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                    {queryMedicamento === "" ? "Cargando inventario..." : "No se encontraron medicamentos."}
                                </div>
                            ) : (
                                filteredProductos.map((producto) => (
                                    <ComboboxOption
                                        key={producto.id}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                active ? "bg-[#066357]/10 text-[#066357]" : "text-gray-900"
                                            }`
                                        }
                                        value={producto.id}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                                    {producto.nombre} 
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        (Stock: {producto.stockActual})
                                                    </span>
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
                <input type="hidden" {...register("medicamentoId")} />
            </div>

            <div className="space-y-2">
                <Label>Dosis*</Label>
                <Input {...register("dosis")} required placeholder="Ej: 500mg cada 8 horas" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Duración (Días)*</Label>
                <Input type="number" min="1" {...register("duracionDias")} required />
             </div>
             <div className="space-y-2">
                <Label>Prescrito Por</Label>
                <Input value={tratamientoEditar ? tratamientoEditar.veterinarioNombre : usuario?.nombre_completo} disabled className="bg-muted" />
             </div>
          </div>

          <div className="space-y-2">
            <Label>Instrucciones</Label>
            <Textarea {...register("instrucciones")} placeholder="Ej: Administrar con comida cada 12 horas..." />
          </div>

          <div className="space-y-2">
            <Label>Notas Adicionales</Label>
            <Textarea {...register("notas")} placeholder="Observaciones sobre el paciente..." />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Tratamiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}