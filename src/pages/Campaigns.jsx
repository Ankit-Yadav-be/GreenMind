import React, { useEffect, useState } from 'react';
import {
  Box, Container, Text, SimpleGrid, Button, Badge, HStack,
  VStack, Flex, Icon, Spinner, useColorModeValue, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, Divider, useToast,
} from '@chakra-ui/react';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import CampaignRegistrationModal from '../components/Campaign/CampaignRegistrationModal';

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const STATUS_COLORS = {
  upcoming:  { color: 'blue',   label: 'Upcoming'  },
  ongoing:   { color: 'green',  label: 'Ongoing'   },
  completed: { color: 'gray',   label: 'Completed' },
  cancelled: { color: 'red',    label: 'Cancelled' },
};

const CampaignCard = ({ campaign, onRegister, alreadyRegistered }) => {
  const cardBg   = useColorModeValue('white', 'gray.800');
  const borderCol= useColorModeValue('gray.100', 'gray.700');
  const subtleBg = useColorModeValue('gray.50', 'gray.750');
  const status   = STATUS_COLORS[campaign.status] || STATUS_COLORS.upcoming;

  const dateStr = new Date(campaign.dateTime).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const isPast = new Date(campaign.dateTime) < new Date();

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        bg={cardBg} borderRadius="2xl" overflow="hidden"
        boxShadow="md" borderWidth="1px" borderColor={borderCol}
        borderTopWidth="3px"
        borderTopColor={`${status.color}.400`}
        _hover={{ boxShadow: 'xl' }} transition="all 0.25s"
        h="100%"
      >
        {/* Card Header */}
        <Box p={5} pb={3}>
          <Flex justify="space-between" align="start" mb={3}>
            <Badge colorScheme={status.color} borderRadius="full" px={3} py={1} fontSize="xs">
              {status.label}
            </Badge>
            <HStack spacing={1} color="gray.400" fontSize="xs">
              <Icon as={FiUsers} boxSize={3}/>
              <Text>{campaign.participantCount || 0} joined</Text>
            </HStack>
          </Flex>

          <Text fontWeight="bold" fontSize="lg" color={useColorModeValue('gray.800', 'white')} mb={2} lineHeight="1.3">
            {campaign.name}
          </Text>
          <Text fontSize="sm" color="gray.500" noOfLines={2} lineHeight="1.6">
            {campaign.description}
          </Text>
        </Box>

        <Divider />

        {/* Card Details */}
        <Box p={5} pt={3} bg={subtleBg}>
          <VStack spacing={2.5} align="stretch">
            <HStack spacing={2} fontSize="sm">
              <Icon as={FiCalendar} color="green.500" flexShrink={0}/>
              <Text color="gray.600" _dark={{ color: 'gray.300' }} noOfLines={1}>{dateStr}</Text>
            </HStack>
            {campaign.location?.address && (
              <HStack spacing={2} fontSize="sm">
                <Icon as={FiMapPin} color="blue.500" flexShrink={0}/>
                <Text color="gray.600" _dark={{ color: 'gray.300' }} noOfLines={1}>
                  {campaign.location.address}
                </Text>
              </HStack>
            )}
          </VStack>

   <Button
  mt={4} w="full" size="sm"
  colorScheme={alreadyRegistered ? 'gray' : 'green'}
  variant={alreadyRegistered ? 'solid' : campaign.status === 'upcoming' ? 'solid' : 'outline'}
  rightIcon={alreadyRegistered ? <FiCheckCircle/> : <FiArrowRight/>}
  borderRadius="xl"
  isDisabled={alreadyRegistered || campaign.status === 'completed' || campaign.status === 'cancelled' || isPast}
  onClick={() => !alreadyRegistered && onRegister(campaign)}
  bgGradient={!alreadyRegistered && campaign.status === 'upcoming' ? 'linear(135deg, green.500, teal.400)' : undefined}
>
  {alreadyRegistered ? '✅ Already Registered' :
   campaign.status === 'completed' || isPast ? 'Campaign Ended' :
   campaign.status === 'cancelled' ? 'Cancelled' : 'Register Now'}
</Button>
        </Box>
      </Box>
    </MotionBox>
  );
};

