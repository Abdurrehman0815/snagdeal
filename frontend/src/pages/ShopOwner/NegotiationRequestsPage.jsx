import React, { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Text, Flex, Spinner, Alert, AlertIcon, Button, VStack, HStack } from '@chakra-ui/react';
import { useAuthStore } from '../../store/authStore';
import { getShopNegotiations, respondToNegotiation } from '../../api/negotiations'; // Import negotiation API functions
import useSocket from '../../hooks/useSocket'; // Import the custom socket hook
import { useNavigate } from 'react-router-dom';

function NegotiationRequestsPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket(user?._id); // Connect socket if shop owner is logged in

    const [negotiations, setNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responseLoading, setResponseLoading] = useState({}); // To track loading state per negotiation

    // Basic protection: Redirect if not logged in or not a shop owner
    useEffect(() => {
        if (!user || user.role !== 'shopOwner') {
            navigate('/login'); // Redirect to login if not authorized
        }
    }, [user, navigate]);

    const fetchNegotiations = useCallback(async () => {
        if (!user || !user.shopId) {
            setLoading(false);
            setError("Shop owner ID not available. Please log in as a shop owner.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await getShopNegotiations(); // Fetch pending negotiations for this shop
            setNegotiations(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch negotiation requests.');
            console.error("Error fetching negotiations:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNegotiations();
    }, [fetchNegotiations]); // Initial fetch and refetch when fetchNegotiations changes

    // Socket.IO Listener for new negotiation requests
    useEffect(() => {
        if (socket && user && user.role === 'shopOwner') {
            const handleNewNegotiationRequest = (data) => {
                if (data.shopOwnerId === user.shopId) { // Ensure it's for this shop owner's shop
                    alert(`New Negotiation Request for ${data.productName} from ${data.userName} at $${data.proposedPrice}`);
                    fetchNegotiations(); // Re-fetch the list to show the new request
                }
            };

            socket.on('newNegotiationRequest', handleNewNegotiationRequest);

            return () => {
                socket.off('newNegotiationRequest', handleNewNegotiationRequest);
            };
        }
    }, [socket, user, fetchNegotiations]); // Re-subscribe if socket, user, or fetchNegotiations changes

    const handleResponse = async (negotiationId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this negotiation?`)) {
            return;
        }
        setResponseLoading(prev => ({ ...prev, [negotiationId]: true }));
        try {
            const res = await respondToNegotiation(negotiationId, action);
            alert(res.message); // Show message from backend (e.g., 'Negotiation accepted.')
            fetchNegotiations(); // Re-fetch list to remove responded negotiation
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${action} negotiation.`);
            console.error(`Error responding to negotiation (${action}):`, err);
        } finally {
            setResponseLoading(prev => ({ ...prev, [negotiationId]: false }));
        }
    };

    if (!user || user.role !== 'shopOwner') {
        return <Alert status="warning" mt="4"><AlertIcon /> Access Denied. Please log in as a Shop Owner.</Alert>;
    }

    if (loading) {
        return (
            <Flex justify="center" align="center" minHeight="50vh">
                <Spinner size="xl" color="teal.500" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Alert status="error" mt="4">
                <AlertIcon />
                Error: {error}
            </Alert>
        );
    }

    return (
        <Box p="4">
            <Heading as="h2" size="xl" mb="6" textAlign="center">Pending Negotiation Requests</Heading>
            {isConnected && (user && user.role === 'shopOwner') && (
                <Text fontSize="sm" color="green.500" textAlign="center" mb="4">Real-time connection: Connected</Text>
            )}
            {!isConnected && (user && user.role === 'shopOwner') && (
                <Text fontSize="sm" color="red.500" textAlign="center" mb="4">Real-time connection: Disconnected</Text>
            )}

            {negotiations.length === 0 ? (
                <Text textAlign="center" fontSize="lg" mt="10">No pending negotiation requests at this time.</Text>
            ) : (
                <VStack spacing="4" align="stretch">
                    {negotiations.map((negotiation) => (
                        <Box key={negotiation._id} borderWidth="1px" borderRadius="lg" p="4" boxShadow="sm">
                            <Text fontWeight="bold" fontSize="lg">Product: {negotiation.product?.name}</Text>
                            <Text>Current Selling Price: ${negotiation.product?.sellingPrice}</Text>
                            <Text color="purple.600" fontWeight="bold">Proposed Price: ${negotiation.proposedPrice}</Text>
                            <Text fontSize="sm" color="gray.600">From User: {negotiation.user?.name} ({negotiation.user?.email})</Text>
                            <Text fontSize="sm" color="gray.500">Attempts Left (User Side): {negotiation.attemptsLeft + 1} / 3</Text> {/* +1 to show actual attempts made */}

                            <HStack spacing="4" mt="4">
                                <Button
                                    colorScheme="green"
                                    onClick={() => handleResponse(negotiation._id, 'accept')}
                                    isLoading={responseLoading[negotiation._id]}
                                >
                                    Accept
                                </Button>
                                <Button
                                    colorScheme="red"
                                    onClick={() => handleResponse(negotiation._id, 'reject')}
                                    isLoading={responseLoading[negotiation._id]}
                                >
                                    Reject
                                </Button>
                            </HStack>
                        </Box>
                    ))}
                </VStack>
            )}
        </Box>
    );
}

export default NegotiationRequestsPage;