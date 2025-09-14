// Componente AdminPanel reemplaza o queda en carpeta componentes
export function AdminPanel() {
  return (
    <div>
      <h1 className="font-serif font-bold text-2xl mb-4">Panel Administrador</h1>
      <section className="mb-6">
        <h2 className="font-semibold">Logs del sistema</h2>
        {/* Aquí va el contenido o componente que muestra logs */}
        <p>Visualización y gestión de logs (próximamente)</p>
      </section>
      <section>
        <h2 className="font-semibold">Gestión de usuarios</h2>
        {/* Aquí iría el CRUD de usuarios */}
        <p>CRUD de usuarios (próximamente)</p>
      </section>
    </div>
  )
}
