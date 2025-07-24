import React from 'react';
// CORRECTED IMPORTS FOR REACT ROUTER V5: Switch, useHistory
import { BrowserRouter as Router, Switch, Route, Link, useHistory } from 'react-router-dom';
import { Box, Flex, Text, Button, Spacer, HStack, IconButton, Icon, Avatar } from '@chakra-ui/react';
import { MdShoppingCart, MdListAlt, MdPerson } from 'react-icons/md';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

// Import all your page components
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterUserPage from './pages/Auth/RegisterUserPage';
import RegisterShopOwnerPage from './pages/Auth/RegisterShopOwnerPage';
import ShopDashboardPage from './pages/ShopOwner/ShopDashboardPage';
import AddProductPage from './pages/ShopOwner/AddProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import UserOrdersPage from './pages/UserOrdersPage';
import ShopOrdersPage from './pages/ShopOwner/ShopOrdersPage';
import UserProfilePage from './pages/UserProfilePage';

// ProtectedRoute needs to be compatible with v5
import ProtectedRoute from './components/ProtectedRoute';


const NotFoundPage = () => <div>404 Not Found</div>;

function App() {
    const history = useHistory(); // CHANGED: useNavigate to useHistory
    const { user, logout } = useAuthStore();
    const totalCartItems = useCartStore((state) => state.getTotalItems());

    const handleLogout = () => {
        logout();
        history.push('/login'); // CHANGED: navigate to history.push
    };

    return (
        <>
            <Flex as="nav" bg="gray.900" p="4" color="white" align="center">
                <Link to="/">
                    <Text fontSize="xl" fontWeight="bold" color="white">E-Commerce App</Text>
                </Link>
                <Spacer />
                <Box>
                    {user ? (
                        <HStack spacing="4">
                            <Link to="/profile">
                                <Avatar size="sm" name={user.name} src={user.profilePicture} />
                            </Link>
                            <Text as="span" color="white">Hello, {user.name} ({user.role})</Text>

                            {user.role === 'shopOwner' && (
                                <HStack spacing="4">
                                    <Link to="/shop/dashboard">
                                        <Button colorScheme="teal" variant="ghost" color="white" _hover={{ bg: 'gray.700' }}>My Shop</Button>
                                    </Link>
                                    <Link to="/shop/orders">
                                        <Button colorScheme="blue" variant="ghost" color="white" _hover={{ bg: 'gray.700' }}>Manage Orders</Button>
                                    </Link>
                                </HStack>
                            )}
                            {user.role === 'user' && (
                                <>
                                    <Link to="/cart">
                                        <IconButton
                                            aria-label="Shopping Cart"
                                            icon={<Icon as={MdShoppingCart} w={6} h={6} />}
                                            variant="ghost"
                                            color="white"
                                            _hover={{ bg: 'gray.700' }}
                                        />
                                        {totalCartItems > 0 && (
                                            <Box
                                                as="span"
                                                position="relative"
                                                top="-1.5em"
                                                right="1.5em"
                                                bg="red.500"
                                                borderRadius="full"
                                                px="0.4em"
                                                fontSize="0.7em"
                                                color="white"
                                                fontWeight="bold"
                                            >
                                                {totalCartItems}
                                            </Box>
                                        )}
                                    </Link>
                                    <Link to="/myorders">
                                        <IconButton
                                            aria-label="My Orders"
                                            icon={<Icon as={MdListAlt} w={6} h={6} />}
                                            variant="ghost"
                                            color="white"
                                            _hover={{ bg: 'gray.700' }}
                                        />
                                    </Link>
                                </>
                            )}
                            <Button colorScheme="teal" variant="ghost" color="white" onClick={handleLogout} _hover={{ bg: 'gray.700' }}>
                                Logout
                            </Button>
                        </HStack>
                    ) : (
                        <HStack spacing="4">
                            <Link to="/login">
                                <Button colorScheme="teal" variant="ghost" color="white" _hover={{ bg: 'gray.700' }}>Login</Button>
                            </Link>
                            <Link to="/register/user">
                                <Button colorScheme="teal" variant="ghost" color="white" _hover={{ bg: 'gray.700' }}>Register User</Button>
                            </Link>
                            <Link to="/register/shop-owner">
                                <Button colorScheme="teal" variant="ghost" color="white" _hover={{ bg: 'gray.700' }}>Register Shop Owner</Button>
                            </Link>
                        </HStack>
                    )}
                </Box>
            </Flex>

            <Box p="4">
                <Switch> {/* CHANGED: Routes to Switch */}
                    {/* Public Routes - use 'component' prop instead of 'element' */}
                    <Route path="/" component={HomePage} exact /> {/* 'exact' is good for '/' */}
                    <Route path="/product/:id" component={ProductDetailPage} />
                    <Route path="/login" component={LoginPage} />
                    <Route path="/register/user" component={RegisterUserPage} />
                    <Route path="/register/shop-owner" component={RegisterShopOwnerPage} />
                    {/* Protected Routes - use render prop with ProtectedRoute */}
                    {/* Note: Order matters in Switch - specific paths before general */}

                    <Route path="/profile" render={(props) => (<ProtectedRoute {...props} component={UserProfilePage} />)} />
                    <Route path="/cart" render={(props) => (<ProtectedRoute {...props} component={CartPage} />)} />
                    <Route path="/checkout" render={(props) => (<ProtectedRoute {...props} component={CheckoutPage} />)} />

                    <Route path="/myorders" render={(props) => (<ProtectedRoute {...props} role="user" component={UserOrdersPage} />)} />

                    <Route path="/shop/dashboard" render={(props) => (<ProtectedRoute {...props} role="shopOwner" component={ShopDashboardPage} />)} />
                    <Route path="/shop/add-product" render={(props) => (<ProtectedRoute {...props} role="shopOwner" component={AddProductPage} />)} />
                    <Route path="/shop/edit-product/:id" render={(props) => (<ProtectedRoute {...props} role="shopOwner" component={AddProductPage} />)} />
                    <Route path="/shop/orders" render={(props) => (<ProtectedRoute {...props} role="shopOwner" component={ShopOrdersPage} />)} />

                    {/* Fallback for unmatched routes - this must be the last Route */}
                    <Route path="*" component={NotFoundPage} />
                </Switch>
            </Box>
        </>
    );
}

export default App;