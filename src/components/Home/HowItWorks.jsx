import React from 'react';
import { Box, Heading, SimpleGrid, VStack, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { FaCamera, FaMapMarkerAlt, FaPaperPlane, FaBroom } from 'react-icons/fa';

const steps = [
  {
    icon: FaCamera,
    title: 'Capture Waste',
    description: 'Click a photo of any waste or garbage in your area.',
  },
  {
    icon: FaMapMarkerAlt,
    title: 'Pin Location',
    description: 'Allow location access or manually select the location.',
  },
  {
    icon: FaPaperPlane,
    title: 'Submit Report',
    description: 'Send your report with a single click. It goes to the concerned authorities.',
  },
  {
    icon: FaBroom,
    title: 'Clean-Up Action',
    description: 'Your report helps initiate faster cleaning actions by officials.',
  },
];

const HowItWorks = () => {
  return (
    <Box py={16} px={{ base: 6, md: 20 }} bg={useColorModeValue('white', 'gray.800')}>
      <Heading textAlign="center" mb={10} color="green.600">
        How It Works
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
        {steps.map((step, index) => (
          <VStack
            key={index}
            bg={useColorModeValue('gray.100', 'gray.700')}
            p={6}
            borderRadius="xl"
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }}
          >
            <Icon as={step.icon} w={10} h={10} color="green.500" />
            <Text fontWeight="bold" fontSize="lg" color="green.700">
              {step.title}
            </Text>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              {step.description}
            </Text>
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default HowItWorks;
