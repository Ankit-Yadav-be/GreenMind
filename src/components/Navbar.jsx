import React from 'react';
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
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { FaPlusCircle, FaUserShield } from 'react-icons/fa';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Links = [
  { label: 'Home', to: '/' },
  { label: 'Report Waste', to: '/report', icon: FaPlusCircle },
  { label: 'My Reports', to: '/myreports' },
  { label: 'Waste List', to: '/wastelist' },
  { label: 'Admin', to: '/admin', icon: FaUserShield },
];

const NavLink = ({ to, label, icon, isActive }) => (
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
  >
    {icon && <Icon as={icon} boxSize={4} />} {label}
  </Link>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

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
              to={link.to}
              label={link.label}
              icon={link.icon}
              isActive={location.pathname === link.to}
            />
          ))}
        </HStack>

        {/* Desktop Report Button */}
        <HStack display={{ base: 'none', md: 'flex' }}>
          <Button
            as={RouterLink}
            to="/report"
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
                to={link.to}
                label={link.label}
                icon={link.icon}
                isActive={location.pathname === link.to}
              />
            ))}
            <Button
              as={RouterLink}
              to="/report"
              leftIcon={<FaPlusCircle />}
              colorScheme="green"
              fontWeight="bold"
              size="sm"
              w="full"
              mt={2}
            >
              Report Now
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Navbar;
