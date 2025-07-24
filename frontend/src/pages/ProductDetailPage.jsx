import React, { useEffect, useState } from 'react';
// No change to Link, useParams, useHistory not directly used here
import { useParams, Link } from 'react-router-dom';
import { Box, Heading, Text, Image, Button, Flex, Spinner, Alert, AlertIcon, VStack, HStack, Divider, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, FormControl, FormLabel, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, useToast, List, ListItem, Select, Stat, StatLabel, StatNumber, StatGroup, Textarea } from '@chakra-ui/react';
import { getProductById, createProductReview } from '../api/products';
import { requestNegotiation } from '../api/negotiations';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import useSocket from '../hooks/useSocket';

function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket(user?._id);
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems);
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmittingNegotiation, setIsSubmittingNegotiation] = useState(false);
  const [qty, setQty] = useState(1);

  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [proposedPrice, setProposedPrice] = useState('');
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  const CLIENT_MAX_NEGOTIATION_ATTEMPTS = 3;

  const productInCart = cartItems.find(item => item.product === id);

  const hasUserReviewed = product?.reviews?.find(
    (r) => r.user.toString() === user?._id?.toString()
  );

  const fetchProductAndReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch product details.');
      console.error("Error fetching product details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndReviews();
  }, [id, user]);

  useEffect(() => {
    if (socket && user) {
      const handleNegotiationOutcome = (data) => {
        if (data.productId === id) {
          setNegotiationMessage(data.message);
          setAttemptsLeft(data.attemptsLeft);
          if (data.status === 'accepted') {
            toast({
              title: "Negotiation Accepted!",
              description: data.message,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            onClose();
          } else if (data.status === 'rejected') {
            toast({
              title: "Negotiation Rejected",
              description: data.message,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }
      };

      socket.on('negotiationOutcome', handleNegotiationOutcome);

      return () => {
        socket.off('negotiationOutcome', handleNegotiationOutcome);
      };
    }
  }, [socket, id, user, onClose, toast]);

  const handleSubmitNegotiation = async () => {
    if (!user || user.role !== 'user') {
      setNegotiationMessage('Please log in as a user to negotiate.');
      return;
    }
    if (!proposedPrice || isNaN(proposedPrice) || parseFloat(proposedPrice) <= 0) {
      setNegotiationMessage('Please enter a valid proposed price.');
      return;
    }

    setIsSubmittingNegotiation(true);
    setNegotiationMessage('');

    try {
      const res = await requestNegotiation(id, parseFloat(proposedPrice));
      setProposedPrice('');
    } catch (err) {
      setNegotiationMessage(err.response?.data?.message || 'Failed to send negotiation request.');
      if (err.response?.data?.attemptsLeft !== undefined) {
         setAttemptsLeft(err.response.data.attemptsLeft);
      }
    } finally {
      setIsSubmittingNegotiation(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.sellingPrice,
      qty: qty,
      countInStock: product.countInStock,
      shop: product.shop._id,
    });
    toast({
      title: "Added to cart!",
      description: `${qty} x ${product.name} added to your cart.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    setReviewLoading(true);
    setReviewSuccess(false);

    if (!rating || !comment) {
      setReviewError('Please enter a rating and a comment.');
      setReviewLoading(false);
      return;
    }

    try {
      await createProductReview(id, { rating: Number(rating), comment });
      setReviewSuccess(true);
      setRating('');
      setComment('');
      toast({
        title: "Review Submitted!",
        description: "Thank you for your review.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchProductAndReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
      console.error("Review submission error:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const isNegotiationDisabled = !user || user.role !== 'user' || (attemptsLeft !== null && attemptsLeft < 0);

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

  if (!product) {
    return (
      <Box p="4" textAlign="center">
        <Heading as="h2" size="xl" mb="6">Product Not Found</Heading>
        <Text>The product you are looking for does not exist.</Text>
        <Button as={Link} to="/" colorScheme="teal" mt="4">Back to Products</Button>
      </Box>
    );
  }

  return (
    <Box p="4" maxWidth="6xl" mx="auto">
      <Flex direction={{ base: "column", md: "row" }} alignItems="center" justifyContent="center" gap="8">
        <Box flexShrink={0} width={{ base: "100%", md: "40%" }}>
          <Image src={product.image} alt={product.name} objectFit="contain" maxHeight="400px" width="100%" borderRadius="lg" boxShadow="md" />
        </Box>

        <VStack align="start" spacing="4" flex="1" width={{ base: "100%", md: "60%" }}>
          <Heading as="h1" size="xl">{product.name}</Heading>
          <Text fontSize="lg" color="gray.600">Category: {product.category}</Text>
          <Text fontSize="md" color="gray.500">Sold by: {product.shop?.shopName || 'Unknown Shop'}</Text>

          <Divider />

          <Text fontSize="lg">
            <Text as="span" fontWeight="bold">Description:</Text> {product.description}
          </Text>

          <Divider />

          <HStack spacing="4" align="center">
            <Text fontSize="xl" fontWeight="bold" color="red.500" as="s">
              MRP: ${product.mrp}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="teal.600">
              Price: ${product.sellingPrice}
            </Text>
          </HStack>

          <Divider />

          <HStack spacing="4" mt="4">
            <FormControl width="120px">
              <NumberInput defaultValue={1} min={1} max={product.countInStock} onChange={(valueString) => setQty(parseInt(valueString))}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button colorScheme="blue" size="lg" onClick={handleAddToCart} isDisabled={product.countInStock === 0}>
              {productInCart ? 'Update Cart' : 'Add to Cart'}
            </Button>
            <Button colorScheme="green" size="lg" isDisabled={product.countInStock === 0}>Buy Now</Button>
            <Button
              colorScheme="purple"
              size="lg"
              onClick={onOpen}
              isDisabled={isNegotiationDisabled || product.countInStock === 0}
            >
              Negotiate Price
            </Button>
          </HStack>

          {product.countInStock === 0 && (
            <Text color="red.500" mt="2">Out of Stock</Text>
          )}
          {product.countInStock > 0 && (
            <Text fontSize="sm" color="gray.500" mt="2">
              Only {product.countInStock} left in stock!
            </Text>
          )}

          {user && user.role === 'user' && attemptsLeft !== null && attemptsLeft < 0 && (
            <Text color="red.500" mt="2">You have exhausted your negotiation attempts for this product.</Text>
          )}
          {user && user.role !== 'user' && (
            <Text color="gray.500" mt="2">Only users can negotiate prices.</Text>
          )}
          {user && user.role === 'user' && isConnected && (
            <Text fontSize="sm" color="green.500">Real-time connection: Connected</Text>
          )}
          {user && user.role === 'user' && !isConnected && (
            <Text fontSize="sm" color="red.500">Real-time connection: Disconnected</Text>
          )}
        </VStack>
      </Flex>

      <Divider my="8" />

      {/* Product Reviews Section */}
      <Box>
        <Heading as="h3" size="lg" mb="4" textAlign="center">Reviews</Heading>
        <Flex justify="center" align="center" mb="4" gap="2">
            <StatGroup>
                <Stat>
                    <StatLabel>Average Rating</StatLabel>
                    <StatNumber>{product.rating?.toFixed(1) || 'N/A'}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Total Reviews</StatLabel>
                    <StatNumber>{product.numReviews}</StatNumber>
                </Stat>
            </StatGroup>
        </Flex>

        {product.reviews.length === 0 ? (
          <Text textAlign="center" mt="4">No reviews yet. Be the first to review!</Text>
        ) : (
          <List spacing={3} mt="4">
            {product.reviews.map((review) => (
              <ListItem key={review._id} p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold">{review.name}</Text>
                  <Text fontSize="sm" color="gray.600">{new Date(review.createdAt).toLocaleDateString()}</Text>
                </Flex>
                <Text fontSize="md" color="teal.500" fontWeight="bold">Rating: {review.rating} / 5</Text>
                <Text mt="2">{review.comment}</Text>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider my="8" />

      {/* Review Submission Form */}
      <Box>
        <Heading as="h3" size="lg" mb="4" textAlign="center">Write a Customer Review</Heading>
        {reviewError && (
          <Alert status="error" mb="4">
            <AlertIcon />
            {reviewError}
          </Alert>
        )}
        {reviewSuccess && (
          <Alert status="success" mb="4">
            <AlertIcon />
            Review submitted successfully!
          </Alert>
        )}
        {user && user.role === 'user' ? (
          hasUserReviewed ? (
            <Alert status="info" mb="4">
              <AlertIcon />
              You have already reviewed this product.
            </Alert>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <VStack spacing="4">
                <FormControl id="rating" isRequired>
                  <FormLabel>Rating</FormLabel>
                  <Select value={rating} onChange={(e) => setRating(e.target.value)} placeholder="Select Rating">
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </Select>
                </FormControl>
                <FormControl id="comment" isRequired>
                  <FormLabel>Comment</FormLabel>
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your review here..." />
                </FormControl>
                <Button type="submit" colorScheme="teal" size="lg" width="full" isLoading={reviewLoading}>
                  Submit Review
                </Button>
              </VStack>
            </form>
          )
        ) : (
          <Alert status="info" mb="4">
            <AlertIcon />
            Please <Link to="/login" style={{ color: 'teal' }}>log in</Link> as a user to write a review.
          </Alert>
        )}
      </Box>

      {/* Negotiation Modal (remains the same) */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Negotiate Price for {product?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {negotiationMessage && (
              <Alert status={negotiationMessage.includes('ACCEPTED') ? 'success' : 'info'} mb="4">
                <AlertIcon />
                {negotiationMessage}
              </Alert>
            )}
            {attemptsLeft !== null && attemptsLeft >= 0 && (
              <Text mb="2">Attempts left: {attemptsLeft} / {CLIENT_MAX_NEGOTIATION_ATTEMPTS}</Text>
            )}
            <FormControl id="proposed-price" isRequired>
              <FormLabel>Your Proposed Price</FormLabel>
              <Input
                type="number"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                placeholder={`Enter your price (e.g., ${product?.sellingPrice * 0.9})`}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmitNegotiation} isLoading={isSubmittingNegotiation} isDisabled={isNegotiationDisabled}>
              Submit Proposal
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default ProductDetailPage;