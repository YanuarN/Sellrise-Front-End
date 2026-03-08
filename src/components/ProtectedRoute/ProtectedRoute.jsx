import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

// TODO: Set to false to re-enable auth guard for production
const BYPASS_AUTH = true;

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Skip guard during development
  if (BYPASS_AUTH) return children;

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
