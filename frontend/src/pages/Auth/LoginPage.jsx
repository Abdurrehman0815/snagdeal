import React, { useState } from 'react';
import { Box, Heading, VStack, FormControl, FormLabel, Input, Button, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { useHistory, Link } from 'react-router-dom'; // CHANGED: useNavigate to useHistory

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory(); // CHANGED: useNavigate to useHistory
  const authStoreLogin = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userData = await login(email, password);
      authStoreLogin(userData);
      console.log('Login successful:', userData);

      if (userData.role === 'user') {
        history.push('/'); // CHANGED: navigate to history.push
      } else if (userData.role === 'shopOwner') {
        history.push('/shop/dashboard'); // CHANGED: navigate to history.push
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="md" mx="auto" mt="8" p="6" variant="panel"> {/* Using variant="panel" */}
      <Heading as="h2" size="xl" textAlign="center" mb="6">Login</Heading>
      {error && (
        <Alert status="error" mb="4">
          <AlertIcon />
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <VStack spacing="4">
          <FormControl id="email">
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" size="lg" width="full" isLoading={loading}>
            Login
          </Button>
        </VStack>
      </form>
      <Text mt="4" textAlign="center">
        Don't have an account?{' '}
        <Link to="/register/user">Register as User</Link> or{' '}
        <Link to="/register/shop-owner">Register as Shop Owner</Link>
      </Text>
    </Box>
  );
}

export default LoginPage;