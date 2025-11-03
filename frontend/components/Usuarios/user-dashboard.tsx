"use client"
import { ROUTES } from '../../apiRoutes';
import { useAuth } from "../user-context"
import { useEffect, useState } from "react"
import { UserFilters } from "./user-filters"
import { DeleteConfirmModal } from "../modals/delete-confirm-modal"
import { UserTable } from "./user-table"
import { UserModal } from "./user-modal"
import { Contrail_One } from 'next/font/google';

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
    const res = await fetch(`${ROUTES.gestionUser}/${idClinica}/usuarios`, {
    cache: 'no-store' // <-- AÑADE ESTO
  });
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
     const body = {
       nombre_completo: userData.nombre_completo,
       correo_electronico: userData.correo_electronico,
       id_rol: userData.id_rol,
      contraseña: userData.contraseña
    }
     const response = await fetch(`${ROUTES.gestionUser}/${idClinica}/usuarios/`, { // Guarda la respuesta
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(body),
     })

    // --- ESTO ES LO QUE FALTA ---
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el usuario.");
    }

    return response.json(); // Devuelve el éxito
  }

  const handleEditUser = async (userData: Partial<User>) => {
    // Nota: El 'if (!selectedUser)' no es necesario aquí, 
    // el modal ya tiene el ID en 'userData.id'
    const body = {
       id: userData.id,
      nombre_completo: userData.nombre_completo,
      correo_electronico: userData.correo_electronico,
      id_rol: userData.id_rol,
      contraseña: userData.contraseña,
    }
    // Corregí un '}' extra en tu URL original
    const response = await fetch(`${ROUTES.gestionUser}/${idClinica}/usuarios/${userData.id}`, { 
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      })

    // --- ESTO ES LO QUE FALTA ---
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el usuario.");
    }
    
    return response.json(); // Devuelve el éxito
    }

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      throw new Error("No hay ningún usuario seleccionado para eliminar.");
    }
    const response = await fetch(`${ROUTES.gestionUser}/${idClinica}/usuarios/${selectedUser.id}`, { 
      method: "DELETE" 
    });
    // Lanza un error si la API falló
    if (!response.ok) {
      const errorData = await response.json(); // Intenta leer el error de la API
      throw new Error(errorData.message || "No se pudo eliminar el usuario.");
    }

    //Devuelve los datos (o true) si tuvo éxito
    return response.json(); 
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
            userName={`usuario ${selectedUser?.nombre_completo}`}
        />
        </main>
      </div>
    </div>
  )
}
