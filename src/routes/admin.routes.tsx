import { Route, Routes } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import RequireAuth from "../components/common/RequireAuth";
import Index from "../pages/admin/index/Index";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="parcelas" element={ <RequireAuth> <Dashboard /> </RequireAuth> } />
        <Route path="dashboard" element={ <RequireAuth> <Index /> </RequireAuth> } />
      </Route>
    </Routes>
  );
}
