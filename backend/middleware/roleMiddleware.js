const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        // Asegurar que req.usuario existe
        if (!req.usuario) {
            return res.status(403).json({ error: 'Acceso denegado. Usuario no autenticado.' });
        }

        // Convertir rol del usuario a número para asegurar comparación correcta
        const idRolUsuario = parseInt(req.usuario.id_rol);

        // Si rolesPermitidos contiene el rol del usuario (comparando números)
        if (!rolesPermitidos.includes(idRolUsuario)) {
            console.log(`[RBAC BLOCK] UserRole: ${idRolUsuario} | Expected: ${rolesPermitidos} | URL: ${req.originalUrl} | Method: ${req.method}`);
            return res.status(403).json({ error: 'Acceso denegado. No tienes permisos para realizar esta acción.' });
        }

        next();
    };
};


module.exports = permitirRoles;
