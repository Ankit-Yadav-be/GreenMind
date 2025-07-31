import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FaBroom, FaCamera, FaUsers, FaCity } from 'react-icons/fa';

const stats = [
  { icon: FaBroom, label: 'Cleanups Done', value: '12,340' },
  { icon: FaCamera, label: 'Reports Submitted', value: '8,652' },
  { icon: FaUsers, label: 'Active Users', value: '4,212' },
  { icon: FaCity, label: 'Cities Covered', value: '38+' },
];

const StatsSection = () => {
  return (
    <Box
      py={16}
      px={{ base: 6, md: 20 }}
      bgGradient="linear(to-br, gray.50, green.50)"
      _dark={{ bgGradient: 'linear(to-br, gray.800, gray.700)' }}
    >
      <Text
        fontSize={{ base: '2xl', md: '4xl' }}
        fontWeight="bold"
        textAlign="center"
        mb={12}
        color={useColorModeValue('green.600', 'green.300')}
      >
        Impact Overview
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
        {stats.map((stat, index) => (
          <Stat
            key={index}
            p={6}
            borderRadius="2xl"
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow="lg"
            textAlign="center"
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-6px) scale(1.03)',
              boxShadow: '2xl',
            }}
          >
            <VStack spacing={4}>
              <Box
                p={4}
                bg={useColorModeValue('green.100', 'green.700')}
                borderRadius="full"
                boxShadow="md"
              >
                <Icon as={stat.icon} w={8} h={8} color="green.600" />
              </Box>

              <StatLabel fontWeight="semibold" fontSize="lg" color="gray.600" _dark={{ color: 'gray.300' }}>
                {stat.label}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="extrabold" color="green.700" _dark={{ color: 'green.300' }}>
                {stat.value}
              </StatNumber>
            </VStack>
          </Stat>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default StatsSection;
