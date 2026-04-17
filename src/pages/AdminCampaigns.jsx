import React, { useEffect, useState } from 'react';
import {
  Box, Container, Text, SimpleGrid, Button, Badge, HStack,
  VStack, Flex, Icon, Spinner, useColorModeValue, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, FormControl, FormLabel, Input, Textarea,
  Select, Divider, Table, Thead, Tbody, Tr, Th, Td,
  Alert, AlertIcon, useToast, IconButton, Tooltip, Tab,
  Tabs, TabList, TabPanels, TabPanel,
} from '@chakra-ui/react';
import {
  FiPlus, FiUsers, FiCalendar, FiMapPin, FiTrash2,
  FiEye, FiEdit3, FiCheckCircle,
} from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const STATUS_COLORS = { upcoming:'blue', ongoing:'green', completed:'gray', cancelled:'red' };

// Map helpers
const ClickableMarker = ({ location, setLocation }) => {
  useMapEvents({ click: (e) => setLocation({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return location.lat ? (
    <Marker
      draggable position={[location.lat, location.lng]}
      eventHandlers={{ dragend: (e) => {
        const { lat, lng } = e.target.getLatLng();
        setLocation({ lat, lng });
      }}}
    />
  ) : null;
};

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => { if (lat && lng) map.setView([lat, lng], 14); }, [lat, lng, map]);
  return null;
};

// Create Campaign Modal
const CreateCampaignModal = ({ isOpen, onClose, onCreated }) => {
  const [form,     setForm]     = useState({ name: '', description: '', dateTime: '', maxParticipants: 100 });
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [address,  setAddress]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [locating, setLocating] = useState(false);
  const toast = useToast();

  const cardBg   = useColorModeValue('white',   'gray.800');
  const borderCol= useColorModeValue('gray.200','gray.600');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (!location.lat || !location.lng) return;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lng}`)
      .then(r => r.json())
      .then(d => setAddress(d.display_name || ''))
      .catch(() => {});
  }, [location]);

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => setLocating(false)
    );
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.dateTime || !location.lat) {
      toast({ title: 'Fill all required fields and select location', status: 'warning', position: 'top-right', duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/campaigns`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          latitude:  location.lat,
          longitude: location.lng,
          address,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast({
          title:       '✅ Campaign Created!',
          description: `${data.notifiedCount} nearby users will be notified.`,
          status:      'success',
          duration:    5000,
          position:    'top-right',
        });
        setForm({ name:'', description:'', dateTime:'', maxParticipants: 100 });
        setLocation({ lat: null, lng: null });
        setAddress('');
        onCreated();
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast({ title: 'Failed to create campaign', description: err.message, status: 'error', position: 'top-right' });
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)"/>
      <ModalContent bg={cardBg} borderRadius="2xl">
        <ModalHeader borderBottomWidth="1px" borderColor={borderCol}>
          Create New Campaign
        </ModalHeader>
        <ModalCloseButton/>
        <ModalBody pb={6} pt={4}>
          <VStack spacing={4} align="stretch">

            <FormControl isRequired>
              <FormLabel fontSize="sm">Campaign Name</FormLabel>
              <Input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                placeholder="City Cleanup Drive — April 2026" borderRadius="xl" size="sm"/>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Description</FormLabel>
              <Textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                placeholder="Describe the campaign goals, activities, and what to bring..."
                borderRadius="xl" size="sm" rows={3} resize="vertical"/>
            </FormControl>

            <SimpleGrid columns={2} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Date & Time</FormLabel>
                <Input type="datetime-local" value={form.dateTime}
                  onChange={e => setForm(p => ({...p, dateTime: e.target.value}))}
                  borderRadius="xl" size="sm"
                  min={new Date().toISOString().slice(0,16)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Max Participants</FormLabel>
                <Input type="number" value={form.maxParticipants} min={1}
                  onChange={e => setForm(p => ({...p, maxParticipants: parseInt(e.target.value)||100}))}
                  borderRadius="xl" size="sm"/>
              </FormControl>
            </SimpleGrid>

            <Divider/>
            <Text fontWeight="bold" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="wider">
              Campaign Location
            </Text>

            <Button size="sm" colorScheme="teal" variant="outline" borderRadius="xl"
              leftIcon={<Icon as={FiMapPin}/>} isLoading={locating} onClick={detectLocation}
              alignSelf="flex-start">
              Auto-detect Location
            </Button>

            {address && (
              <Alert status="success" borderRadius="xl" py={2}>
                <AlertIcon/>
                <Text fontSize="xs" noOfLines={2}>{address}</Text>
              </Alert>
            )}

            <Box h="250px" borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor={borderCol}>
              <MapContainer
                center={location.lat ? [location.lat, location.lng] : [22.9734, 78.6569]}
                zoom={location.lat ? 14 : 5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom
              >
                {location.lat && <RecenterMap lat={location.lat} lng={location.lng}/>}
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap'/>
                <ClickableMarker location={location} setLocation={setLocation}/>
              </MapContainer>
            </Box>
            <Text fontSize="xs" color="gray.400">
              Click on the map or drag the marker to set the campaign location. Users within 10km will be automatically notified.
            </Text>

            <Alert status="info" borderRadius="xl" fontSize="sm">
              <AlertIcon/>
              After creating, all registered users within <strong>10km</strong> will receive in-app + email notifications automatically.
            </Alert>

            <Button
              colorScheme="green" size="md" borderRadius="xl"
              bgGradient="linear(135deg, green.500, teal.400)"
              _hover={{ bgGradient: 'linear(135deg, green.600, teal.500)' }}
              isLoading={loading} loadingText="Creating…"
              onClick={handleSubmit} leftIcon={<Icon as={FiPlus}/>}
            >
              Create Campaign & Notify Users
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Participants Modal
const ParticipantsModal = ({ isOpen, onClose, campaignId, campaignName }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!isOpen || !campaignId) return;
    setLoading(true);
    fetch(`${BACKEND_URL}/api/campaigns/${campaignId}/participants`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setParticipants(d.data); })
      .finally(() => setLoading(false));
  }, [isOpen, campaignId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)"/>
      <ModalContent bg={cardBg} borderRadius="2xl">
        <ModalHeader>Participants — {campaignName}</ModalHeader>
        <ModalCloseButton/>
        <ModalBody pb={6}>
          {loading ? (
            <Flex py={8} justify="center"><Spinner color="green.500"/></Flex>
          ) : participants.length === 0 ? (
            <Text textAlign="center" color="gray.400" py={8}>No registrations yet</Text>
          ) : (
            <Box overflowX="auto">
              <Text fontSize="sm" color="gray.500" mb={3}>{participants.length} registered</Text>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    {['Name','Email','Phone','Location','Notified'].map(h => (
                      <Th key={h} fontSize="xs">{h}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {participants.map((p, i) => (
                    <Tr key={p._id || i}>
                      <Td fontSize="sm">{p.name}</Td>
                      <Td fontSize="xs" color="gray.500">{p.email}</Td>
                      <Td fontSize="sm">{p.phone}</Td>
                      <Td fontSize="xs" color="gray.500" maxW="180px">
                        <Text noOfLines={1}>{p.location?.address || `${p.location?.coordinates?.[1]?.toFixed(3)}, ${p.location?.coordinates?.[0]?.toFixed(3)}`}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={p.notified ? 'green' : 'yellow'} fontSize="10px">
                          {p.notified ? 'Yes' : 'Pending'}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Main Admin Campaigns Page
const AdminCampaigns = () => {
  const [campaigns,   setCampaigns]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);
  const [viewCampId,  setViewCampId]  = useState(null);
  const [viewCampName,setViewCampName]= useState('');
  const createDisc = useDisclosure();
  const partDisc   = useDisclosure();
  const toast = useToast();

  const bg        = useColorModeValue('gray.50', 'gray.900');
  const cardBg    = useColorModeValue('white',   'gray.800');
  const borderCol = useColorModeValue('gray.100','gray.700');
  const subtleBg  = useColorModeValue('gray.50', 'gray.700');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/campaigns?limit=100`, { credentials:'include' });
      const data = await res.json();
      if (data.status === 'success') setCampaigns(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign and all its registrations?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/campaigns/${id}`, { method:'DELETE', credentials:'include' });
      fetchCampaigns();
      toast({ title: 'Campaign deleted', status: 'success', duration: 2000, position: 'top-right' });
    } catch {
      toast({ title: 'Delete failed', status: 'error', duration: 2000, position: 'top-right' });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await fetch(`${BACKEND_URL}/api/campaigns/${id}/status`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        credentials:'include', body: JSON.stringify({ status }),
      });
      fetchCampaigns();
      toast({ title: `Status updated to ${status}`, status: 'success', duration: 2000, position: 'top-right' });
    } catch {
      toast({ title: 'Update failed', status: 'error', duration: 2000, position: 'top-right' });
    }
  };

  const viewParticipants = (id, name) => {
    setViewCampId(id);
    setViewCampName(name);
    partDisc.onOpen();
  };

  const stats = {
    total:     campaigns.length,
    upcoming:  campaigns.filter(c => c.status === 'upcoming').length,
    ongoing:   campaigns.filter(c => c.status === 'ongoing').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalParticipants: campaigns.reduce((s,c) => s + (c.participantCount||0), 0),
  };

  return (
    <Box bg={bg} minH="100vh" pb={12}>
      {/* Banner */}
      <Box bgGradient="linear(135deg, teal.600, green.500)" px={8} py={8}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Text fontSize="2xl" fontWeight="extrabold" color="white">Campaign Management</Text>
              <Text color="whiteAlpha.800" fontSize="sm">Create campaigns and auto-notify nearby users</Text>
            </Box>
            <Button
              leftIcon={<FiPlus/>} colorScheme="white" variant="solid"
              bg="white" color="green.700" size="sm"
              borderRadius="xl" fontWeight="bold"
              _hover={{ bg: 'green.50', transform: 'scale(1.02)' }}
              onClick={createDisc.onOpen}
            >
              Create Campaign
            </Button>
          </Flex>

          {/* Stats strip */}
          <HStack mt={5} spacing={4} flexWrap="wrap">
            {[
              { label:'Total',        value: stats.total },
              { label:'Upcoming',     value: stats.upcoming },
              { label:'Ongoing',      value: stats.ongoing },
              { label:'Participants', value: stats.totalParticipants },
            ].map(({label, value}) => (
              <Box key={label} bg="whiteAlpha.200" px={4} py={2} borderRadius="xl">
                <Text fontSize="xs" color="whiteAlpha.700">{label}</Text>
                <Text fontSize="xl" fontWeight="extrabold" color="white">{value}</Text>
              </Box>
            ))}
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" mt={6}>
        {loading ? (
          <Flex py={16} justify="center"><Spinner size="xl" color="green.500"/></Flex>
        ) : campaigns.length === 0 ? (
          <Flex py={16} direction="column" align="center" gap={4}>
            <Text fontSize="4xl">🌿</Text>
            <Text fontSize="xl" color="gray.500">No campaigns yet</Text>
            <Button colorScheme="green" leftIcon={<FiPlus/>} onClick={createDisc.onOpen}>
              Create First Campaign
            </Button>
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {campaigns.map((c, idx) => (
              <MotionBox key={c._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:idx*0.04}}>
                <Box
                  bg={cardBg} borderRadius="2xl" p={5}
                  boxShadow="md" borderWidth="1px" borderColor={borderCol}
                  borderLeftWidth="4px"
                  borderLeftColor={`${STATUS_COLORS[c.status] || 'gray'}.400`}
                >
                  <Flex justify="space-between" align="start" flexWrap="wrap" gap={3}>
                    <Box flex={1} minW="200px">
                      <HStack mb={2} flexWrap="wrap" gap={2}>
                        <Badge colorScheme={STATUS_COLORS[c.status]} borderRadius="full" px={2} py={0.5} fontSize="xs">
                          {c.status}
                        </Badge>
                        <HStack spacing={1} fontSize="xs" color="gray.500">
                          <Icon as={FiUsers} boxSize={3}/>
                          <Text>{c.participantCount || 0} participants</Text>
                        </HStack>
                      </HStack>

                      <Text fontWeight="bold" fontSize="md" mb={1}>{c.name}</Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={2} mb={2}>{c.description}</Text>

                      <HStack spacing={4} flexWrap="wrap">
                        <HStack fontSize="xs" color="gray.500">
                          <Icon as={FiCalendar}/>
                          <Text>{new Date(c.dateTime).toLocaleString('en-IN', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</Text>
                        </HStack>
                        {c.location?.address && (
                          <HStack fontSize="xs" color="gray.500">
                            <Icon as={FiMapPin}/>
                            <Text noOfLines={1} maxW="250px">{c.location.address}</Text>
                          </HStack>
                        )}
                      </HStack>
                    </Box>

                    <VStack spacing={2} align="end" flexShrink={0}>
                      <HStack spacing={1}>
                        <Tooltip label="View Participants">
                          <IconButton icon={<FiUsers/>} size="xs" colorScheme="blue" variant="ghost"
                            onClick={() => viewParticipants(c._id, c.name)} aria-label="Participants"/>
                        </Tooltip>
                        <Tooltip label="Delete Campaign">
                          <IconButton icon={<FiTrash2/>} size="xs" colorScheme="red" variant="ghost"
                            onClick={() => handleDelete(c._id)} aria-label="Delete"/>
                        </Tooltip>
                      </HStack>

                      <Select size="xs" value={c.status} borderRadius="lg"
                        onChange={e => handleStatusChange(c._id, e.target.value)}
                        maxW="140px">
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Select>
                    </VStack>
                  </Flex>
                </Box>
              </MotionBox>
            ))}
          </VStack>
        )}
      </Container>

      <CreateCampaignModal isOpen={createDisc.isOpen} onClose={createDisc.onClose} onCreated={fetchCampaigns}/>
      <ParticipantsModal
        isOpen={partDisc.isOpen} onClose={partDisc.onClose}
        campaignId={viewCampId} campaignName={viewCampName}
      />
    </Box>
  );
};

export default AdminCampaigns;