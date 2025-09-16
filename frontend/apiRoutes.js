// archivo apiRoutes.js
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api";

export const ROUTES = {
  postLogin: `${BASE_URL}/login`,
  gestionUser: `${BASE_URL}`  
  // ... otras rutas
};
