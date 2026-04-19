import React, { useEffect , useState} from 'react';
import {
  Box, VStack, Text, Heading, Icon, useToast,
  Select, Button, Divider,
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
  if (role === 'admin' || role === 'super_admin') navigate('/admin');
  else if (role === 'category_head' || role === 'area_head') navigate('/sub-admin');
  else if (role === 'worker') navigate('/worker-portal');
  else navigate('/');
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
  const redirectTo = sessionStorage.getItem('redirectAfterLogin');
  sessionStorage.removeItem('redirectAfterLogin');
  const role = data.user.role;
  if (role === 'admin' || role === 'super_admin') navigate('/admin');
  else if (role === 'category_head' || role === 'area_head') navigate('/sub-admin');
  else if (role === 'worker') navigate('/worker-portal');
  else navigate(redirectTo || '/');
}
    } catch (err) {
      toast({ title: 'Login failed', description: 'Please try again', status: 'error', duration: 3000 });
    }
  };

const [devEmail, setDevEmail] = useState('');

const handleDevLogin = async () => {
  if (!devEmail) return;
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: devEmail }),
    });
    const data = await res.json();
   if (res.ok) {
  setIsAuthenticated(true);
  setUserRole(data.user.role);
  toast({ title: `Logged in as ${data.user.name} (${data.user.role})`, status: 'success', duration: 2000 });
  const role = data.user.role;
  const redirectTo = sessionStorage.getItem('redirectAfterLogin');
  sessionStorage.removeItem('redirectAfterLogin');
  if (role === 'admin' || role === 'super_admin') navigate('/admin');
  else if (role === 'category_head' || role === 'area_head') navigate('/sub-admin');
  else if (role === 'worker') navigate('/worker-portal');
  else navigate(redirectTo || '/');
} else {
      toast({ title: data.message || 'Login failed', status: 'error', duration: 3000 });
    }
  } catch {
    toast({ title: 'Login failed', status: 'error', duration: 3000 });
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
            onError={() => toast({ title: 'Login failed', status: 'error', duration: 3000 })}
          />
        </Box>
        <Divider />
        <Text fontSize="sm" color="gray.500" fontWeight="bold">Dev / Test Login</Text>
     <Select placeholder="Select test account" value={devEmail} onChange={e => setDevEmail(e.target.value)} size="sm">
  <optgroup label="── Category Heads ──">
    <option value="ananya.categoryhead@zerox.com">Ananya — Category Head (Waste Collection)</option>
    <option value="rohan.recycling@zerox.com">Rohan — Category Head (Recycling)</option>
    <option value="pooja.hazardous@zerox.com">Pooja — Category Head (Hazardous)</option>
    <option value="kiran.cleanliness@zerox.com">Kiran — Category Head (Public Cleanliness)</option>
    <option value="sneha.campaigns@zerox.com">Sneha — Category Head (Campaigns)</option>
  </optgroup>
  <optgroup label="── Area Heads ──">
    <option value="vikas.civillines@zerox.com">Vikas — Area Head (Civil Lines)</option>
    <option value="preeti.georgetown@zerox.com">Preeti — Area Head (George Town)</option>
    <option value="manish.allahpur@zerox.com">Manish — Area Head (Allahpur)</option>
    <option value="sunita.naini@zerox.com">Sunita — Area Head (Naini)</option>
    <option value="rahul.phaphamau@zerox.com">Rahul — Area Head (Phaphamau)</option>
  </optgroup>
  <optgroup label="── Workers ──">
    <option value="ramesh.worker@zerox.com">Ramesh — Worker (Civil Lines)</option>
    <option value="suresh.worker@zerox.com">Suresh — Worker (George Town)</option>
    <option value="priya.worker@zerox.com">Priya — Worker (Allahpur)</option>
    <option value="meena.worker@zerox.com">Meena — Worker (Lukerganj)</option>
    <option value="vikram.worker@zerox.com">Vikram — Worker (Kareli)</option>
  </optgroup>
</Select>
        <Button colorScheme="green" size="sm" w="full" onClick={handleDevLogin} isDisabled={!devEmail}>
          Login as Selected User
        </Button>
        <Text fontSize="xs" color="gray.400">
          By signing in, you agree to our community guidelines.
        </Text>
      </VStack>
    </Box>
  </Box>
);
};

export default Login;