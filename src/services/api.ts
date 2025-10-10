import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// Configuración del servicio API
console.log("VITE_IS_PROD:", import.meta.env.VITE_IS_PROD);

const API_BASE_URL =
  import.meta.env.VITE_IS_PROD === "FALSE"
    ? import.meta.env.VITE_API_BASE_URL_LOCAL
    : import.meta.env.VITE_API_BASE_URL_PROD;

if (!API_BASE_URL) {
  throw new Error("La variable de entorno VITE_API_BASE_URL no está definida");
}

export const api = createApi({
  reducerPath: "api", // Nombre del reducer en el store
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Endpoint para obtener los posts
    getPosts: builder.query({
      query: () => "/posts",
    }),

    // Endpoint para login
    login: builder.mutation({
      query: (credentials) => (
        console.log("Credenciales de inicio de sesión:", credentials),
        {
          url: "/auth/login",
          method: "POST",
          body: credentials,
        }
      ),
    }),

    // Endpoint para sensores
    getSensors: builder.query({
      query: () => "/sensors",
      transformResponse: (response: any) => {
        // Normalizamos la respuesta para que siempre sea un array de lecturas
        if (Array.isArray(response)) {
          return response;
        }
        if (typeof response === "object" && response !== null) {
          return Object.entries(response).flatMap(([sensorType, readings]: any) => {
            if (typeof readings === "object") {
              return Object.entries(readings).map(([sensorId, r]: any) => ({
                sensorType,
                sensorId,
                ...r,
              }));
            }
            return [];
          });
        }
        return [];
      },
    }),
  }),
});

// Exportar los hooks generados automáticamente por RTK Query
export const {
  useGetPostsQuery,
  useLoginMutation,
  useGetSensorsQuery,
} = api;
