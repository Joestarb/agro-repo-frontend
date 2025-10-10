// parcelaApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { Parcela } from "../interfaces/parcela";

// --- Interfaz de Datos ---

// Tipo para la creación/actualización (sin 'id' ni 'activa')
export type ParcelaPayload = Omit<Partial<Parcela>, 'id' | 'activa'>;

// --- Configuración (Asumiendo que usa las mismas variables de entorno) ---

const API_BASE_URL = import.meta.env.VITE_IS_PROD === 'FALSE' 
  ? import.meta.env.VITE_API_BASE_URL_LOCAL 
  : import.meta.env.VITE_API_BASE_URL_PROD; 

if(!API_BASE_URL){
  throw new Error("La variable de entorno VITE_API_BASE_URL no está definida");
}

// --- Creación del Servicio API de Parcelas ---

export const parcelaApi = createApi({
  
  reducerPath: "parcelaApi",
  tagTypes: ['Parcelas'], 
  
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, {getState}) => {
      const token = (getState() as RootState).auth.token;
      if(token){
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
    
  endpoints: (builder) => ({
    
    // OBTENER TODAS LAS PARCELAS (GET /)
    getParcelas: builder.query<Parcela[], void>({
      query: () => "/plots",
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Parcelas' as const, id })),
              { type: 'Parcelas', id: 'LIST' },
            ]
          : [{ type: 'Parcelas', id: 'LIST' }],
    }),
    
    // CREAR UNA NUEVA PARCELA (POST /)
    createParcela: builder.mutation<Parcela, ParcelaPayload>({
      query: (nuevaParcela) => ({
        url: "/plots",
        method: "POST",
        body: nuevaParcela,
      }),
      invalidatesTags: [{ type: 'Parcelas', id: 'LIST' }],
    }),

    // ACTUALIZAR UNA PARCELA EXISTENTE (PUT /:id)
    updateParcela: builder.mutation<Parcela, { id: number; data: ParcelaPayload }>({
      query: ({ id, data }) => ({
        url: `/plots/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Parcelas', id }, { type: 'Parcelas', id: 'LIST' }],
    }),

    // ELIMINAR UNA PARCELA (DELETE /:id)
    deleteParcela: builder.mutation<void, number>({
      query: (id) => ({
        url: `/plots/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Parcelas', id }, { type: 'Parcelas', id: 'LIST' }],
    }),
  }),
});

// Exportar los hooks
export const { 
  useGetParcelasQuery, 
  useCreateParcelaMutation,
  useUpdateParcelaMutation,
  useDeleteParcelaMutation
} = parcelaApi;