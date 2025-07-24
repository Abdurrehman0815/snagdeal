import React, { useState, useEffect } from 'react';
// Removed Avatar, CircularProgress components from import
import { Box, Heading, VStack, FormControl, FormLabel, Input, Button, Alert, AlertIcon, Text, Spinner, Flex, Divider, useToast } from '@chakra-ui/react';
import { useAuthStore } from '../store/authStore';
import { getProfile, updateUserProfile } from '../api/auth';
// Removed uploadFile import
import { useNavigate } from 'react-router-dom';

function UserProfilePage() {
  const { user, login: authStoreLogin } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(''); // Now stores URL string

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  // Removed imageUploadLoading state

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      setProfileError(null);
      try {
        const profileData = await getProfile();
        setName(profileData.name);
        setEmail(profileData.email);
        setProfilePicture(profileData.profilePicture || ''); // Set current profile pic URL
      } catch (err) {
        setProfileError(err.response?.data?.message || 'Failed to fetch user profile.');
        console.error("Error fetching profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  // Removed useEffect for image preview and handleFileChange

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);
    setUpdateLoading(true);

    // Directly send profilePicture URL from state
    const userDataToUpdate = {};
    if (name !== user.name) userDataToUpdate.name = name;
    if (email !== user.email) userDataToUpdate.email = email;
    if (profilePicture !== user.profilePicture) userDataToUpdate.profilePicture = profilePicture; // Send URL

    if (Object.keys(userDataToUpdate).length === 0) {
      setUpdateError('No changes detected to update profile.');
      setUpdateLoading(false);
      return;
    }

    try {
      const updatedUser = await updateUserProfile(userDataToUpdate);
      authStoreLogin(updatedUser);
      setUpdateSuccess(true);
      toast({
        title: "Profile Updated!",
        description: "Your profile details have been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update profile.');
      console.error("Profile update error:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);
    setUpdateLoading(true);

    if (!password || !confirmPassword) {
      setUpdateError('Please enter both password fields.');
      setUpdateLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setUpdateError('Passwords do not match.');
      setUpdateLoading(false);
      return;
    }

    try {
      const updatedUser = await updateUserProfile({ password });
      authStoreLogin(updatedUser);
      setPassword('');
      setConfirmPassword('');
      setUpdateSuccess(true);
      toast({
        title: "Password Updated!",
        description: "Your password has been successfully changed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update password.');
      console.error("Password update error:", err);
    } finally {
      setUpdateLoading(false);
    }
  };


  if (profileLoading) {
    return (
      <Flex justify="center" align="center" minHeight="50vh">
        <Spinner size="xl" color="teal.500" />
        <Text ml="4">Loading profile...</Text>
      </Flex>
    );
  }

  if (profileError) {
    return (
      <Alert status="error" mt="4">
        <AlertIcon />
        Error: {profileError}
      </Alert>
    );
  }
  if (!user) return null;

  return (
    <Box maxWidth="xl" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading as="h2" size="xl" textAlign="center" mb="6">My Profile</Heading>

      {/* Profile Picture Display */}
      <Flex direction="column" align="center" mb="6">
        {/* Use Image component or just a simple img tag for display */}
        <img src={profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }} />
        <Text fontSize="lg" fontWeight="bold">{user.name}</Text>
        <Text fontSize="md" color="gray.600">{user.email}</Text>
      </Flex>

      {/* Profile Update Form */}
      <Box mb="8">
        <Heading as="h3" size="md" mb="4">Update Profile Details</Heading>
        {updateError && (
          <Alert status="error" mb="4">
            <AlertIcon />
            {updateError}
          </Alert>
        )}
        {updateSuccess && (
          <Alert status="success" mb="4">
            <AlertIcon />
            Profile updated successfully!
          </Alert>
        )}
        <form onSubmit={handleProfileUpdate}>
          <VStack spacing="4">
            <FormControl id="profile-name">
              <FormLabel>Name</FormLabel>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl id="profile-email">
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            {/* Changed to a URL input */}
            <FormControl id="profile-picture-url">
              <FormLabel>Profile Picture URL</FormLabel>
              <Input type="url" value={profilePicture} onChange={(e) => setProfilePicture(e.target.value)} placeholder="e.g., https://example.com/your-pic.jpg" />
              <Text fontSize="sm" color="gray.500" mt="1">Paste a direct image URL here.</Text>
            </FormControl>
            <Button type="submit" colorScheme="teal" size="lg" width="full" isLoading={updateLoading}>
              Update Profile
            </Button>
          </VStack>
        </form>
      </Box>

      <Divider my="8" />

      {/* Password Update Form */}
      <Box>
        <Heading as="h3" size="md" mb="4">Change Password</Heading>
        <form onSubmit={handlePasswordUpdate}>
          <VStack spacing="4">
            <FormControl id="password-new">
              <FormLabel>New Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
            </FormControl>
            <FormControl id="password-confirm">
              <FormLabel>Confirm New Password</FormLabel>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
            </FormControl>
            <Button type="submit" colorScheme="orange" size="lg" width="full" isLoading={updateLoading}>
              Change Password
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}

export default UserProfilePage;