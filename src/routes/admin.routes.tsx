import { Route, Routes } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import RequireAuth from "../components/common/RequireAuth";
import Index from "../pages/admin/index/Index";
import InactiveParcelasView from "../pages/admin/view/InactiveView";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="parcelas" element={ <RequireAuth> <Dashboard /> </RequireAuth> } />
        <Route path="dashboard" element={ <RequireAuth> <Index /> </RequireAuth> } />
        <Route path="parcelas/inactivas" element={ <RequireAuth> <InactiveParcelasView /> </RequireAuth> } />
      </Route>
    </Routes>
  );
}
