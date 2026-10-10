import { Navigate, Route, Routes } from "react-router-dom";
import { CombatNetraRoutes } from "./modules/combat-netra";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/netra-2/dashboard" replace />} />
      <Route path="/netra-2/*" element={<CombatNetraRoutes />} />
      <Route path="*" element={<Navigate to="/netra-2/dashboard" replace />} />
    </Routes>
  );
}