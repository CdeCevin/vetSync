"use client"

import { useEffect, useState } from "react"
import { UserFilters } from "./user-filters"
import { DeleteConfirmModal } from "../modals/delete-confirm-modal"
import { UserTable } from "./user-table"
import { UserModal } from "./user-modal"
import { useUserService, User } from "@/hooks/useUsuarioService"
import { Contrail_One } from 'next/font/google';



// Función para mapear id_rol a rol en texto para frontend
const rolMap: Record<number, string> = {
  1: "Administrador",
  2: "Veterinario",
  3: "Recepcionista",
}

export function UserManagementDashboard() {
  const { getUsers, createUser, updateUser, deleteUser } = useUserService()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    const data = await getUsers()
    setUsers(data)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filtro adaptado para propiedades reales
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo_electronico.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole =
      selectedRole === "all" || rolMap[user.id_rol] === selectedRole
    return matchesSearch && matchesRole
  })

  const handleCreateUser = async (userData: Partial<User>) => {
    await createUser(userData)
  }

  const handleEditUser = async (userData: Partial<User>) => {
    await updateUser(userData)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    await deleteUser(selectedUser.id)
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h2>
            <p className="text-gray-600">Administra los usuarios de tu clínica</p>
          </div>
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            onCreateUser={() => setIsCreateModalOpen(true)}
          />
          <UserTable users={filteredUsers} onEditUser={openEditModal} onDeleteUser={openDeleteModal} />
          <UserModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateUser}
            onSuccess={fetchUsers}
            title="Crear Nuevo Usuario"
            description="Completa la información para crear un nuevo usuario en el sistema."
          />
          <UserModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedUser(null)
            }}
            onSubmit={handleEditUser}
            onSuccess={fetchUsers}
            initialData={selectedUser || undefined}
            isEdit={true}
            title="Editar Usuario"
            description="Modifica la información del usuario seleccionado."
          />
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setSelectedUser(null)
            }}
            onConfirm={handleDeleteUser}
            onSuccess={fetchUsers}
            userName={<>usuario <strong>{selectedUser?.nombre_completo}</strong></>}

            
        />
        </main>
      </div>
    </div>
  )
}
