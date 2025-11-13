"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Cita, useCitaService } from "@/hooks/useCitaService"
import { useAuth } from "@/components/user-context"
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal"
import { useAlertStore } from "@/hooks/use-alert-store"
import { usePacienteService } from "@/hooks/usePacienteService"
import { useUserService, User } from "@/hooks/useUsuarioService"
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"
import DatePicker from "react-datepicker"

interface CitaDetallesDialogProps {
  open: boolean
  onClose: () => void
  cita: Cita | null
  onUpdate?: () => void
  veterinarios?: User[]
}

const ESTADOS_COLORES: Record<Cita["estado"], string> = {
  programada: "bg-blue-100 text-blue-800",
  en_progreso: "bg-yellow-100 text-yellow-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
  no_asistio: "bg-gray-200 text-gray-700",
}

export function CitaDetallesDialog({ open, onClose, cita, onUpdate,veterinarios }: CitaDetallesDialogProps) {
  const { updateCita, deleteCita } = useCitaService()
  const { getPacientes } = usePacienteService()
  const { getUsers } = useUserService()
  const { onOpen: openAlert } = useAlertStore()
  const [pacientesList, setPacientesList] = useState<any[]>([])
  const [veterinariosList, setVeterinariosList] = useState<any[]>([])
  const { usuario } = useAuth()
  const [queryPaciente, setQueryPaciente] = useState("")
  const [queryVet, setQueryVet] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<Cita | null>(cita)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Cargar pacientes y veterinarios
  useEffect(() => {
  const loadData = async () => {
    try {
      const pacientesData = await getPacientes("")
      setPacientesList(pacientesData || [])

      // Si el padre YA entregó los veterinarios
      if (veterinarios && veterinarios.length > 0) {
        setVeterinariosList(veterinarios)
      } else {
        // Cargar desde API solo si no vienen del padre
        const usersData = await getUsers()
        setVeterinariosList(usersData.filter((u: User) => u.id_rol === 2))
      }
      
    } catch (error) {
      console.error("Error cargando datos:", error)
    }
  }

  if (open) loadData()

}, [open])

  useEffect(() => {
    setForm(cita)
  }, [cita])

  if (!form) return null

  const handleChange = (key: keyof Cita, value: any) => {
    setForm(prev => prev ? { ...prev, [key]: value } : prev)
  }

  const handleSave = async () => {
    if (!form) return
    setLoading(true)
    try {
      await updateCita(form.id, form)
      openAlert("Éxito", "Los cambios se guardaron correctamente.", "success")
      setEditMode(false)
      onUpdate?.()
    } catch {
      openAlert("Error", "No se pudo actualizar la cita.", "error")
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!form) return
    setLoading(true)
    try {
      await deleteCita(form.id)
      openAlert("Éxito", "La cita fue eliminada correctamente.", "success")
      onClose()
      onUpdate?.()
    } catch {
      openAlert("Error", "No se pudo eliminar la cita.", "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredPacientes = pacientesList.filter(p => p.nombre.toLowerCase().includes(queryPaciente.toLowerCase()))
  const filteredVets = veterinariosList.filter(v => v.nombre_completo.toLowerCase().includes(queryVet.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <DialogHeader>
          <DialogTitle>Detalles de la Cita</DialogTitle>
        </DialogHeader>

        {!editMode ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold">
                {format(new Date(form.fecha_cita), "EEEE d 'de' MMMM yyyy HH:mm", { locale: es })}
              </p>
              <Badge className={ESTADOS_COLORES[form.estado]}>{form.estado}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><strong>Paciente: </strong>{pacientesList.find(p => p.id === form.id_paciente)?.nombre || "—"}</div>
              <div><strong>Veterinario: </strong>{veterinariosList.find(v => v.id === form.id_usuario)?.nombre_completo || "—"}</div>
              <div><strong>Duración: </strong>{form.duracion_minutos} min</div>
              <div><strong>Tipo: </strong><span className="capitalize">{form.tipo_cita}</span></div>
            </div>
            <div><strong>Motivo:</strong><p>{form.motivo}</p></div>
            {form.notas && <div><strong>Notas:</strong><p>{form.notas}</p></div>}
            <DialogFooter className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setEditMode(true)}>Editar</Button>
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)} disabled={loading}>
                {loading ? "Eliminando..." : "Eliminar"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault()
              const formEl = e.currentTarget
              if (!formEl.checkValidity()) {
                formEl.reportValidity()
                return
              }
              if (!form.id_paciente) { openAlert("Error", "Seleccione un paciente.", "error"); return }
              if (!form.id_usuario) { openAlert("Error", "Seleccione un veterinario.", "error"); return }
              if (!form.tipo_cita) { openAlert("Error", "Seleccione un tipo de cita.", "error"); return }
              handleSave()
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {/* Paciente */}
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Combobox value={form.id_paciente} onChange={v => v !== null && handleChange("id_paciente", v)}>
                  <div className="relative mt-1">
                    <ComboboxInput
                      className="input-like w-full"
                      onChange={e => setQueryPaciente(e.target.value)}
                      displayValue={(id: number) => pacientesList.find(p => p.id === id)?.nombre || ""}
                      placeholder="Seleccionar paciente..."
                    />
                    <ComboboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border border-gray-200 bg-white shadow-lg">
                      {filteredPacientes.length === 0 && <div className="px-2.5 py-2 text-sm text-gray-500">Sin coincidencias</div>}
                      {filteredPacientes.map(p => (
                        <ComboboxOption key={p.id} value={p.id} className={({ active }) => `cursor-pointer px-4 py-2 text-sm ${active ? "bg-[#066357]/50" : ""}`}>
                          {p.nombre} — Dueño: {p.dueno?.nombre || "Sin dueño"}
                        </ComboboxOption>
                      ))}
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>

              {/* Veterinario */}
              <div className="space-y-2">
                <Label>Veterinario</Label>
                <Combobox value={form.id_usuario} onChange={v => v !== null && handleChange("id_usuario", v)} disabled={usuario?.id_rol === 2}>
                  <ComboboxInput
                    className="input-like w-full"
                    onChange={e => setQueryVet(e.target.value)}
                    displayValue={(id: number) => veterinariosList.find(v => v.id === id)?.nombre_completo || ""}
                    disabled={usuario?.id_rol === 2}
                  />
                  {usuario?.id_rol !== 2 && (
                    <ComboboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border border-gray-200 bg-white shadow-lg">
                      {filteredVets.map(v => (
                        <ComboboxOption key={v.id} value={v.id} className={({ active }) => `cursor-pointer px-4 py-2 text-sm ${active ? "bg-[#066357]/50" : ""}`}>
                          {v.nombre_completo} — {v.correo_electronico}
                        </ComboboxOption>
                      ))}
                    </ComboboxOptions>
                  )}
                </Combobox>
              </div>

              {/* Fecha y Hora */}
              <div className="space-y-2">
                <Label>Fecha y Hora</Label>
                <DatePicker
                  required
                  selected={form.fecha_cita ? new Date(form.fecha_cita) : null}
                  onChange={(date) => {
                    if (date) handleChange("fecha_cita", date.toISOString())
                  }}
                  showTimeSelect
                  timeIntervals={15}
                  timeCaption="Hora"
                  dateFormat="yyyy-MM-dd HH:mm"
                  minDate={new Date()}
                  className="input-like w-full"
                  placeholderText="Seleccionar fecha y hora..."
                />
              </div>

              {/* Duración */}
              <div className="space-y-2">
                <Label>Duración</Label>
                <Select required value={String(form.duracion_minutos)} onValueChange={v => handleChange("duracion_minutos", Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="90">90</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Motivo */}
              <div className="space-y-2">
                <Label>Motivo</Label>
                <Input required minLength={10} value={form.motivo} onChange={e => handleChange("motivo", e.target.value)} />
              </div>

              {/* Tipo de cita */}
              <div className="space-y-2">
                <Label>Tipo de cita</Label>
                <Select required value={form.tipo_cita} onValueChange={v => handleChange("tipo_cita", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="vacunación">Vacunación</SelectItem>
                    <SelectItem value="cirugía">Cirugía</SelectItem>
                    <SelectItem value="emergencia">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2 mt-4">
              <Label>Notas</Label>
              <Textarea value={form.notas || ""} onChange={e => handleChange("notas", e.target.value)} />
            </div>

            <DialogFooter className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar cambios"}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        onSuccess={() => setShowDeleteModal(false)}
        mensajeEx={"La cita seleccionada se ha eliminado."}
        mensajeConf ={"¿Estás seguro de que deseas eliminar la cita seleccionada? Esta acción no se puede deshacer."}
        //userName="la cita seleccionada"
      />
    </Dialog>
  )
}
