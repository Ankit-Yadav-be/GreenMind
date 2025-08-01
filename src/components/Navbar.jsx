import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  useDisclosure,
  Stack,
  Text,
  Icon,
  Collapse,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { FaPlusCircle, FaUserShield } from 'react-icons/fa';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Links = [
  { label: 'Home', to: '/' },
  { label: 'Report Waste', to: '/report', icon: FaPlusCircle },
  { label: 'My Reports', to: '/myreports' },
  { label: 'Waste List', to: '/wastelist' },
  { label: 'Admin', to: '/admin', icon: FaUserShield },
];

const NavLink = ({ to, label, icon, isActive, onClick }) => (
  <Link
    as={RouterLink}
    to={to}
    px={4}
    py={2}
    rounded="lg"
    fontWeight="medium"
    display="flex"
    alignItems="center"
    gap={2}
    transition="all 0.3s ease"
    bg={isActive ? 'green.100' : 'transparent'}
    color={isActive ? 'green.700' : 'gray.700'}
    _hover={{
      textDecoration: 'none',
      bg: 'green.200',
      color: 'green.800',
      transform: 'scale(1.05)',
    }}
    onClick={onClick}
  >
    {icon && <Icon as={icon} boxSize={4} />} {label}
  </Link>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error("Login status check failed", error);
    }
  };

  const handleNavClick = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      setRedirectPath(path);
      onLoginOpen();
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const decoded = jwtDecode(token);
    console.log("Google User: ", decoded);

    try {
      const res = await fetch(`http://localhost:5000/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (res.ok) {
        setIsAuthenticated(true);
        onLoginClose();
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        if (redirectPath) {
          navigate(redirectPath);
        }
      }
    } catch (err) {
      console.error("Error sending token to backend", err);
      toast({
        title: "Login failed",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bgGradient="linear(to-r, white, green.50)"
      px={6}
      py={2}
      shadow="md"
      position="sticky"
      top={0}
      zIndex={20}
    >
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        {/* Logo */}
        <Text
          fontSize="2xl"
          fontWeight="extrabold"
          color="green.600"
          as={RouterLink}
          to="/"
          _hover={{ textDecoration: 'none', color: 'green.700' }}
          transition="0.3s ease"
          animation="pulse 2s infinite"
        >
          CleanMyCity
        </Text>

        {/* Desktop Nav */}
        <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
          {Links.map((link) => (
            <NavLink
              key={link.to}
              to={isAuthenticated ? link.to : '#'}
              label={link.label}
              icon={link.icon}
              isActive={location.pathname === link.to}
              onClick={() => handleNavClick(link.to)}
            />
          ))}
        </HStack>

        {/* Desktop Report Button */}
        <HStack display={{ base: 'none', md: 'flex' }}>
          <Button
            as={RouterLink}
            to={isAuthenticated ? '/report' : '#'}
            colorScheme="green"
            leftIcon={<FaPlusCircle />}
            fontWeight="bold"
            size="sm"
            _hover={{
              transform: 'scale(1.05)',
              bg: 'green.500',
              color: 'white',
            }}
            transition="all 0.3s ease"
            onClick={() => !isAuthenticated && handleNavClick('/report')}
          >
            Report Now
          </Button>
        </HStack>

        {/* Mobile Menu Toggle */}
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
          colorScheme="green"
          variant="ghost"
        />
      </Flex>

      {/* Mobile Nav */}
      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={3}>
            {Links.map((link) => (
              <NavLink
                key={link.to}
                to={isAuthenticated ? link.to : '#'}
                label={link.label}
                icon={link.icon}
                isActive={location.pathname === link.to}
                onClick={() => handleNavClick(link.to)}
              />
            ))}
            <Button
              as={RouterLink}
              to={isAuthenticated ? '/report' : '#'}
              leftIcon={<FaPlusCircle />}
              colorScheme="green"
              fontWeight="bold"
              size="sm"
              w="full"
              mt={2}
              onClick={() => !isAuthenticated && handleNavClick('/report')}
            >
              Report Now
            </Button>
          </Stack>
        </Box>
      </Collapse>

      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={onLoginClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login with Google</ModalHeader>
          <ModalCloseButton />
          <ModalBody textAlign="center" pb={6}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.log("Login Failed");
                toast({
                  title: "Login failed",
                  description: "Please try again",
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Navbar;