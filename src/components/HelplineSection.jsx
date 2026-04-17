import React, { useState } from 'react';
import {
  Box, Container, Text, SimpleGrid, HStack, VStack,
  Badge, Icon, useColorModeValue, Collapse, Button,
  Divider,
} from '@chakra-ui/react';
import { FiPhone, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { MdLocalHospital, MdRecycling, MdOutlineCleaningServices } from 'react-icons/md';
import { GiFactory } from 'react-icons/gi';

const HELPLINES = [
  {
    category: 'National',
    color: 'green',
    icon: MdOutlineCleaningServices,
    numbers: [
      { name: 'Swachh Bharat Helpline',         number: '1969',  desc: '24×7 national cleanliness helpline' },
      { name: 'National Disaster Response',      number: '1078',  desc: 'Emergency disaster & waste incidents' },
      { name: 'Central Pollution Control Board', number: '1800-11-4000', desc: 'Pollution & hazardous waste complaints' },
    ],
  },
  {
    category: 'Municipal',
    color: 'blue',
    icon: MdRecycling,
    numbers: [
      { name: 'Municipal Solid Waste Helpline',  number: '1533',  desc: 'Solid waste collection complaints' },
      { name: 'Urban Local Bodies',              number: '155304', desc: 'Municipal services & garbage pickup' },
      { name: 'Smart City Mission Helpline',     number: '1800-11-3090', desc: 'Smart city civic grievances' },
    ],
  },
  {
    category: 'Health & Safety',
    color: 'red',
    icon: MdLocalHospital,
    numbers: [
      { name: 'Ambulance',                       number: '108',   desc: 'Medical emergency' },
      { name: 'Fire Brigade',                    number: '101',   desc: 'Fire & hazardous material emergency' },
      { name: 'Biomedical Waste Helpline',       number: '1800-180-5432', desc: 'Medical/bio waste disposal' },
    ],
  },
  {
    category: 'Environment',
    color: 'teal',
    icon: GiFactory,
    numbers: [
      { name: 'Pollution Control Grievance',     number: '1800-200-7923', desc: 'Environmental pollution complaints' },
      { name: 'Forest & Wildlife Helpline',      number: '1926',  desc: 'Illegal dumping near forests' },
      { name: 'NGT Helpline',                    number: '1800-11-0038', desc: 'National Green Tribunal support' },
    ],
  },
];

const HelplineCard = ({ item }) => {
  const cardBg   = useColorModeValue('white',    'gray.800');
  const borderCol= useColorModeValue('gray.100', 'gray.700');
  const subtleBg = useColorModeValue('gray.50',  'gray.750');

  return (
    <Box bg={cardBg} borderRadius="2xl" overflow="hidden" boxShadow="sm"
      borderWidth="1px" borderColor={borderCol}
      borderTopWidth="3px" borderTopColor={`${item.color}.400`}
    >
      <Box p={4} pb={2}>
        <HStack mb={3}>
          <Box bg={`${item.color}.50`} p={2} borderRadius="lg" _dark={{ bg:`${item.color}.900` }}>
            <Icon as={item.icon} boxSize={5} color={`${item.color}.500`}/>
          </Box>
          <Text fontWeight="bold" fontSize="sm" color={`${item.color}.600`} _dark={{ color:`${item.color}.300` }}>
            {item.category}
          </Text>
        </HStack>
      </Box>
      <VStack spacing={0} align="stretch">
        {item.numbers.map((n, i) => (
          <Box key={i}>
            {i > 0 && <Divider/>}
            <HStack p={3} bg={i % 2 === 0 ? 'transparent' : subtleBg} justify="space-between">
              <Box flex={1} minW={0}>
                <Text fontSize="xs" fontWeight="bold" noOfLines={1}>{n.name}</Text>
                <Text fontSize="10px" color="gray.400" noOfLines={1}>{n.desc}</Text>
              </Box>
              <HStack
                as="a" href={`tel:${n.number.replace(/-/g,'')}`}
                bg={`${item.color}.500`} color="white"
                px={3} py={1.5} borderRadius="xl" spacing={1}
                _hover={{ bg:`${item.color}.600`, transform:'scale(1.03)' }}
                transition="all 0.15s" flexShrink={0} cursor="pointer"
                textDecoration="none"
              >
                <Icon as={FiPhone} boxSize={3}/>
                <Text fontSize="xs" fontWeight="bold">{n.number}</Text>
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

const HelplineSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sectionBg = useColorModeValue('green.50', 'gray.850');
  const borderCol = useColorModeValue('green.100','gray.700');

  return (
    <Box bg={sectionBg} borderTopWidth="1px" borderColor={borderCol} py={6}>
      <Container maxW="container.xl">
        <Button
          variant="ghost" w="full" onClick={() => setIsOpen(o => !o)}
          rightIcon={isOpen ? <FiChevronUp/> : <FiChevronDown/>}
          justifyContent="space-between"
          _hover={{ bg: useColorModeValue('green.100','gray.700') }}
          borderRadius="xl" py={3}
        >
          <HStack>
            <Icon as={FiPhone} color="green.500"/>
            <Text fontWeight="bold" fontSize="sm" color="green.700" _dark={{ color:'green.300' }}>
              🇮🇳 Government Cleanliness & Sanitation Helplines
            </Text>
            <Badge colorScheme="green" fontSize="10px">Free · 24×7</Badge>
          </HStack>
        </Button>

        <Collapse in={isOpen} animateOpacity>
          <Box pt={4}>
            <Text fontSize="xs" color="gray.500" mb={4} textAlign="center">
              Tap any number to call directly from your device
            </Text>
            <SimpleGrid columns={{ base:1, sm:2, lg:4 }} spacing={4}>
              {HELPLINES.map((item, i) => <HelplineCard key={i} item={item}/>)}
            </SimpleGrid>
            <Text fontSize="10px" color="gray.400" textAlign="center" mt={4}>
              Numbers sourced from Government of India public directories. Always verify with your local municipal authority.
            </Text>
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
};

export default HelplineSection;