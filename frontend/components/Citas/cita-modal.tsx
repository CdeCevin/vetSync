"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCitaService } from "@/hooks/useCitaService"
import { useAlertStore } from "@/hooks/use-alert-store"
import { usePacienteService } from "@/hooks/usePacienteService"
import { useUserService } from "@/hooks/useUsuarioService"
import { useDueñoService } from "@/hooks/useDueñoService"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useAuth } from "@/components/user-context"
import DatePicker from "react-datepicker"

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions
} from "@headlessui/react"

export function CitaModal({
  onClose,
  citaInicial,
  onSave
}: {
  onClose: () => void
  citaInicial?: { id_usuario?: number; fecha_cita?: string }
  onSave?: () => void
}) {
  const { usuario } = useAuth()
  const { createCita } = useCitaService()
  const { getPacientes } = usePacienteService()
  const { getUsers } = useUserService()
  const { getOwners } = useDueñoService()
  const { onOpen: openAlert } = useAlertStore()

  const [form, setForm] = useState({
    id_paciente: 0,
    id_usuario: 0,
    fecha_cita: "",
    duracion_minutos: "",
    motivo: "",
    tipo_cita: "",
    notas: "",
  })

  const [pacientesList, setPacientesList] = useState<any[]>([])
  const [veterinariosList, setVeterinariosList] = useState<any[]>([])
  const [ownersList, setOwnersList] = useState<any[]>([])

  const [queryPaciente, setQueryPaciente] = useState("")
  const [queryVet, setQueryVet] = useState("")

  const formRef = useRef<HTMLFormElement>(null)

  // 🔹 Cargar pacientes, veterinarios y dueños
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pacientesData, usersData, ownersData] = await Promise.all([
          getPacientes(""),
          getUsers(),
          getOwners()
        ])

        setPacientesList(pacientesData || [])
        setOwnersList(ownersData || [])
        setVeterinariosList(usersData.filter(u => u.id_rol === 2)) // Solo veterinarios
      } catch (err) {
        console.error("Error cargando datos:", err)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (usuario?.id_rol === 2) {
      setForm(prev => ({ ...prev, id_usuario: usuario.id }))
    }
  }, [usuario])

  const formatForInput = (dateStr: string) => {
    const d = new Date(dateStr)
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  useEffect(() => {
    if (citaInicial) {
      setForm(prev => ({
        ...prev,
        id_usuario: citaInicial.id_usuario ?? prev.id_usuario,
        fecha_cita: citaInicial.fecha_cita ? formatForInput(citaInicial.fecha_cita) : prev.fecha_cita
      }))
    }
  }, [citaInicial])

  const handleChange = (key: string, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // ✅ Validación nativa del navegador
    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity()
      return
    }
    if (!form.tipo_cita) {
    // Podés usar reportValidity-like UX: enfocá el control visual o mostrar alerta
    // enfoque: buscá el trigger y focus
    alert("Debes seleccionar el tipo de cita.")
    return
  }
    try {
      // 🕒 Corregir hora local → UTC antes de enviar
      const fechaLocal = new Date(form.fecha_cita)
      const offset = fechaLocal.getTimezoneOffset() // minutos de diferencia local vs UTC
      const fechaUTC = new Date(fechaLocal.getTime() - offset * 60000)

      await createCita({
        id_paciente: Number(form.id_paciente),
        id_usuario: Number(form.id_usuario),
        fecha_cita: fechaUTC.toISOString(),
        duracion_minutos: Number(form.duracion_minutos),
        motivo: form.motivo,
        tipo_cita: form.tipo_cita,
        notas: form.notas,
      })

      if (onSave) await onSave()
      onClose()
      openAlert("Éxito", "La cita se ha creado exitosamente.", "success")
    } catch (err) {
      console.error(err)
      openAlert("Error", "Ha ocurrido un error al crear la cita.", "error")
    }
  }

  const filteredPacientes = pacientesList.filter(p =>
    p.nombre.toLowerCase().includes(queryPaciente.toLowerCase())
  )

  const filteredVets = veterinariosList.filter(v =>
    v.nombre_completo.toLowerCase().includes(queryVet.toLowerCase())
  )

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* 🐾 Paciente */}
        <div className="space-y-2">
          <Label>Paciente</Label>
          <Combobox
            value={form.id_paciente}
            onChange={(value: number | null) => value !== null && handleChange("id_paciente", value)}
          >
            <div className="relative mt-1">
              <ComboboxInput
                required
                className="input-like w-full"
                onChange={(e) => setQueryPaciente(e.target.value)}
                displayValue={(id: number) =>
                  pacientesList.find(p => p.id === id)?.nombre || ""
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
                    {p.nombre} — Dueño: {p.dueno.nombre}
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
            onChange={(value: number | null) => value !== null && handleChange("id_usuario", value)}
            disabled={usuario?.id_rol === 2}
          >
            <div className="relative mt-1">
              <ComboboxInput
                required
                className="input-like w-full"
                onChange={(e) => setQueryVet(e.target.value)}
                displayValue={(id: number) =>
                  veterinariosList.find((v) => v.id === id)?.nombre_completo || ""
                }
                placeholder={usuario?.id_rol === 2 ? "Veterinario fijo" : "Seleccionar veterinario..."}
                disabled={usuario?.id_rol === 2}
              />
              {usuario?.id_rol !== 2 && (
                <ComboboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border border-gray-200 bg-white shadow-lg">
                  {filteredVets.length === 0 && (
                    <div className="px-2.5 py-2 text-sm text-gray-500">Sin coincidencias</div>
                  )}
                  {filteredVets.map((v) => (
                    <ComboboxOption
                      key={v.id}
                      value={v.id}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 text-sm ${active ? "bg-[#066357]/50" : ""}`
                      }
                    >
                      {v.nombre_completo} — {v.correo_electronico}
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              )}
            </div>
          </Combobox>
        </div>

        {/* 📅 Fecha y hora */}
        <div className="space-y-2">
          <Label>Fecha y hora</Label>
          <DatePicker
            required
            selected={form.fecha_cita ? new Date(form.fecha_cita) : null}
            onChange={(date) => date && handleChange("fecha_cita", date.toISOString())}
            showTimeSelect
            timeIntervals={15}
            timeCaption="Hora"
            dateFormat="yyyy-MM-dd HH:mm"
            minDate={new Date()}
            className="input-like w-full"
            placeholderText="Seleccionar fecha y hora..."
          />
        </div>

        {/* ⏱ Duración */}
        <div className="space-y-2">
          <Label>Duración (min)</Label>
          <Select
            required
            value={String(form.duracion_minutos)}
            onValueChange={(v) => handleChange("duracion_minutos", Number(v))}
          >
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
        <div className="space-y-2 md:col-span-2">
          <Label>Motivo</Label>
          <Input required minLength={10} onChange={e => handleChange("motivo", e.target.value)} />
        </div>

        {/* Tipo de cita */}
        <div className="space-y-2">
          <Label>Tipo de cita</Label>
          <Select required value={form.tipo_cita} onValueChange={(v) => handleChange("tipo_cita", v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="consulta">Consulta</SelectItem>
              <SelectItem value="vacunación">Vacunación</SelectItem>
              <SelectItem value="cirugía">Cirugía</SelectItem>
              <SelectItem value="emergencia">Emergencia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notas */}
        <div className="md:col-span-2 space-y-2">
          <Label>Notas</Label>
          <Textarea onChange={e => handleChange("notas", e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end space-x-2 space-y-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Agendar</Button>
      </div>
    </form>
  )
}
