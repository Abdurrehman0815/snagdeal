import React, { useState } from 'react';
import { Box, Heading, VStack, FormControl, FormLabel, Input, Button, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { registerUser } from '../../api/auth'; // Import your registerUser API call
import { useNavigate, Link } from 'react-router-dom';

function RegisterUserPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await registerUser(name, email, password); // Call your backend register API
            alert('Registration successful! Please log in.'); // Simple alert for success
            navigate('/login'); // Redirect to login page after successful registration
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxWidth="md" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
            <Heading as="h2" size="xl" textAlign="center" mb="6">Register as User</Heading>
            {error && (
                <Alert status="error" mb="4">
                    <AlertIcon />
                    {error}
                </Alert>
            )}
            <form onSubmit={handleSubmit}>
                <VStack spacing="4">
                    <FormControl id="name">
                        <FormLabel>Name</FormLabel>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                    </FormControl>
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
                            placeholder="Enter password"
                            required
                        />
                    </FormControl>
                    <FormControl id="confirmPassword">
                        <FormLabel>Confirm Password</FormLabel>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                        />
                    </FormControl>
                    <Button type="submit" colorScheme="teal" size="lg" width="full" isLoading={loading}>
                        Register
                    </Button>
                </VStack>
            </form>
            <Text mt="4" textAlign="center">
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'teal' }}>Login here</Link>
            </Text>
        </Box>
    );
}

export default RegisterUserPage;