import React from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

// Chakra + Motion Box
const MotionBox = motion(Box);

const AboutSection = () => {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      py={{ base: 10, md: 20 }}
      px={{ base: 6, md: 24 }}
    >
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={{ base: 10, md: 16 }}
        align="center"
        justify="center"
      >
        {/* Animated Image Box */}
        <MotionBox
          flex="1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
        >
          <Image
            src="https://plus.unsplash.com/premium_photo-1661963024527-c855211ad31d?q=80&w=1170&auto=format&fit=crop"
            alt="Clean City"
            borderRadius="2xl"
            boxShadow="2xl"
            objectFit="cover"
          />
        </MotionBox>

        {/* Animated Text Content */}
        <MotionBox
          flex="1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Heading
            as="h2"
            size="2xl"
            mb={4}
            color="green.500"
            fontWeight="extrabold"
          >
            Our Mission
          </Heading>
          <Text fontSize="lg" color={useColorModeValue('gray.700', 'gray.300')} lineHeight="1.8">
            We aim to empower every citizen to take charge of their surroundings.
            Just a photo and a location can trigger a cleanup movement and notify local authorities
            before the situation worsens. Join the mission — let’s make every street shine.
          </Text>
        </MotionBox>
      </Stack>
    </Box>
  );
};

export default AboutSection;
