import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import InventoryPage from './pages/Inventory';
import DebtPage from './pages/Debt';
import AnalyticsPage from './pages/Analytics';
import AdvisorPage from './pages/Advisor';
import PassportPage from './pages/Passport';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="debts" element={<DebtPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="advisor" element={<AdvisorPage />} />
        <Route path="passport" element={<PassportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
