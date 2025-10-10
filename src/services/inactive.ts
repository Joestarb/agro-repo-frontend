import { api } from "./api";

console.log("VITE_IS_PROD:", import.meta.env.VITE_IS_PROD);

const API_BASE_URL =
  import.meta.env.VITE_IS_PROD === "FALSE"
    ? import.meta.env.VITE_API_BASE_URL_LOCAL
    : import.meta.env.VITE_API_BASE_URL_PROD;

if (!API_BASE_URL) {
  throw new Error("La variable de entorno VITE_API_BASE_URL no está definida");
}

export const inactiveApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getParcelasInactivas: builder.query<any[], void>({
      // usar URL absoluta para evitar depender del baseUrl del `api`
      query: () => `${API_BASE_URL}/plots/inactivas`,
    }),
  }),
  overrideExisting: false,
});

export const { useGetParcelasInactivasQuery } = inactiveApi;