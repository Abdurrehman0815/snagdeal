import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Text, Image, Stack, Button, Flex, Spinner, Alert, AlertIcon, Input, Select, FormControl, FormLabel, ButtonGroup, IconButton } from '@chakra-ui/react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { getProducts } from '../api/products';
import { Link } from 'react-router-dom';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters, search, and pagination
  const [keyword, setKeyword] = useState(''); // This triggers the API call
  const [searchInputText, setSearchInputText] = useState(''); // NEW: Holds the value of the input field
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [pageNumber, setPageNumber] = useState(1);
  const [pages, setPages] = useState(1);

  // Product categories
  const productCategories = ['All', 'Electronics', 'Home & Kitchen', 'Dresses', 'Books', 'Other'];

  // Options for sorting
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A-Z' },
    { value: 'name_desc', label: 'Name: Z-A' },
  ];

  // Effect to fetch products whenever filters or pagination change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({ keyword, category, sortBy, pageNumber });
        setProducts(data.products);
        setPages(data.pages);
      } catch (err) {
        setError(err.message || 'Failed to fetch products.');
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, category, sortBy, pageNumber]); // Dependencies

  // Handler for pagination buttons
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setPageNumber(newPage);
    }
  };

  // NEW: Handler for keyword search on Enter key press or blur
  const handleSearch = () => {
    setKeyword(searchInputText); // Update the actual keyword state
    setPageNumber(1); // Reset page on new search
  };

  // NEW: Key press handler for the input field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
      <Heading as="h2" size="xl" mb="6" textAlign="center">Browse Products</Heading>

      {/* Search, Filter, Sort Controls */}
      <Flex direction={{ base: "column", md: "row" }} gap="4" mb="8" wrap="wrap" justify="center">
        <FormControl flex="1" minWidth="200px">
          <FormLabel htmlFor="search-keyword">Search by Keyword</FormLabel>
          <Input
            id="search-keyword"
            placeholder="Search products..."
            value={searchInputText} // Bind to searchInputText
            onChange={(e) => setSearchInputText(e.target.value)} // Update searchInputText on change
            onKeyPress={handleKeyPress} // NEW: Trigger search on Enter
            onBlur={handleSearch} // NEW: Trigger search on blur (clicking outside input)
          />
        </FormControl>

        <FormControl flex="1" minWidth="150px" maxWidth="250px">
          <FormLabel htmlFor="filter-category">Category</FormLabel>
          <Select
            id="filter-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPageNumber(1);
            }}
          >
            {productCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl flex="1" minWidth="150px" maxWidth="250px">
          <FormLabel htmlFor="sort-by">Sort By</FormLabel>
          <Select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </FormControl>
      </Flex>

      {products.length === 0 ? (
        <Text textAlign="center" fontSize="lg" mt="10">No products found matching your criteria.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6">
          {products.map((product) => (
            <Box key={product._id} boxShadow="md" borderRadius="lg" overflow="hidden" borderWidth="1px" p="4">
              <Image src={product.image} alt={product.name} objectFit="cover" height="200px" />
              <Box mt="4">
                <Stack spacing="3">
                  <Heading size="md">{product.name}</Heading>
                  <Text fontSize="sm" color="gray.500">{product.category}</Text>
                  <Text>{product.description.substring(0, 100)}...</Text>
                  <Text color="teal.600" fontSize="2xl" fontWeight="bold">
                    ${product.sellingPrice}
                  </Text>
                  <Text as="s" color="gray.500" fontSize="sm">MRP: ${product.mrp}</Text>
                  <Button as={Link} to={`/product/${product._id}`} colorScheme="teal" mt="4">
                    View Details
                  </Button>
                </Stack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <Flex justify="center" mt="8">
          <ButtonGroup isAttached variant="outline">
            <IconButton
              aria-label="Previous page"
              icon={<MdChevronLeft />}
              onClick={() => handlePageChange(pageNumber - 1)}
              isDisabled={pageNumber === 1}
            />
            {[...Array(pages).keys()].map((x) => (
              <Button
                key={x + 1}
                onClick={() => handlePageChange(x + 1)}
                isActive={x + 1 === pageNumber}
                colorScheme={x + 1 === pageNumber ? 'teal' : 'gray'}
              >
                {x + 1}
              </Button>
            ))}
            <IconButton
              aria-label="Next page"
              icon={<MdChevronRight />}
              onClick={() => handlePageChange(pageNumber + 1)}
              isDisabled={pageNumber === pages}
            />
          </ButtonGroup>
        </Flex>
      )}
    </Box>
  );
}

export default HomePage;