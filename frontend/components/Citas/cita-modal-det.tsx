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
import { useUserService } from "@/hooks/useUsuarioService"

// Headless UI Combobox
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"

interface CitaDetallesDialogProps {
  open: boolean
  onClose: () => void
  cita: Cita | null
  onUpdate?: () => void
}

const ESTADOS_COLORES: Record<Cita["estado"], string> = {
  programada: "bg-blue-100 text-blue-800",
  en_progreso: "bg-yellow-100 text-yellow-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
  no_asistio: "bg-gray-200 text-gray-700",
}

export function CitaDetallesDialog({ open, onClose, cita, onUpdate }: CitaDetallesDialogProps) {
  const { updateCita, deleteCita } = useCitaService()
  const { getPacientes } = usePacienteService()
  const { getUsers } = useUserService()
  const { onOpen: openAlert } = useAlertStore()
  const [pacientesList, setPacientesList] = useState<any[]>([])
  const [veterinariosList, setVeterinariosList] = useState<any[]>([])
  const { usuario} = useAuth()
  const [queryPaciente, setQueryPaciente] = useState("")
  const [queryVet, setQueryVet] = useState("")

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<Cita | null>(cita)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Cargar pacientes y veterinarios al abrir el modal
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pacientesData, usersData] = await Promise.all([getPacientes(""), getUsers()])
        setPacientesList(pacientesData || [])
        setVeterinariosList(usersData.filter((u) => u.id_rol === 2))
      } catch (error) {
        console.error("Error cargando datos:", error)
      }
    }
    if (open) loadData()
  }, [open])

  // Resetear formulario cuando cambia la cita seleccionada
  useEffect(() => {
    setForm(cita)
  }, [cita])

  if (!form) return null

  const handleChange = (key: keyof Cita, value: any) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
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

  const filteredPacientes = pacientesList.filter((p) =>
    p.nombre.toLowerCase().includes(queryPaciente.toLowerCase())
  )

  const filteredVets = veterinariosList.filter((v) =>
    v.nombre_completo.toLowerCase().includes(queryVet.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalles de la Cita</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!editMode ? (
            <>
              <div className="flex justify-between items-center">
                <p className="font-semibold">
                  {format(new Date(form.fecha_cita), "EEEE d 'de' MMMM yyyy HH:mm", { locale: es })}
                </p>
                <Badge className={ESTADOS_COLORES[form.estado]}>{form.estado}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong>Paciente: </strong>
                  {pacientesList.find((p) => p.id === form.id_paciente)?.nombre || "—"}
                </div>
                <div>
                  <strong>Veterinario: </strong>
                  {veterinariosList.find((v) => v.id === form.id_usuario)?.nombre_completo || "—"}
                </div>
                <div><strong>Duración: </strong>{form.duracion_minutos} min</div>
                <div><strong>Tipo: </strong><span className="capitalize">{form.tipo_cita}</span></div>
              </div>

              <div><strong>Motivo:</strong><p>{form.motivo}</p></div>

              {form.notas && (
                <div><strong>Notas:</strong><p>{form.notas}</p></div>
              )}
            </>
          ) : (
              <div>
            <div className="grid gap-4 md:grid-cols-2">
              {/* 🐾 Paciente */}
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Combobox
                  value={form.id_paciente}
                  onChange={(value: number | null) => {
                    if (value !== null) handleChange("id_paciente", value)
                  }}
                >
                  <div className="relative mt-1">
                    <ComboboxInput
                      className="input-like w-full"
                      onChange={(e) => setQueryPaciente(e.target.value)}
                      displayValue={(id: number) =>
                        pacientesList.find((p) => p.id === id)?.nombre || ""
                      }
                      placeholder="Seleccionar paciente..."
                    />
                    <ComboboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border border-gray-200 bg-white shadow-lg">
                      {filteredPacientes.length === 0 && (
                        <div className="px-2.5 py-2 text-sm text-gray-500">Sin coincidencias</div>
                      )}
                      {filteredPacientes.map((p) => (
                        <ComboboxOption
                          key={p.id}
                          value={p.id}
                          className={({ active }) =>
                            `cursor-pointer px-4 py-2 text-sm ${active ? "bg-[#066357]/50" : ""}`
                          }
                        >
                          {p.nombre} — Dueño: {p.dueno?.nombre || "Sin dueño"}
                        </ComboboxOption>
                      ))}
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>

              {/* 🩺 Veterinario */}
              <div className="space-y-2">
                <Label>Veterinario</Label>
                <Combobox
                  value={form.id_usuario}
                  onChange={(value: number | null) => { if (value !== null) handleChange("id_usuario", value) }}
                  disabled={usuario?.id_rol === 2} // veterinario fijo
                >
                  <ComboboxInput
                    className="input-like w-full"
                    onChange={(e) => setQueryVet(e.target.value)}
                    displayValue={(id: number) =>
                      veterinariosList.find((v) => v.id === id)?.nombre_completo || ""
                    }
                    disabled={usuario?.id_rol === 2}
                  />
                  {usuario?.id_rol !== 2 && (
                    <ComboboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border border-gray-200 bg-white shadow-lg">
                      {filteredVets.map((v) => (
                        <ComboboxOption key={v.id} value={v.id} className={({ active }) =>
                          `cursor-pointer px-4 py-2 text-sm ${active ? "bg-[#066357]/50" : ""}`
                        }>
                          {v.nombre_completo} — {v.correo_electronico}
                        </ComboboxOption>
                      ))}
                    </ComboboxOptions>
                  )}
                </Combobox>
              </div>

              {/* Otros campos */}
              <div className="space-y-2">
              <Label>Fecha y Hora</Label>
              <Input
                type="datetime-local"
                value={format(new Date(form.fecha_cita), "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => handleChange("fecha_cita", e.target.value)}
                step={900} // 15 min
                min={new Date().toISOString().slice(0,16)} // no permitir pasadas
              />
              </div>

              <div className="space-y-2">
              <Label>Duración</Label>
              <Select value={String(form.duracion_minutos)} onValueChange={(v) => handleChange("duracion_minutos", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                  <SelectItem value="90">90</SelectItem>
                </SelectContent>
              </Select>
                </div>
              <div className="space-y-2">
                <Label>Motivo</Label>
                <Input value={form.motivo} minLength={10} onChange={(e) => handleChange("motivo", e.target.value)} />
              </div>

            <div className="space-y-2">
              <Label>Tipo de cita</Label>
              <Select value={form.tipo_cita} onValueChange={(v) => handleChange("tipo_cita", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="vacunación">Vacunación</SelectItem>
                    <SelectItem value="cirugía">Cirugía</SelectItem>
                    <SelectItem value="emergencia">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              
            </div>
           <div className="space-y-2 mt-4">
                <Label>Notas</Label>
                <Textarea value={form.notas || ""} onChange={(e) => handleChange("notas", e.target.value)} />
              </div>
              </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex justify-between">
          {!editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(true)}>Editar</Button>
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)} disabled={loading}>
                {loading ? "Eliminando..." : "Eliminar"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        onSuccess={() => {
          setShowDeleteModal(false)
        }}
        userName="la cita seleccionada"
      />
    </Dialog>
  )
}
