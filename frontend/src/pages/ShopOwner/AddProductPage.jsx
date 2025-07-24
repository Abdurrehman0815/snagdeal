import React, { useState, useEffect } from 'react';
import { Box, Heading, VStack, FormControl, FormLabel, Input, Button, Textarea, Select, Alert, AlertIcon, Spinner, Flex, Text } from '@chakra-ui/react';
import { createProduct, getProductById, updateProduct } from '../../api/products';
import { useHistory, useParams } from 'react-router-dom'; // CHANGED: useNavigate to useHistory
import { useAuthStore } from '../../store/authStore';

function AddProductPage() {
  const { user } = useAuthStore();
  const history = useHistory(); // CHANGED: useNavigate to useHistory
  const { id: productId } = useParams();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [minNegotiablePrice, setMinNegotiablePrice] = useState('');
  const [countInStock, setCountInStock] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (user && user.role === 'shopOwner') {
        if (productId) {
            setIsEditMode(true);
            const fetchProduct = async () => {
              try {
                const data = await getProductById(productId);
                setName(data.name);
                setDescription(data.description);
                setImage(data.image);
                setCategory(data.category);
                setMrp(data.mrp.toString());
                setSellingPrice(data.sellingPrice.toString());
                setMinNegotiablePrice(data.minNegotiablePrice.toString());
                setCountInStock(data.countInStock.toString());
              } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch product for editing.');
                console.error("Error fetching product for edit:", err);
              } finally {
                setPageLoading(false);
              }
            };
            fetchProduct();
          } else {
            setIsEditMode(false);
            setPageLoading(false);
          }
    } else {
        history.push('/login'); // CHANGED: navigate to history.push
    }
  }, [user, history, productId]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (parseFloat(sellingPrice) > parseFloat(mrp)) {
        setError("Selling Price cannot be greater than MRP.");
        setLoading(false);
        return;
    }
    if (parseFloat(minNegotiablePrice) > parseFloat(sellingPrice)) {
        setError("Min Negotiable Price cannot be greater than Selling Price.");
        setLoading(false);
        return;
    }
    if (parseFloat(minNegotiablePrice) < 0 || parseFloat(sellingPrice) < 0 || parseFloat(mrp) < 0 || parseInt(countInStock) < 0) {
        setError("Prices and stock count cannot be negative.");
        setLoading(false);
        return;
    }

    try {
      const productData = {
        name,
        description,
        image,
        category,
        mrp: parseFloat(mrp),
        sellingPrice: parseFloat(sellingPrice),
        minNegotiablePrice: parseFloat(minNegotiablePrice),
        countInStock: parseInt(countInStock, 10),
      };

      if (isEditMode) {
        await updateProduct(productId, productData);
        alert('Product updated successfully!');
      } else {
        await createProduct(productData);
        alert('Product added successfully!');
      }
      history.push('/shop/dashboard'); // CHANGED: navigate to history.push
    } catch (err) {
      setError(err.response?.data?.message || (isEditMode ? 'Failed to update product.' : 'Failed to add product.') + ' Please try again.');
      console.error(isEditMode ? "Update product error:" : "Add product error:", err);
    } finally {
      setLoading(false);
    }
  };

  const productCategories = ['Electronics', 'Home & Kitchen', 'Dresses', 'Books', 'Other'];

  if (pageLoading) {
    return (
      <Flex justify="center" align="center" minHeight="50vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box maxWidth="xl" mx="auto" mt="8" p="6" variant="panel"> {/* Using variant="panel" */}
      <Heading as="h2" size="xl" textAlign="center" mb="6">{isEditMode ? 'Edit Product' : 'Add New Product'}</Heading>
      {error && (
        <Alert status="error" mb="4">
          <AlertIcon />
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <VStack spacing="4">
          <FormControl id="name" isRequired>
            <FormLabel>Product Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Ultra HD Smart TV" />
          </FormControl>
          <FormControl id="description" isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed product description..." />
          </FormControl>
          <FormControl id="image" isRequired>
            <FormLabel>Image URL</FormLabel>
            <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="e.g., https://example.com/product.jpg" />
            <Text fontSize="sm" color="gray.500">For now, just paste a public image URL (e.g., from Unsplash or a placeholder service).</Text>
          </FormControl>
          <FormControl id="category" isRequired>
            <FormLabel>Category</FormLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Select category">
              {productCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl id="mrp" isRequired>
            <FormLabel>MRP (Max Retail Price)</FormLabel>
            <Input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="e.g., 1200.00" />
          </FormControl>
          <FormControl id="sellingPrice" isRequired>
            <FormLabel>Selling Price</FormLabel>
            <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="e.g., 999.99" />
          </FormControl>
          <FormControl id="minNegotiablePrice" isRequired>
            <FormLabel>Minimum Negotiable Price</FormLabel>
            <Input type="number" value={minNegotiablePrice} onChange={(e) => setMinNegotiablePrice(e.target.value)} placeholder="e.g., 850.00" />
            <Text fontSize="sm" color="gray.500">Lowest price you're willing to accept in negotiation.</Text>
          </FormControl>
          <FormControl id="countInStock" isRequired>
            <FormLabel>Count In Stock</FormLabel>
            <Input type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} placeholder="e.g., 50" />
          </FormControl>
          <Button type="submit" colorScheme="teal" size="lg" width="full" isLoading={loading}>
            {isEditMode ? 'Update Product' : 'Add Product'}
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default AddProductPage;