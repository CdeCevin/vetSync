"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCitaService } from "@/hooks/useCitaService"

export function CitaModal({ onClose }: { onClose: () => void }) {
  const { createCita } = useCitaService()
  const [form, setForm] = useState({
    id_paciente: "",
    id_usuario: "",
    fecha_cita: "",
    duracion_minutos: "",
    motivo: "",
    tipo_cita: "",
    notas: "",
  })

  const handleChange = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    try {
      await createCita({
        id_paciente: Number(form.id_paciente),
        id_usuario: Number(form.id_usuario),
        fecha_cita: form.fecha_cita,
        duracion_minutos: Number(form.duracion_minutos),
        motivo: form.motivo,
        tipo_cita: form.tipo_cita,
        notas: form.notas,
      })
      onClose()
    } catch (err) {
      console.error("Error al crear cita:", err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Paciente</Label><Input onChange={e => handleChange("id_paciente", e.target.value)} /></div>
        <div><Label>Veterinario</Label><Input onChange={e => handleChange("id_usuario", e.target.value)} /></div>
        <div><Label>Fecha y hora</Label><Input type="datetime-local" onChange={e => handleChange("fecha_cita", e.target.value)} /></div>
        <div><Label>Duración (minutos)</Label><Input onChange={e => handleChange("duracion_minutos", e.target.value)} /></div>
        <div className="md:col-span-2"><Label>Motivo</Label><Input onChange={e => handleChange("motivo", e.target.value)} /></div>
        <div><Label>Tipo</Label>
          <Select onValueChange={(v) => handleChange("tipo_cita", v)}>
            <SelectTrigger><SelectValue placeholder="Selecciona tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="consulta">Consulta</SelectItem>
              <SelectItem value="vacunación">Vacunación</SelectItem>
              <SelectItem value="cirugía">Cirugía</SelectItem>
              <SelectItem value="emergencia">Emergencia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2"><Label>Notas</Label><Textarea onChange={e => handleChange("notas", e.target.value)} /></div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Agendar</Button>
      </div>
    </div>
  )
}
