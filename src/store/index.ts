import { configureStore } from "@reduxjs/toolkit";
import { api } from "../services/api"; 
import { parcelaApi } from "../services/parcelas";
import themeReducer from "../slices/themeSlice";
import authReducer from "../slices/authSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    [api.reducerPath]: api.reducer,
    [parcelaApi.reducerPath]: parcelaApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
  .concat(api.middleware)
  .concat(parcelaApi.middleware),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;