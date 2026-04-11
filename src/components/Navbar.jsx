import React from 'react';
import {
  Box, Flex, HStack, Link, IconButton, Button,
  useDisclosure, Stack, Text, Icon, Collapse, useToast,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { FaPlusCircle, FaUserShield, FaSignOutAlt, FaTrophy } from 'react-icons/fa';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './shared/NotificationBell';

const userLinks = [
  { label: 'Home',        to: '/' },
  { label: 'Report Waste',to: '/report',      icon: FaPlusCircle },
  { label: 'My Reports',  to: '/myreports' },
  { label: 'Leaderboard', to: '/leaderboard', icon: FaTrophy },
];

const adminLinks = [
  { label: 'Waste List',  to: '/wastelist' },
  { label: 'Map',         to: '/map' },
  { label: 'Admin',       to: '/admin',       icon: FaUserShield },
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const NavLink = ({ to, label, icon, isActive }) => (
  <Link
    as={RouterLink}
    to={to}
    px={4} py={2}
    rounded="lg"
    fontWeight="medium"
    display="flex"
    alignItems="center"
    gap={2}
    transition="all 0.3s ease"
    bg={isActive ? 'green.100' : 'transparent'}
    color={isActive ? 'green.700' : 'gray.700'}
    _hover={{ textDecoration: 'none', bg: 'green.200', color: 'green.800', transform: 'scale(1.05)' }}
    _dark={{
      color: isActive ? 'green.300' : 'gray.200',
      bg: isActive ? 'green.900' : 'transparent',
      _hover: { bg: 'green.800', color: 'green.200' },
    }}
  >
    {icon && <Icon as={icon} boxSize={4} />} {label}
  </Link>
);

const Navbar = ({ isAuthenticated, setIsAuthenticated, userRole, setUserRole }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const navLinks = userRole === 'admin'
    ? [...userLinks, ...adminLinks]
    : userLinks;

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_) {}
    setIsAuthenticated(false);
    setUserRole(null);
    toast({ title: 'Logged out', status: 'info', duration: 2000 });
    navigate('/login');
  };

  return (
    <Box
      bgGradient="linear(to-r, white, green.50)"
      _dark={{ bgGradient: 'linear(to-r, gray.900, gray.800)' }}
      px={6} py={2}
      shadow="md"
      position="sticky"
      top={0}
      zIndex={20}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        {/* Logo */}
        <Text
          fontSize="2xl" fontWeight="extrabold" color="green.600"
          as={RouterLink} to="/"
          _hover={{ textDecoration: 'none', color: 'green.700' }}
          transition="0.3s ease"
        >
          ZeroX Waste
        </Text>

        {/* Desktop nav links */}
        <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              label={link.label}
              icon={link.icon}
              isActive={location.pathname === link.to}
            />
          ))}
        </HStack>

        {/* Desktop right side */}
        <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
          {/* Notification bell — only for authenticated users */}
          {isAuthenticated && <NotificationBell />}

          <Button
            as={RouterLink} to="/report"
            colorScheme="green"
            leftIcon={<FaPlusCircle />}
            fontWeight="bold"
            size="sm"
            _hover={{ transform: 'scale(1.05)' }}
            transition="all 0.3s ease"
          >
            Report Now
          </Button>
          <Button
            onClick={handleLogout}
            colorScheme="red"
            variant="ghost"
            leftIcon={<FaSignOutAlt />}
            size="sm"
          >
            Logout
          </Button>
        </HStack>

        {/* Mobile hamburger */}
        <HStack display={{ md: 'none' }} spacing={2}>
          {isAuthenticated && <NotificationBell />}
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            onClick={isOpen ? onClose : onOpen}
            colorScheme="green"
            variant="ghost"
          />
        </HStack>
      </Flex>

      {/* Mobile menu */}
      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={3}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                label={link.label}
                icon={link.icon}
                isActive={location.pathname === link.to}
              />
            ))}
            <Button
              as={RouterLink} to="/report"
              leftIcon={<FaPlusCircle />}
              colorScheme="green"
              size="sm"
              w="full"
              mt={2}
              onClick={onClose}
            >
              Report Now
            </Button>
            <Button
              onClick={handleLogout}
              leftIcon={<FaSignOutAlt />}
              colorScheme="red"
              variant="ghost"
              size="sm"
              w="full"
            >
              Logout
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Navbar;