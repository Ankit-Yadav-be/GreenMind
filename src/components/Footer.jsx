import React from 'react';
import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  Link,
  useColorModeValue,
  VisuallyHidden,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const SocialButton = ({ children, label, href }) => (
  <chakra.button
    bg={useColorModeValue('green.100', 'green.800')}
    rounded="full"
    w={10}
    h={10}
    cursor="pointer"
    as="a"
    href={href}
    display="inline-flex"
    alignItems="center"
    justifyContent="center"
    transition="all 0.3s ease"
    _hover={{
      bg: useColorModeValue('green.200', 'green.700'),
      transform: 'scale(1.2)',
      boxShadow: 'md',
    }}
  >
    <VisuallyHidden>{label}</VisuallyHidden>
    {children}
  </chakra.button>
);

const Footer = () => {
  return (
    <Box
      bgGradient="linear(to-r, green.50, white)"
      color={useColorModeValue('gray.700', 'gray.200')}
      pt={12}
      pb={8}
      mt={10}
      shadow="inner"
    >
      <Container as={Stack} maxW={'7xl'} spacing={10}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={10}
          justify="space-between"
          align="flex-start"
        >
          {/* Logo & Description */}
          <Box>
            <Text
              fontSize="2xl"
              fontWeight="extrabold"
              color="green.600"
              as={RouterLink}
              to="/"
              transition="all 0.3s"
              _hover={{ color: 'green.700' }}
              animation="pulse 2s infinite"
            >
              CleanMyCity
            </Text>
            <Text mt={2} fontSize="sm" maxW="280px" color="gray.600">
              Let's work together to create cleaner cities by reporting waste and encouraging action.
            </Text>
          </Box>

          {/* Quick Links */}
          <Stack spacing={3}>
            <Text fontWeight="semibold" color="green.700">Quick Links</Text>
            {[
              { label: 'Home', to: '/' },
              { label: 'Report Waste', to: '/report' },
              { label: 'My Reports', to: '/myreports' },
              { label: 'Admin Dashboard', to: '/admin' },
            ].map((link) => (
              <Link
                as={RouterLink}
                to={link.to}
                key={link.label}
                fontSize="sm"
                position="relative"
                color="gray.600"
                _hover={{
                  color: 'green.600',
                  textDecoration: 'none',
                }}
                _after={{
                  content: '""',
                  display: 'block',
                  width: '0',
                  height: '2px',
                  bg: 'green.400',
                  transition: 'width 0.3s',
                  mt: 1,
                }}
                _hoverAfter={{
                  width: '100%',
                }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>

          {/* Social Icons */}
          <Box>
            <Text fontWeight="semibold" color="green.700" mb={2}>
              Connect with Us
            </Text>
            <HStack spacing={4}>
              <SocialButton label="Twitter" href="https://twitter.com/">
                <FaTwitter />
              </SocialButton>
              <SocialButton label="LinkedIn" href="https://linkedin.com/">
                <FaLinkedin />
              </SocialButton>
              <SocialButton label="GitHub" href="https://github.com/">
                <FaGithub />
              </SocialButton>
            </HStack>
          </Box>
        </Stack>
      </Container>

      {/* Bottom Copy */}
      <Text
        textAlign="center"
        mt={10}
        fontSize="sm"
        color="gray.500"
        _hover={{ color: 'green.700' }}
        transition="color 0.3s"
      >
        © {new Date().getFullYear()} <strong>CleanMyCity</strong>. All rights reserved.
      </Text>
    </Box>
  );
};

export default Footer;
