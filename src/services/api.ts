import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
// Configuración del servicio API
export const api = createApi({
  reducerPath: "api", // Nombre del reducer en el store
  baseQuery: 
  fetchBaseQuery({ 
    baseUrl: "http://localhost:3000",
    prepareHeaders: (headers, {getState}) => {
      const token = (getState() as RootState).auth.token;
      if(token){
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }), // URL base de la API
  endpoints: (builder) => ({
    // Endpoint para obtener los posts
    getPosts: builder.query({
      query: () => "/posts", // Ruta del endpoint
    }),
    login: builder.mutation({
    query: (credentials) => ({
      url: "/auth/login",
      method: "POST",
      body: credentials,
      }),
    }),
  }),
});

// Exportar el hook generado automáticamente por RTK Query
export const { useGetPostsQuery, useLoginMutation } = api;