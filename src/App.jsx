import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './stores/authStore';

// Lazy-loaded pages
const LandingPage     = lazy(() => import('./pages/LandingPage/LandingPage'));
const Login           = lazy(() => import('./pages/Auth/Login'));
const SignUp          = lazy(() => import('./pages/Auth/SignUp'));
const ForgotPassword  = lazy(() => import('./pages/Auth/ForgotPassword'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const Inbox           = lazy(() => import('./pages/Inbox/Inbox'));
const LeadManagement  = lazy(() => import('./pages/LeadManagement/LeadManagement'));
const Leads           = lazy(() => import('./pages/Leads/Leads'));
const Scenarios       = lazy(() => import('./pages/Scenarios/Scenarios'));
const KnowledgeBase   = lazy(() => import('./pages/KnowledgeBase/KnowledgeBase'));
const Analytics       = lazy(() => import('./pages/Analytics/Analytics'));
const Domains         = lazy(() => import('./pages/Domains/Domains'));
const Settings        = lazy(() => import('./pages/Settings/Settings'));
const WidgetSettings  = lazy(() => import('./pages/WidgetSettings'));
const WidgetPreview   = lazy(() => import('./pages/WidgetPreview'));

function AppRoutes() {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/inbox" element={<ProtectedRoute><MainLayout><Inbox /></MainLayout></ProtectedRoute>} />
      <Route path="/pipeline" element={<ProtectedRoute><MainLayout><LeadManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><MainLayout><Leads /></MainLayout></ProtectedRoute>} />
      <Route path="/scenarios" element={<ProtectedRoute><MainLayout><Scenarios /></MainLayout></ProtectedRoute>} />
      <Route path="/knowledge-base" element={<ProtectedRoute><MainLayout><KnowledgeBase /></MainLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><MainLayout><Analytics /></MainLayout></ProtectedRoute>} />
      <Route path="/domains" element={<ProtectedRoute><MainLayout><Domains /></MainLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
      <Route path="/widget-settings" element={<ProtectedRoute><MainLayout><WidgetSettings /></MainLayout></ProtectedRoute>} />
      <Route path="/preview/widget/:workspaceId" element={<ProtectedRoute><WidgetPreview /></ProtectedRoute>} />
      <Route path="/preview/widget" element={<ProtectedRoute><WidgetPreview /></ProtectedRoute>} />

      {/* Redirects */}
      <Route path="/crm" element={<Navigate to="/pipeline" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-[#f3f4f6]">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
