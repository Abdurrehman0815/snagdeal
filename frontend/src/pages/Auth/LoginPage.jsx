import React, { useState } from 'react';
import { Box, Heading, VStack, FormControl, FormLabel, Input, Button, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { login } from '../../api/auth'; // Import your login API call
import { useAuthStore } from '../../store/authStore'; // Import your Zustand auth store
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const authStoreLogin = useAuthStore((state) => state.login); // Get the login action from the store

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const userData = await login(email, password); // Call your backend login API
            authStoreLogin(userData); // Update Zustand store with user data
            console.log('Login successful:', userData);

            // Redirect based on role
            if (userData.role === 'user') {
                navigate('/'); // Redirect regular users to home page
            } else if (userData.role === 'shopOwner') {
                navigate('/shop/dashboard'); // Redirect shop owners to their dashboard
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxWidth="md" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
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
                <Link to="/register/user" style={{ color: 'teal' }}>Register as User</Link> or{' '}
                <Link to="/register/shop-owner" style={{ color: 'teal' }}>Register as Shop Owner</Link>
            </Text>
        </Box>
    );
}

export default LoginPage;