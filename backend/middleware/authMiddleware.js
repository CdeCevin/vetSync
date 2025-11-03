const jwt = require('jsonwebtoken');  
  
const verifyToken = (req, res, next) => {  
  const token = req.headers.authorization?.split(' ')[1];  
    
  if (!token) {  
    return res.status(401).json({ error: 'Token no proporcionado' });  
  }  
    
  try {  
    console.log('Verificando con el secreto:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    
    // Validar que el ID de la URL coincida con el del token  
    if (req.params.idClinica && decoded.id_clinica !== parseInt(req.params.idClinica)) {  
      return res.status(403).json({ error: 'Acceso denegado a esta clínica' });  
    }  
      
    req.usuario = decoded;  
    req.clinicaId = decoded.id_clinica; // Ahora viene del token verificado  
    next();  
  } catch (error) {  
    return res.status(401).json({ error: 'Token inválido o expirado' });  
  }  
};  
  
module.exports = verifyToken;