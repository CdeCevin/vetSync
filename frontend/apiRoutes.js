// archivo apiRoutes.js
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://vet-sync.vercel.app/";

export const ROUTES = {
  postLogin: `${BASE_URL}/login`,
  base: `${BASE_URL}`,  
  // ... otras rutas
};
