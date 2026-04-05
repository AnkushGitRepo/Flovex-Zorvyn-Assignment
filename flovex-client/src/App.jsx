import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Settings';
import ApiDocs from './pages/ApiDocs';
import { useTheme } from './hooks/useTheme';

function ThemeRoot() {
  useTheme(); // applies dark class to <html> on mount + when pref changes
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeRoot />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="insights" element={<Insights />} />
            <Route path="api-docs" element={<ApiDocs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
