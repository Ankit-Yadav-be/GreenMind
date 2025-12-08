import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  Image,
  Icon,
  InputGroup,
  InputLeftElement,
  Heading,
} from '@chakra-ui/react';
import { FiMapPin, FiClock, FiSearch } from 'react-icons/fi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored markers for different categories
const createCustomIcon = (category) => {
  const colors = {
    plastic: '#3182CE',
    organic: '#38A169',
    electronic: '#805AD5',
    other: '#DD6B20',
  };

  const color = colors[category] || '#718096';

  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          font-weight: bold;
        ">
          ${getCategoryEmoji(category)}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const getCategoryEmoji = (category) => {
  const emojis = {
    plastic: '🧴',
    organic: '🍃',
    electronic: '🔌',
    other: '🧩',
  };
  return emojis[category] || '📦';
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    'in-progress': 'blue',
    resolved: 'green',
    rejected: 'red',
  };
  return colors[status] || 'gray';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Component to recenter map when filters change
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [mapCenter, setMapCenter] = useState([22.9734, 78.6569]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Fetch reports
  useEffect(() => {
    fetchReports();
  }, []);

  // Apply location filter
  useEffect(() => {
    let filtered = [...reports];

    if (locationSearch) {
      filtered = filtered.filter((report) =>
        report.location.address?.toLowerCase().includes(locationSearch.toLowerCase())
      );
    }

    setFilteredReports(filtered);

    // Center map on first filtered result
    if (filtered.length > 0 && locationSearch) {
      const firstReport = filtered[0];
      setMapCenter([
        firstReport.location.coordinates[1],
        firstReport.location.coordinates[0],
      ]);
    }
  }, [reports, locationSearch]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}?limit=1000`);
      setReports(response.data.data);
      setFilteredReports(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (report) => {
    setSelectedReport(report);
    onOpen();
  };

  const clearFilter = () => {
    setLocationSearch('');
    setMapCenter([22.9734, 78.6569]);
  };

  if (loading) {
    return (
      <Container maxW="full" py={10} h="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text fontSize="lg" color="gray.500">
            Loading map data...
          </Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="error" rounded="lg" boxShadow="lg">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bg} h="100vh" position="relative">
      {/* Header with Search */}
      <Box
        position="absolute"
        top={4}
        left="50%"
        transform="translateX(-50%)"
        zIndex={1000}
        w={{ base: '90%', md: '500px' }}
      >
        <VStack spacing={3}>
          <Box
            bg={cardBg}
            p={4}
            rounded="xl"
            boxShadow="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            w="100%"
          >
            <Heading size="md" mb={3} textAlign="center" color="teal.400">
              🗺️ Waste Reports Map
            </Heading>
            <HStack>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  bg={bg}
                  borderColor={borderColor}
                  _hover={{ borderColor: 'teal.300' }}
                  _focus={{
                    borderColor: 'teal.400',
                    boxShadow: '0 0 0 1px teal.400',
                  }}
                />
              </InputGroup>
              {locationSearch && (
                <Button onClick={clearFilter} colorScheme="gray" size="sm">
                  Clear
                </Button>
              )}
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
              Showing {filteredReports.length} of {reports.length} reports
            </Text>
          </Box>
        </VStack>
      </Box>

      {/* Map Container - Full Screen */}
      <Box h="100%" w="100%">
        {filteredReports.length === 0 ? (
          <Box
            h="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={cardBg}
            flexDirection="column"
            gap={4}
          >
            <Text fontSize="6xl">🗺️</Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.600">
              No reports found for this location
            </Text>
            <Text color="gray.500">Try searching for a different location</Text>
            <Button onClick={clearFilter} colorScheme="teal" size="lg">
              Show All Reports
            </Button>
          </Box>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <RecenterMap center={mapCenter} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {filteredReports.map((report) => (
              <Marker
                key={report._id}
                position={[
                  report.location.coordinates[1],
                  report.location.coordinates[0],
                ]}
                icon={createCustomIcon(report.category)}
                eventHandlers={{
                  click: () => handleMarkerClick(report),
                }}
              >
                <Popup>
                  <Box p={2} minW="200px">
                    <Text fontWeight="bold" fontSize="md" mb={2}>
                      {getCategoryEmoji(report.category)} {report.category}
                    </Text>
                    <Text fontSize="sm" noOfLines={2} mb={2}>
                      {report.description}
                    </Text>
                    <Badge colorScheme={getStatusColor(report.status)} fontSize="xs">
                      {report.status}
                    </Badge>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </Box>

      {/* Report Details Modal */}
      {selectedReport && (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalOverlay />
          <ModalContent bg={cardBg} maxH="90vh" overflowY="auto">
            <ModalHeader>
              <HStack>
                <Text fontSize="2xl">{getCategoryEmoji(selectedReport.category)}</Text>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl">Report Details</Text>
                  <Badge
                    colorScheme={getStatusColor(selectedReport.status)}
                    fontSize="xs"
                    textTransform="capitalize"
                  >
                    {selectedReport.status}
                  </Badge>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={6} align="stretch">
                {/* Main Image */}
                <Box rounded="lg" overflow="hidden" boxShadow="xl">
                  <Image
                    src={selectedReport.images[0]?.url}
                    alt="Main report"
                    w="100%"
                    h="400px"
                    objectFit="cover"
                    fallbackSrc="https://via.placeholder.com/800x400?text=No+Image"
                  />
                </Box>

                {/* Additional Images */}
                {selectedReport.images.length > 1 && (
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                    {selectedReport.images.slice(1).map((image, index) => (
                      <Image
                        key={index}
                        src={image.url}
                        alt={`Report ${index + 2}`}
                        rounded="md"
                        objectFit="cover"
                        h="100px"
                        w="100%"
                        cursor="pointer"
                        onClick={() => window.open(image.url, '_blank')}
                        _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                      />
                    ))}
                  </SimpleGrid>
                )}

                {/* Description */}
                <Box
                  p={5}
                  bg={bg}
                  rounded="lg"
                  borderLeftWidth="4px"
                  borderColor="teal.400"
                >
                  <Text fontWeight="bold" mb={2} color="teal.400">
                    Description
                  </Text>
                  <Text fontSize="md" lineHeight="tall">
                    {selectedReport.description}
                  </Text>
                </Box>

                {/* Info Grid */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} bg={bg} rounded="lg">
                    <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>
                      Category
                    </Text>
                    <HStack>
                      <Text fontSize="2xl">{getCategoryEmoji(selectedReport.category)}</Text>
                      <Text fontSize="lg" textTransform="capitalize" fontWeight="medium">
                        {selectedReport.category} Waste
                      </Text>
                    </HStack>
                  </Box>

                  <Box p={4} bg={bg} rounded="lg">
                    <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>
                      Status
                    </Text>
                    <Badge
                      colorScheme={getStatusColor(selectedReport.status)}
                      fontSize="md"
                      px={4}
                      py={2}
                      rounded="full"
                      textTransform="capitalize"
                    >
                      {selectedReport.status}
                    </Badge>
                  </Box>

                  <Box p={4} bg={bg} rounded="lg">
                    <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>
                      Reported On
                    </Text>
                    <HStack>
                      <Icon as={FiClock} color="teal.400" />
                      <Text fontSize="md">{formatDate(selectedReport.createdAt)}</Text>
                    </HStack>
                  </Box>

                  <Box p={4} bg={bg} rounded="lg">
                    <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>
                      Coordinates
                    </Text>
                    <Text fontSize="sm">
                      {selectedReport.location.coordinates[1].toFixed(6)},{' '}
                      {selectedReport.location.coordinates[0].toFixed(6)}
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Location */}
                {selectedReport.location.address && (
                  <Box
                    p={5}
                    bg={bg}
                    rounded="lg"
                    borderLeftWidth="4px"
                    borderColor="green.400"
                  >
                    <HStack mb={2}>
                      <Icon as={FiMapPin} color="green.400" boxSize={5} />
                      <Text fontWeight="bold" color="green.400">
                        Location
                      </Text>
                    </HStack>
                    <Text fontSize="md">{selectedReport.location.address}</Text>
                  </Box>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default MapPage;