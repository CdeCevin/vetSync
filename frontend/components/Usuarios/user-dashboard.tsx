"use client"
import { ROUTES } from '../../apiRoutes';
import { useAuth } from "../user-context"
import { useEffect, useState } from "react"
import { UserFilters } from "./user-filters"
import { DeleteConfirmModal } from "./delete-confirm-modal"
import { UserTable } from "./user-table"
import { UserModal } from "./user-modal"

// Ajusta este tipo según tu modelo real de usuario
interface User {
  id:number
  id_rol: number
  nombre_completo: string
  correo_electronico: string
  contraseña?: string
}

// Función para mapear id_rol a rol en texto para frontend
const rolMap: Record<number, string> = {
  1: "Administrador",
  2: "Veterinario",
  3: "Recepcionista",
}

export function UserManagementDashboard() {
  const { usuario } = useAuth()
  const idClinica = usuario?.id_clinica
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    const res = await fetch(`${ROUTES.gestionUser}/${idClinica}/usuarios`)
    const data = await res.json()
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
    // Mapea de frontend a API si fuera necesario (ejemplo)
    const body = {
      nombre_completo: userData.nombre_completo,
      correo_electronico: userData.correo_electronico,
      id_rol: userData.id_rol,
      contraseña: userData.contraseña
    }
    await fetch(`${ROUTES.gestionUser}/${idClinica}/usuarios/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    fetchUsers()
    setIsCreateModalOpen(false)
  }

  const handleEditUser = async (userData: Partial<User>) => {
    if (!selectedUser) return
    const body = {
      id: userData.id,
      nombre_completo: userData.nombre_completo,
      correo_electronico: userData.correo_electronico,
      id_rol: userData.id_rol,
    }
    await fetch(`${ROUTES.gestionUser}/${idClinica}}/usuarios/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    fetchUsers() 
    setIsEditModalOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    await fetch(`${ROUTES.gestionUser}/${idClinica}}/usuarios/${selectedUser.id}`, { method: "DELETE" })
    fetchUsers()
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
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
            <p className="text-gray-600">Administra los usuarios del sistema VetSync</p>
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
            initialData={selectedUser}
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
            userName={selectedUser?.nombre_completo}
          />
        </main>
      </div>
    </div>
  )
}
