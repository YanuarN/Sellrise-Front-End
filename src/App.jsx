import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout';
import LeadManagement from './pages/LeadManagement/LeadManagement';
import LandingPage from './pages/LandingPage/LandingPage';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard';
import WidgetSettings from './pages/WidgetSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes (placeholder without actual Auth wrapper for now) */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/crm"
          element={
            <MainLayout>
              <LeadManagement />
            </MainLayout>
          }
        />
        <Route
          path="/admin/widget-settings"
          element={
            <MainLayout>
              <WidgetSettings />
            </MainLayout>
          }
        />
        {/* Default redirect for unhandled auth routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
