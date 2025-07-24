import React from 'react';
// CORRECTED IMPORTS FOR REACT ROUTER V5: Route, Redirect, useHistory
import { Route, Redirect, useHistory } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Spinner, Flex, Text } from '@chakra-ui/react';

/**
 * A component to protect routes based on user authentication and role (for React Router v5).
 * @param {object} props
 * @param {string} [props.role] - The required role ('user' or 'shopOwner'). If not provided, only checks for authentication.
 * @param {React.ComponentType<any>} [props.component] - The component to render if authorized.
 * @param {object} [props.rest] - Other props passed to Route.
 */
const ProtectedRoute = ({ role, component: Component, ...rest }) => {
  const { user } = useAuthStore();
  const history = useHistory(); // useHistory for programmatic navigation in v5
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 50);
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

  // Render prop for Route in v5
  return (
    <Route
      {...rest}
      render={(props) => {
        // 1. Check if user is authenticated at all
        if (!user) {
          return <Redirect to="/login" />; // Redirect for v5
        }

        // 2. If a specific role is required, check it
        if (role && user.role !== role) {
          console.warn(`User ${user.name} (role: ${user.role}) attempted to access role-restricted route for role: ${role}. Redirecting.`);
          if (user.role === 'user') {
              return <Redirect to="/" />;
          } else if (user.role === 'shopOwner') {
              return <Redirect to="/shop/dashboard" />;
          }
          // Fallback for unexpected roles or if '/unauthorized' is desired
          return <Redirect to="/login" />; // Or /unauthorized
        }

        // If authenticated and role matches (or no role specified), render the component
        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;