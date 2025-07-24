import React, { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Text, Button, Flex, Spinner, Alert, AlertIcon, SimpleGrid, Image, Stack, HStack } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getProductsByShop, deleteProduct } from '../../api/products'; // Import API functions

function ShopDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchShopProducts = useCallback(async () => {
    if (!user.shopId) {
        setLoading(false);
        setError("Shop ID not available for your account. Please ensure your shop is properly linked.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getProductsByShop(user.shopId);
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shop products.');
      console.error("Error fetching shop products:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'shopOwner') {
        fetchShopProducts();
    }
  }, [user, fetchShopProducts]);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setDeleteLoading(true);
      try {
        await deleteProduct(productId);
        alert('Product deleted successfully!');
        fetchShopProducts(); // Re-fetch products after deletion
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete product.');
        console.error("Error deleting product:", err);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

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
      <Flex justify="space-between" align="center" mb="6">
        <Heading as="h2" size="xl">My Shop Dashboard</Heading>
        <HStack spacing="4">
          <Link to="/shop/add-product">
            <Button colorScheme="teal" size="md">Add New Product</Button>
          </Link>
          <Link to="/shop/orders">
            <Button colorScheme="blue" size="md">Manage Orders</Button>
          </Link>
          {/* REMOVED: Link to Payout Settings */}
        </HStack>
      </Flex>

      {products.length === 0 ? (
        <Text textAlign="center" fontSize="lg" mt="10">You have no products listed yet. Click "Add New Product" to get started!</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6">
          {products.map((product) => (
            <Box key={product._id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              p="4"
            >
              <Image src={product.image} alt={product.name} objectFit="cover" height="200px" />
              <Box mt="4">
                <Stack spacing="2">
                  <Heading size="md">{product.name}</Heading>
                  <Text fontSize="sm" color="gray.500">Category: {product.category}</Text>
                  <Text color="teal.600" fontSize="xl" fontWeight="bold">
                    ${product.sellingPrice}
                  </Text>
                  <Text as="s" color="gray.500" fontSize="sm">MRP: ${product.mrp}</Text>
                  <Text fontSize="sm">In Stock: {product.countInStock}</Text>
                  <Text fontSize="sm">Min Negotiable: ${product.minNegotiablePrice}</Text>

                  <Flex justify="space-around" mt="4">
                    <Button as={Link} to={`/shop/edit-product/${product._id}`} colorScheme="blue" size="sm">
                      Edit
                    </Button>
                    <Button colorScheme="red" size="sm" onClick={() => handleDelete(product._id)} isLoading={deleteLoading}>
                      Delete
                    </Button>
                  </Flex>
                </Stack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default ShopDashboardPage;