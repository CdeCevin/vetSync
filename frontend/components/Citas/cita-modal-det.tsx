"use client"

import { useState } from "react"
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
import { useToast } from "@/components/ui/use-toast"

interface CitaDetallesDialogProps {
  open: boolean
  onClose: () => void
  cita: Cita | null
  onUpdate?: () => void // para refrescar la lista luego de editar o eliminar
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
  const { toast } = useToast()

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState(cita || null)
  const [loading, setLoading] = useState(false)

  if (!cita || !form) return null

  const handleChange = (key: keyof Cita, value: any) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  const handleSave = async () => {
    if (!form) return
    setLoading(true)
    try {
      await updateCita(form.id, form)
      toast({ title: "Cita actualizada", description: "Los cambios se guardaron correctamente." })
      setEditMode(false)
      onUpdate?.()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar la cita.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!form) return
    if (!confirm("¿Seguro que deseas eliminar esta cita?")) return
    setLoading(true)
    try {
      await deleteCita(form.id)
      toast({ title: "Cita eliminada", description: "La cita fue eliminada correctamente." })
      onClose()
      onUpdate?.()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la cita.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

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
                <p className="font-semibold">{format(new Date(form.fecha_cita), "EEEE d 'de' MMMM yyyy HH:mm", { locale: es })}</p>
                <Badge className={ESTADOS_COLORES[form.estado]}>{form.estado}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><strong>Paciente:</strong><p>{form.id_paciente}</p></div>
                <div><strong>Veterinario:</strong><p>{form.id_usuario}</p></div>
                <div><strong>Duración:</strong><p>{form.duracion_minutos} min</p></div>
                <div><strong>Tipo:</strong><p className="capitalize">{form.tipo_cita}</p></div>
              </div>

              <div>
                <strong>Motivo:</strong>
                <p>{form.motivo}</p>
              </div>

              {form.notas && (
                <div>
                  <strong>Notas:</strong>
                  <p>{form.notas}</p>
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Paciente (ID)</Label>
                  <Input value={form.id_paciente} onChange={(e) => handleChange("id_paciente", Number(e.target.value))} />
                </div>
                <div>
                  <Label>Veterinario (ID)</Label>
                  <Input value={form.id_usuario} onChange={(e) => handleChange("id_usuario", Number(e.target.value))} />
                </div>
              </div>

              <div>
                <Label>Fecha y hora</Label>
                <Input
                  type="datetime-local"
                  value={format(new Date(form.fecha_cita), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => handleChange("fecha_cita", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Duración (min)</Label>
                  <Input
                    value={form.duracion_minutos}
                    onChange={(e) => handleChange("duracion_minutos", Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={form.estado} onValueChange={(v) => handleChange("estado", v as Cita["estado"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programada">Programada</SelectItem>
                      <SelectItem value="en_progreso">En progreso</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                      <SelectItem value="no_asistio">No asistió</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Motivo</Label>
                <Input value={form.motivo} onChange={(e) => handleChange("motivo", e.target.value)} />
              </div>

              <div>
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

              <div>
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
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
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
    </Dialog>
  )
}
