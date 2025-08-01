import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Heading, Text, Stack, Button,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const HeroSection = () => {
  const [redirectPath, setRedirectPath] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();


  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const checkLoginStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.isAuthenticated) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Login status check failed", error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const openLogin = (path) => {
    setRedirectPath(path);
    if (isAuthenticated) {
      navigate(path);
    } else {
      onOpen();
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const decoded = jwtDecode(token);
    console.log("Google User: ", decoded);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (redirectPath) {
        navigate(redirectPath);
        onClose();
      }
    } catch (err) {
      console.error("Error sending token to backend", err);
    }
  };
  return (
    <Box
      w="100%"
      h={{ base: '80vh', md: '100vh' }}
      bgImage="linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://media.istockphoto.com/id/2156608209/photo/garden-rubbish.jpg?s=1024x1024&w=is&k=20&c=48ZC-YHOH_z1R8NFGVKg3ZvVj5kEqLKBaZiEOGWB2Q4=')"
      bgSize="cover"
      bgPosition="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box
        textAlign="center"
        bg="rgba(255, 255, 255, 0.05)"
        border="1px solid rgba(255,255,255,0.2)"
        backdropFilter="blur(10px)"
        borderRadius="2xl"
        px={8}
        py={10}
        color="white"
        maxW="3xl"
        boxShadow="lg"
        transition="all 0.3s ease"
      >
        <Heading
          fontSize={useBreakpointValue({ base: '3xl', md: '5xl' })}
          fontWeight="extrabold"
          lineHeight="1.2"
          mb={4}
        >
          Clean Your City, One Click at a Time
        </Heading>

        <Text fontSize={{ base: 'md', md: 'xl' }} color="gray.200" maxW="2xl" mx="auto">
          Be the change you want to see. Spot garbage? Report it in seconds.
        </Text>

        <Stack mt={8} direction={{ base: 'column', sm: 'row' }} spacing={4} justify="center">
          <Button
            colorScheme="green"
            size="lg"
            fontWeight="bold"
            px={8}
            onClick={() => openLogin('/report')}
          >
            Report Now
          </Button>
          <Button
            variant="outline"
            color="white"
            borderColor="green.400"
            size="lg"
            fontWeight="medium"
            px={8}
            onClick={() => openLogin('/wastelist')}
          >
            View Reports
          </Button>
        </Stack>

        {/* Login Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Login with Google</ModalHeader>
            <ModalCloseButton />
            <ModalBody textAlign="center" pb={6}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log("Login Failed")}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default HeroSection;
