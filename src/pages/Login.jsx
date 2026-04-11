import React, { useEffect } from 'react';
import {
  Box, VStack, Text, Heading, Icon, useToast,
} from '@chakra-ui/react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const navigate = useNavigate();
  const toast = useToast();

  // If already logged in, redirect away from login page
  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.isAuthenticated) {
          const role = data.user?.role;
          navigate(role === 'admin' ? '/admin' : '/');
        }
      } catch (_) {}
    };
    checkAndRedirect();
  }, []);

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;
    jwtDecode(token); // decode just to verify shape

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        setUserRole(data.user.role);
        toast({ title: 'Login successful', status: 'success', duration: 2000, isClosable: true });
        navigate(data.user.role === 'admin' ? '/admin' : '/');
      }
    } catch (err) {
      toast({ title: 'Login failed', description: 'Please try again', status: 'error', duration: 3000 });
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, green.50, white)" display="flex" alignItems="center" justifyContent="center">
      <Box bg="white" p={10} rounded="2xl" shadow="xl" maxW="400px" w="full" textAlign="center">
        <VStack spacing={6}>
          <Icon as={FaLeaf} boxSize={12} color="green.500" />
          <Heading size="xl" color="green.600">ZeroX Waste</Heading>
          <Text color="gray.500" fontSize="md">
            Sign in to report waste, track issues, and help build a cleaner city.
          </Text>
          <Box pt={2}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() =>
                toast({ title: 'Login failed', status: 'error', duration: 3000 })
              }
            />
          </Box>
          <Text fontSize="xs" color="gray.400">
            By signing in, you agree to our community guidelines.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;