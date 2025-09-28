import { Route, Routes } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import RequireAuth from "../components/common/RequireAuth";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="dashboard" element={ <RequireAuth> <Dashboard /> </RequireAuth> } />
      </Route>
    </Routes>
  );
}