const Campaigns = () => {
  const [campaigns,    setCampaigns]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [selected,     setSelected]     = useState(null);
  const [registeredIds, setRegisteredIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('registered_campaigns') || '[]'); }
    catch { return []; }
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const pageBg   = useColorModeValue('gray.50', 'gray.900');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? `${BACKEND_URL}/api/campaigns?limit=50`
        : `${BACKEND_URL}/api/campaigns?status=${filter}&limit=50`;
      const res  = await fetch(url);
      const data = await res.json();
      if (data.status === 'success') setCampaigns(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, [filter]);

 const handleRegister = (campaign) => {
  setSelected(campaign);
  onOpen();
};

const handleRegistered = (campaignId) => {
  const updated = [...registeredIds, campaignId];
  setRegisteredIds(updated);
  localStorage.setItem('registered_campaigns', JSON.stringify(updated));
  onClose();
  fetchCampaigns();
};

  const FILTERS = ['all', 'upcoming', 'ongoing', 'completed'];

  return (
    <Box bg={pageBg} minH="100vh">
      {/* Banner */}
      <Box bgGradient="linear(135deg, green.700, teal.500)" py={14} px={6}>
        <Container maxW="container.xl">
          <VStack spacing={3} align="start">
            <Badge bg="whiteAlpha.200" color="white" px={3} py={1} borderRadius="full" fontSize="xs">
              🌿 Community Action
            </Badge>
            <Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight="extrabold" color="white" lineHeight="1.2">
              Cleanup Campaigns
            </Text>
            <Text color="whiteAlpha.800" fontSize="lg" maxW="500px">
              Join hands with your community. Register for campaigns near you and help make your city cleaner.
            </Text>

            {/* Stats strip */}
            <HStack mt={4} spacing={6} flexWrap="wrap">
              {[
                { label: 'Total',    value: campaigns.length },
                { label: 'Upcoming', value: campaigns.filter(c => c.status === 'upcoming').length },
                { label: 'Ongoing',  value: campaigns.filter(c => c.status === 'ongoing').length },
              ].map(({ label, value }) => (
                <Box key={label} bg="whiteAlpha.200" px={4} py={2} borderRadius="xl">
                  <Text fontSize="xs" color="whiteAlpha.700">{label}</Text>
                  <Text fontSize="xl" fontWeight="extrabold" color="white">{value}</Text>
                </Box>
              ))}
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        {/* Filter tabs */}
        <HStack mb={6} spacing={2} flexWrap="wrap">
          {FILTERS.map(f => (
            <Button
              key={f}
              size="sm"
              borderRadius="full"
              variant={filter === f ? 'solid' : 'outline'}
              colorScheme="green"
              textTransform="capitalize"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Campaigns' : f}
            </Button>
          ))}
        </HStack>

        {loading ? (
          <Flex py={20} justify="center" direction="column" align="center" gap={3}>
            <Spinner size="xl" color="green.500" thickness="4px"/>
            <Text color="gray.400">Loading campaigns…</Text>
          </Flex>
        ) : campaigns.length === 0 ? (
          <Flex py={20} direction="column" align="center" gap={3}>
            <Text fontSize="4xl">🌿</Text>
            <Text fontSize="xl" fontWeight="bold" color="gray.500">No campaigns found</Text>
            <Text color="gray.400" textAlign="center">
              Check back soon or register your interest to get notified!
            </Text>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {campaigns.map(c => (
              <CampaignCard
  key={c._id}
  campaign={c}
  onRegister={handleRegister}
  alreadyRegistered={registeredIds.includes(c._id)}
/>
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* Registration Modal */}
{selected && (
  <CampaignRegistrationModal
    isOpen={isOpen}
    onClose={onClose}
    campaign={selected}
    onSuccess={() => handleRegistered(selected._id)}
  />
)}
    </Box>
  );
};

export default Campaigns;