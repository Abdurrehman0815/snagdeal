import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Spinner, Flex, Text } from '@chakra-ui/react'; // For loading state

/**
 * A component to protect routes based on user authentication and role.
 * @param {object} props
 * @param {string} [props.role] - The required role ('user' or 'shopOwner'). If not provided, only checks for authentication.
 * @param {React.ReactNode} [props.children] - Child components (alternative to Outlet).
 */
const ProtectedRoute = ({ role, children }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(true); // To handle initial state loading from localStorage

  React.useEffect(() => {
    // Give a very small delay to ensure Zustand has time to hydrate from localStorage
    const timer = setTimeout(() => {
      setLoading(false);
    }, 50); // Small delay
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="50vh">
        <Spinner size="xl" color="teal.500" />
        <Text ml="4">Loading user session...</Text>
      </Flex>
    );
  }

  // 1. Check if user is authenticated at all
  if (!user) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  // 2. If a specific role is required, check it
  if (role && user.role !== role) {
    // Redirect to a dashboard or a 403 page if role doesn't match
    console.warn(`User ${user.name} (role: ${user.role}) attempted to access role-restricted route for role: ${role}. Redirecting.`);
    if (user.role === 'user') {
        return <Navigate to="/" replace />; // User tries to access shop owner route
    } else if (user.role === 'shopOwner') {
        return <Navigate to="/shop/dashboard" replace />; // Shop owner tries to access user route or different shop owner content
    }
    return <Navigate to="/unauthorized" replace />; // Generic unauthorized page
  }

  // If authenticated and role matches (or no role specified), render the children
  return children ? children : <Outlet />;
};

export default ProtectedRoute;