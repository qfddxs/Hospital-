import axios from 'axios';

// 1. Define la URL base de tu API de Django
// Es buena práctica usar una variable de entorno para esto en React con Vite
// Asegúrate de tener un archivo .env.development con VITE_API_BASE_URL=http://127.0.0.1:8000/api/
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';

// 2. Crea una instancia de axios con la configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Interceptor de Peticiones: Añade el token de acceso a cada solicitud
// Este interceptor se ejecuta ANTES de que se envíe cada petición.
apiClient.interceptors.request.use(
  (config) => {
    // Intenta obtener el token de acceso del almacenamiento local
    const accessToken = localStorage.getItem('access_token');

    // Si hay un token, lo añade a la cabecera 'Authorization'
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Interceptor de Respuestas: Maneja la expiración del token de acceso
// Este interceptor se ejecuta DESPUÉS de que se recibe una respuesta.
apiClient.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, la devuelve directamente
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (Unauthorized) y no es la petición de refresco de token
    // y no es la petición original de login, intenta refrescar el token.
    if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== 'token/') {
      originalRequest._retry = true; // Marca la petición original para evitar bucles infinitos

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Intenta obtener un nuevo token de acceso usando el token de refresco
          const response = await axios.post(`${API_BASE_URL}token/refresh/`, {
            refresh: refreshToken,
          });

          // Guarda el nuevo token de acceso
          localStorage.setItem('access_token', response.data.access);

          // Actualiza la cabecera de la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

          // Reintenta la petición original con el nuevo token
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Si el refresco falla (ej. refresh token inválido/expirado),
          // borra los tokens y redirige al login.
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login'; // Redirige al login
          return Promise.reject(refreshError);
        }
      } else {
        // Si no hay refresh token, redirige al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;