import React from 'react';
import {
  Box, Flex, HStack, Link, IconButton, Button,
  useDisclosure, Stack, Text, Icon, Collapse, useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { FaPlusCircle, FaUserShield, FaSignOutAlt, FaTrophy, FaLeaf } from 'react-icons/fa';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './shared/NotificationBell';

const userLinks = [
  { label: 'Home',         to: '/' },
  { label: 'Report Waste', to: '/report',      icon: FaPlusCircle },
  { label: 'My Reports',   to: '/myreports' },
  { label: 'Leaderboard',  to: '/leaderboard', icon: FaTrophy },
];

const adminLinks = [
  { label: 'Waste List',   to: '/wastelist' },
  { label: 'Map',          to: '/map' },
  { label: 'Admin',        to: '/admin',        icon: FaUserShield },
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const NavLink = ({ to, label, icon, isActive }) => (
  <Link
    as={RouterLink}
    to={to}
    px={5} py={2}
    rounded="full"
    fontWeight={isActive ? '700' : '500'}
    fontSize="sm"
    display="flex"
    alignItems="center"
    gap={2}
    position="relative"
    transition="all 0.25s cubic-bezier(0.4,0,0.2,1)"
    bg={isActive
      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
      : 'transparent'}
    color={isActive ? 'green.800' : 'gray.600'}
    boxShadow={isActive ? 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 8px rgba(16,185,129,0.15)' : 'none'}
    _before={isActive ? {
      content: '""',
      position: 'absolute',
      bottom: '-2px',
      left: '50%',
      transform: 'translateX(-50%)',
      w: '20px',
      h: '3px',
      borderRadius: 'full',
      bg: 'green.500',
    } : {}}
    _hover={{
      textDecoration: 'none',
      bg: isActive
        ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
        : 'rgba(16,185,129,0.08)',
      color: 'green.700',
      transform: 'translateY(-1px)',
      boxShadow: isActive
        ? 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 12px rgba(16,185,129,0.2)'
        : '0 4px 12px rgba(16,185,129,0.1)',
    }}
    _dark={{
      color: isActive ? 'green.200' : 'gray.400',
      bg: isActive ? 'rgba(16,185,129,0.15)' : 'transparent',
      boxShadow: isActive ? '0 2px 8px rgba(16,185,129,0.2)' : 'none',
      _hover: {
        bg: isActive ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.08)',
        color: 'green.300',
        transform: 'translateY(-1px)',
      },
    }}
  >
    {icon && (
      <Icon
        as={icon}
        boxSize={3.5}
        color={isActive ? 'green.600' : 'gray.400'}
        transition="color 0.2s"
        _dark={{ color: isActive ? 'green.300' : 'gray.500' }}
      />
    )}
    {label}
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

  const navBg = useColorModeValue(
    'rgba(255,255,255,0.85)',
    'rgba(17,24,39,0.85)'
  );
  const borderCol = useColorModeValue(
    'rgba(16,185,129,0.12)',
    'rgba(16,185,129,0.08)'
  );

  return (
    <Box
      bg={navBg}
      backdropFilter="blur(20px) saturate(180%)"
      WebkitBackdropFilter="blur(20px) saturate(180%)"
      borderBottom="1px solid"
      borderColor={borderCol}
      px={6}
      py={0}
      position="sticky"
      top={0}
      zIndex={20}
      boxShadow="0 1px 0 rgba(16,185,129,0.08), 0 4px 24px rgba(0,0,0,0.04)"
      _after={{
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        h: '1px',
        bgGradient: 'linear(to-r, transparent, green.300, green.400, green.300, transparent)',
        opacity: 0.6,
      }}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">

        {/* ── Logo ── */}
        <Flex
          as={RouterLink}
          to="/"
          align="center"
          gap={2.5}
          _hover={{ textDecoration: 'none' }}
          role="group"
        >
          <Box
            p={1.5}
            borderRadius="xl"
            bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            boxShadow="0 2px 8px rgba(16,185,129,0.35)"
            transition="all 0.3s cubic-bezier(0.4,0,0.2,1)"
            _groupHover={{
              boxShadow: '0 4px 16px rgba(16,185,129,0.5)',
              transform: 'rotate(-8deg) scale(1.1)',
            }}
          >
            <Icon as={FaLeaf} color="white" boxSize={4} />
          </Box>
          <Box>
            <Text
              fontSize="xl"
              fontWeight="800"
              letterSpacing="-0.5px"
              bgGradient="linear(135deg, green.600, green.400)"
              bgClip="text"
              lineHeight="1"
              transition="all 0.3s"
              _groupHover={{ bgGradient: 'linear(135deg, green.500, teal.400)' }}
              _dark={{ bgGradient: 'linear(135deg, green.300, teal.200)' }}
            >
              ZeroX
            </Text>
            <Text
              fontSize="9px"
              fontWeight="600"
              letterSpacing="2.5px"
              textTransform="uppercase"
              color="gray.400"
              lineHeight="1"
              mt={0.5}
              _dark={{ color: 'gray.500' }}
            >
              Waste · Smart
            </Text>
          </Box>
        </Flex>

        {/* ── Desktop nav links ── */}
       <HStack
          spacing={2}
          display={{ base: 'none', md: 'flex' }}
          bg={useColorModeValue('rgba(241,245,249,0.7)', 'rgba(30,41,59,0.7)')}
          px={3}
          py={2}
          borderRadius="2xl"
          border="1px solid"
          borderColor={useColorModeValue('gray.100', 'gray.700')}
        >
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

        {/* ── Desktop right side ── */}
        <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
          {isAuthenticated && (
            <Box
              bg={useColorModeValue('rgba(241,245,249,0.7)', 'rgba(30,41,59,0.7)')}
              p={1.5}
              borderRadius="xl"
              border="1px solid"
              borderColor={useColorModeValue('gray.100', 'gray.700')}
            >
              <NotificationBell />
            </Box>
          )}

          <Button
            onClick={handleLogout}
            size="sm"
            variant="ghost"
            leftIcon={<FaSignOutAlt />}
            borderRadius="full"
            fontWeight="600"
            fontSize="sm"
            color="gray.500"
            px={4}
            transition="all 0.2s"
            _hover={{
              bg: 'red.50',
              color: 'red.500',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(239,68,68,0.15)',
            }}
            _dark={{
              color: 'gray.400',
              _hover: { bg: 'rgba(239,68,68,0.1)', color: 'red.400' },
            }}
          >
            Logout
          </Button>
        </HStack>

        {/* ── Mobile right ── */}
        <HStack display={{ md: 'none' }} spacing={2}>
          {isAuthenticated && <NotificationBell />}
          <IconButton
            size="sm"
            icon={isOpen ? <CloseIcon boxSize={3} /> : <HamburgerIcon boxSize={4} />}
            aria-label="Open Menu"
            onClick={isOpen ? onClose : onOpen}
            borderRadius="xl"
            bg={useColorModeValue('green.50', 'rgba(16,185,129,0.1)')}
            color="green.600"
            border="1px solid"
            borderColor={useColorModeValue('green.100', 'rgba(16,185,129,0.2)')}
            _hover={{ bg: 'green.100', transform: 'scale(1.05)' }}
            _dark={{ color: 'green.400', _hover: { bg: 'rgba(16,185,129,0.15)' } }}
            transition="all 0.2s"
          />
        </HStack>
      </Flex>

      {/* ── Mobile menu ── */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          pb={4}
          pt={2}
          display={{ md: 'none' }}
          borderTop="1px solid"
          borderColor={useColorModeValue('gray.100', 'gray.700')}
        >
          <Stack as="nav" spacing={1}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                label={link.label}
                icon={link.icon}
                isActive={location.pathname === link.to}
              />
            ))}

            <Box pt={2} borderTop="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
              <Button
                onClick={handleLogout}
                leftIcon={<FaSignOutAlt />}
                variant="ghost"
                size="sm"
                w="full"
                borderRadius="xl"
                color="red.400"
                fontWeight="600"
                _hover={{ bg: 'red.50', color: 'red.500' }}
                _dark={{ _hover: { bg: 'rgba(239,68,68,0.1)' } }}
              >
                Logout
              </Button>
            </Box>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Navbar;