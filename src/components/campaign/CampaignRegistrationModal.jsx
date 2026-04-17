import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, VStack, FormControl,
  FormLabel, Input, Textarea, Button, Text, HStack,
  Badge, Divider, useColorModeValue, Box, Icon,
  Alert, AlertIcon, useToast,
} from '@chakra-ui/react';
import { FiCalendar, FiMapPin, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Reuse LocationPicker map logic from ReportWaste
const DraggableMarker = ({ location, setLocation }) => {
  useMapEvents({
    click: (e) => setLocation({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return location.lat ? (
    <Marker
      draggable
      position={[location.lat, location.lng]}
      eventHandlers={{ dragend: (e) => {
        const { lat, lng } = e.target.getLatLng();
        setLocation({ lat, lng });
      }}}
    />
  ) : null;
};

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
};

const CampaignRegistrationModal = ({ isOpen, onClose, campaign, onSuccess }) => {
  const [form,      setForm]      = useState({ name: '', email: '', phone: '' });
  const [location,  setLocation]  = useState({ lat: null, lng: null });
  const [address,   setAddress]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [locating,  setLocating]  = useState(false);
  const [mapReady,  setMapReady]  = useState(false);
  const toast = useToast();

  const cardBg  = useColorModeValue('white',    'gray.800');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const borderCol= useColorModeValue('gray.200','gray.600');

  // Auto-detect location on modal open
  useEffect(() => {
    if (isOpen && !location.lat) {
      detectLocation();
    }
    if (isOpen) setTimeout(() => setMapReady(true), 200);
  }, [isOpen]);

  // Reverse geocode whenever location changes
  useEffect(() => {
    if (!location.lat || !location.lng) return;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lng}`)
      .then(r => r.json())
      .then(d => setAddress(d.display_name || ''))
      .catch(() => setAddress(''));
  }, [location]);

  const detectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) {
      toast({ title: 'Fill all required fields', status: 'warning', position: 'top-right', duration: 3000 });
      return;
    }
    if (!location.lat || !location.lng) {
      toast({ title: 'Please select your location on the map', status: 'warning', position: 'top-right', duration: 3000 });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/campaigns/register`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          campaignId: campaign._id,
          name:       form.name,
          email:      form.email,
          phone:      form.phone,
          latitude:   location.lat,
          longitude:  location.lng,
          address,
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        toast({
          title:       '🎉 Registered Successfully!',
          description: 'You have joined this campaign. Check your email for confirmation.',
          status:      'success',
          duration:    5000,
          position:    'top-right',
          isClosable:  true,
        });
        onSuccess();
      } else if (res.status === 409) {
        toast({ title: 'Already registered', description: data.message, status: 'info', duration: 4000, position: 'top-right' });
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast({ title: 'Registration failed', description: err.message, status: 'error', duration: 4000, position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const dateStr = new Date(campaign.dateTime).toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)"/>
      <ModalContent bg={cardBg} borderRadius="2xl">
        <ModalHeader borderBottomWidth="1px" borderColor={borderCol}>
          <Text fontSize="lg" fontWeight="bold">Register for Campaign</Text>
          <Text fontSize="sm" color="gray.500" fontWeight="normal" mt={0.5}>{campaign.name}</Text>
        </ModalHeader>
        <ModalCloseButton/>
        <ModalBody pb={6} pt={4}>
          <VStack spacing={5} align="stretch">

            {/* Campaign Info */}
            <Box p={4} bg={subtleBg} borderRadius="xl" borderLeftWidth="4px" borderColor="green.400">
              <VStack align="start" spacing={2}>
                <HStack fontSize="sm">
                  <Icon as={FiCalendar} color="green.500"/>
                  <Text fontWeight="medium">{dateStr}</Text>
                </HStack>
                {campaign.location?.address && (
                  <HStack fontSize="sm" align="start">
                    <Icon as={FiMapPin} color="blue.500" mt={0.5} flexShrink={0}/>
                    <Text color="gray.600" _dark={{ color: 'gray.300' }}>{campaign.location.address}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            <Divider/>

            {/* Personal Details */}
            <Text fontWeight="bold" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="wider">
              Your Details
            </Text>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Full Name</FormLabel>
              <Input
                name="name" value={form.name} onChange={handleChange}
                placeholder="Ramesh Kumar"
                borderRadius="xl" size="sm"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Email Address</FormLabel>
              <Input
                name="email" value={form.email} onChange={handleChange}
                type="email" placeholder="you@example.com"
                borderRadius="xl" size="sm"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm">Phone Number</FormLabel>
              <Input
                name="phone" value={form.phone} onChange={handleChange}
                type="tel" placeholder="+91 98765 43210"
                borderRadius="xl" size="sm"
              />
            </FormControl>

            <Divider/>

            {/* Location */}
            <Text fontWeight="bold" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="wider">
              Your Location
            </Text>
            <Text fontSize="xs" color="gray.400">
              We use this to match you with nearby campaigns. Drag the marker or click on the map.
            </Text>

            <Button
              size="sm" leftIcon={<Icon as={FiMapPin}/>}
              colorScheme="teal" variant="outline"
              borderRadius="xl" isLoading={locating}
              loadingText="Detecting…"
              onClick={detectLocation}
              alignSelf="flex-start"
            >
              Detect My Location
            </Button>

            {address && (
              <Alert status="success" borderRadius="xl" py={2}>
                <AlertIcon/>
                <Text fontSize="xs" noOfLines={2}>{address}</Text>
              </Alert>
            )}

            {mapReady && (
              <Box h="220px" borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor={borderCol}>
                <MapContainer
                  center={location.lat ? [location.lat, location.lng] : [22.9734, 78.6569]}
                  zoom={location.lat ? 14 : 5}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom
                >
                  {location.lat && <RecenterMap lat={location.lat} lng={location.lng}/>}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <DraggableMarker location={location} setLocation={setLocation}/>
                </MapContainer>
              </Box>
            )}

            <Button
              colorScheme="green" size="md" borderRadius="xl"
              bgGradient="linear(135deg, green.500, teal.400)"
              _hover={{ bgGradient: 'linear(135deg, green.600, teal.500)', transform: 'scale(1.02)' }}
              isLoading={loading} loadingText="Registering…"
              onClick={handleSubmit}
              mt={2}
            >
              Confirm Registration
            </Button>

          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CampaignRegistrationModal;