import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

// Allow explicit dev bypass via VITE_BYPASS_AUTH=true in .env.development
const DEV_BYPASS = import.meta.env.DEV && (import.meta.env.VITE_BYPASS_AUTH === 'true');

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Allow explicit dev bypass only when env var is set.
  if (DEV_BYPASS) return children;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f3f4f6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
