"use client"

import { useEffect, useState } from "react"
import { OwnerFilters } from "./ow-filters"
import { DeleteConfirmModal } from "../modals/delete-confirm-modal"
import { OwnerTable } from "./ow-table"
import { OwnerModal } from "./ow-modal"
import { useDueñoService, Dueño } from "@/hooks/useDueñoService"


export function OwnerManagementDashboard() {
  const { createOwner, updateOwner, getOwners, deleteOwner } = useDueñoService()
  const [owners, setOwners] = useState<Dueño[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<Dueño | null>(null)

  const fetchOwners = async () => {
    const data = await getOwners()
    setOwners(data)
  }

  useEffect(() => {
    fetchOwners()
  }, [])

  // Filtro adaptado para propiedades reales
  const filteredOwners = owners.filter((owner) => {
    const matchesSearch =
      owner.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.correo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleCreateOwner = async (ownerData: Partial<Dueño>) => {
    await createOwner(ownerData)
  }

  const handleEditOwner = async (ownerData: Partial<Dueño>) => {
    await updateOwner(ownerData)
  }

  const handleDeleteOwner = async () => {
    if (!selectedOwner) return
    await deleteOwner(selectedOwner.id)
  }

  const openEditModal = (owner: Dueño) => {
    setSelectedOwner(owner)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (owner: Dueño) => {
    setSelectedOwner(owner)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Dueños</h2>
            <p className="text-gray-600">Administra los dueños de los pacientes de tu clínica</p>
          </div>
          <OwnerFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            onCreateOwner={() => setIsCreateModalOpen(true)}
          />
          <OwnerTable owners={filteredOwners} onEditOwner={openEditModal} onDeleteOwner={openDeleteModal} />
          <OwnerModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateOwner}
            onSuccess={fetchOwners}
            title="Crear Nuevo Dueño"
            description="Completa la información para crear un nuevo dueño en el sistema."
          />
          <OwnerModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedOwner(null)
            }}
            onSubmit={handleEditOwner}
            onSuccess={fetchOwners}
            initialData={selectedOwner || undefined}
            isEdit={true}
            title="Editar Dueño"
            description="Modifica la información del dueño seleccionado."
          />
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setSelectedOwner(null)
            }}
            onConfirm={handleDeleteOwner}
            onSuccess={fetchOwners}
            userName={`dueño ${selectedOwner?.nombre}`}
        />
        </main>
      </div>
    </div>
  )
}
