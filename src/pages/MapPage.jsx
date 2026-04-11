import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import {
  Box, Container, VStack, HStack, Text, Input, Button,
  useColorModeValue, Spinner, Alert, AlertIcon, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, SimpleGrid, Image, Icon,
  InputGroup, InputLeftElement, Heading, Select, Flex, Tabs,
  TabList, Tab, TabPanels, TabPanel, Progress, Divider,
} from '@chakra-ui/react';
import { FiMapPin, FiClock, FiSearch, FiLayers } from 'react-icons/fi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import PriorityBadge from '../components/shared/PriorityBadge';

const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/reports`;

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORY_COLORS = {
  plastic:    '#3182CE',
  organic:    '#38A169',
  electronic: '#805AD5',
  other:      '#DD6B20',
};

const PRIORITY_FILL = {
  High:   { color: '#C53030', fillColor: '#FC8181' },
  Medium: { color: '#B7791F', fillColor: '#F6E05E' },
  Low:    { color: '#276749', fillColor: '#68D391' },
};

const getCategoryEmoji = (category) =>
  ({ plastic: '🧴', organic: '🍃', electronic: '🔌', other: '🧩' }[category] || '📦');

const getStatusColor = (status) =>
  ({ pending: 'yellow', 'in-progress': 'blue', resolved: 'green', rejected: 'red' }[status] || 'gray');

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// Custom pin-shaped marker (your existing style preserved)
const createCustomIcon = (category) => {
  const color = CATEGORY_COLORS[category] || '#718096';
  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 32px; height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 14px;">
          ${getCategoryEmoji(category)}
        </div>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapPage = () => {
  const [reports, setReports]             = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [filteredReports, setFiltered]    = useState([]);
  const [loading, setLoading]             = useState(true);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [error, setError]                 = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [mapCenter, setMapCenter]         = useState([22.9734, 78.6569]);
  const [statusFilter, setStatusFilter]   = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [mapMode, setMapMode]             = useState('markers'); // 'markers' | 'heatmap'
  const { isOpen, onOpen, onClose }       = useDisclosure();

  const bg        = useColorModeValue('gray.50', 'gray.900');
  const cardBg    = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleBg  = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => { fetchReports(); }, []);

  // Fetch heatmap data when mode switches
  useEffect(() => {
    if (mapMode === 'heatmap' && heatmapPoints.length === 0) {
      fetchHeatmap();
    }
  }, [mapMode]);

  // Apply filters
  useEffect(() => {
    let result = [...reports];

    if (locationSearch) {
      result = result.filter(r =>
        r.location.address?.toLowerCase().includes(locationSearch.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter(r => r.priorityLevel === priorityFilter);
    }

    setFiltered(result);

    if (result.length > 0 && locationSearch) {
      setMapCenter([
        result[0].location.coordinates[1],
        result[0].location.coordinates[0],
      ]);
    }
  }, [reports, locationSearch, statusFilter, priorityFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}?limit=1000`, { withCredentials: true });
      setReports(response.data.data);
      setFiltered(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    try {
      setHeatmapLoading(true);
      const res = await axios.get(`${API_URL}/heatmap`, { withCredentials: true });
      setHeatmapPoints(res.data.data || []);
    } catch (err) {
      console.error('Heatmap fetch failed:', err.message);
    } finally {
      setHeatmapLoading(false);
    }
  };

  const handleMarkerClick = (report) => {
    setSelectedReport(report);
    onOpen();
  };

  const clearFilters = () => {
    setLocationSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setMapCenter([22.9734, 78.6569]);
  };

  const hasFilters = locationSearch || statusFilter !== 'all' || priorityFilter !== 'all';

  if (loading) {
    return (
      <Container maxW="full" py={10} h="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text fontSize="lg" color="gray.500">Loading map data...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="error" rounded="lg" boxShadow="lg">
          <AlertIcon /><Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bg} h="100vh" position="relative">
      {/* Floating control panel */}
      <Box
        position="absolute"
        top={4}
        left="50%"
        transform="translateX(-50%)"
        zIndex={1000}
        w={{ base: '92%', md: '560px' }}
      >
        <Box
          bg={cardBg}
          p={4}
          rounded="xl"
          boxShadow="2xl"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Heading size="md" mb={3} textAlign="center" color="teal.400">
            🗺️ Waste Reports Map
          </Heading>

          {/* Mode toggle */}
          <HStack mb={3} justify="center" spacing={2}>
            <Button
              size="sm"
              colorScheme={mapMode === 'markers' ? 'teal' : 'gray'}
              variant={mapMode === 'markers' ? 'solid' : 'outline'}
              onClick={() => setMapMode('markers')}
              leftIcon={<Icon as={FiMapPin} />}
            >
              Markers
            </Button>
            <Button
              size="sm"
              colorScheme={mapMode === 'heatmap' ? 'orange' : 'gray'}
              variant={mapMode === 'heatmap' ? 'solid' : 'outline'}
              onClick={() => setMapMode('heatmap')}
              leftIcon={<Icon as={FiLayers} />}
            >
              Heatmap
            </Button>
          </HStack>

          {/* Search */}
          <InputGroup mb={2}>
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
              _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal' }}
            />
          </InputGroup>

          {/* Filters row — only shown in marker mode */}
          {mapMode === 'markers' && (
            <HStack spacing={2} mb={2}>
              <Select
                size="sm"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                bg={bg}
                borderColor={borderColor}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </Select>
              <Select
                size="sm"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                bg={bg}
                borderColor={borderColor}
              >
                <option value="all">All Priorities</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </Select>
              {hasFilters && (
                <Button size="sm" colorScheme="gray" variant="outline" onClick={clearFilters} flexShrink={0}>
                  Clear
                </Button>
              )}
            </HStack>
          )}

          {/* Heatmap legend */}
          {mapMode === 'heatmap' && (
            <HStack spacing={4} justify="center" fontSize="xs" color="gray.500">
              <HStack><Box w="10px" h="10px" borderRadius="full" bg="#FC8181" /><Text>High</Text></HStack>
              <HStack><Box w="10px" h="10px" borderRadius="full" bg="#F6E05E" /><Text>Medium</Text></HStack>
              <HStack><Box w="10px" h="10px" borderRadius="full" bg="#68D391" /><Text>Low</Text></HStack>
            </HStack>
          )}

          <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
            {mapMode === 'markers'
              ? `Showing ${filteredReports.length} of ${reports.length} reports`
              : `Heatmap: ${heatmapPoints.length} data points`
            }
          </Text>
        </Box>
      </Box>

      {/* Map */}
      <Box h="100%" w="100%">
        <MapContainer
          center={mapCenter}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <RecenterMap center={mapCenter} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {/* MARKER MODE — your existing custom pin markers */}
          {mapMode === 'markers' && filteredReports.map((report) => (
            <Marker
              key={report._id}
              position={[report.location.coordinates[1], report.location.coordinates[0]]}
              icon={createCustomIcon(report.category)}
              eventHandlers={{ click: () => handleMarkerClick(report) }}
            >
              <Popup>
                <Box p={2} minW="200px">
                  <Text fontWeight="bold" fontSize="md" mb={1}>
                    {getCategoryEmoji(report.category)} {report.category}
                  </Text>
                  <Text fontSize="sm" noOfLines={2} mb={2}>{report.description}</Text>
                  <HStack>
                    <Badge colorScheme={getStatusColor(report.status)} fontSize="xs">
                      {report.status}
                    </Badge>
                    {report.priorityLevel && (
                      <Badge
                        colorScheme={report.priorityLevel === 'High' ? 'red' : report.priorityLevel === 'Medium' ? 'yellow' : 'green'}
                        fontSize="xs"
                      >
                        {report.priorityLevel}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              </Popup>
            </Marker>
          ))}

          {/* HEATMAP MODE — colored circle markers by priority */}
          {mapMode === 'heatmap' && (
            heatmapLoading ? null : heatmapPoints.map((point, idx) => {
              const cfg = PRIORITY_FILL[point.priorityLevel] || { color: '#718096', fillColor: '#A0AEC0' };
              const radius = 6 + (point.clusterSize || 1) * 2 + (point.weight || 0.3) * 10;
              return (
                <CircleMarker
                  key={idx}
                  center={[point.lat, point.lng]}
                  radius={Math.min(radius, 26)}
                  color={cfg.color}
                  fillColor={cfg.fillColor}
                  fillOpacity={0.72}
                  weight={1.5}
                >
                  <Popup>
                    <Box p={1}>
                      <Badge
                        colorScheme={point.priorityLevel === 'High' ? 'red' : point.priorityLevel === 'Medium' ? 'yellow' : 'green'}
                        mb={1}
                      >
                        {point.priorityLevel || 'Unscored'} Priority
                      </Badge>
                      <Text fontSize="xs" textTransform="capitalize">Category: {point.category}</Text>
                      <Text fontSize="xs" textTransform="capitalize">Status: {point.status}</Text>
                      {point.clusterSize > 1 && (
                        <Text fontSize="xs" color="orange.600">{point.clusterSize} nearby reports</Text>
                      )}
                    </Box>
                  </Popup>
                </CircleMarker>
              );
            })
          )}
        </MapContainer>

        {/* Heatmap loading overlay */}
        {mapMode === 'heatmap' && heatmapLoading && (
          <Box
            position="absolute" bottom={6} left="50%" transform="translateX(-50%)"
            zIndex={1000} bg={cardBg} px={5} py={3} borderRadius="xl" boxShadow="xl"
          >
            <HStack><Spinner size="sm" color="orange.400" /><Text fontSize="sm">Loading heatmap...</Text></HStack>
          </Box>
        )}
      </Box>

      {/* Report Details Modal — your existing modal preserved + priority breakdown added */}
      {selectedReport && (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalOverlay />
          <ModalContent bg={cardBg} maxH="90vh" overflowY="auto">
            <ModalHeader>
              <HStack>
                <Text fontSize="2xl">{getCategoryEmoji(selectedReport.category)}</Text>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xl">Report Details</Text>
                  <HStack>
                    <Badge colorScheme={getStatusColor(selectedReport.status)} fontSize="xs" textTransform="capitalize">
                      {selectedReport.status}
                    </Badge>
                    <PriorityBadge
                      priorityLevel={selectedReport.priorityLevel}
                      priorityScore={selectedReport.priorityScore}
                      size="sm"
                    />
                  </HStack>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Tabs colorScheme="teal" variant="enclosed">
                <TabList>
                  <Tab fontSize="sm">Details</Tab>
                  {selectedReport.wasteClassification?.wasteType && <Tab fontSize="sm">Classification</Tab>}
                  {selectedReport.recommendations?.immediateActions?.length > 0 && <Tab fontSize="sm">Actions</Tab>}
                </TabList>

                <TabPanels>
                  {/* ── Tab 1: Existing detail view (your original preserved) ── */}
                  <TabPanel px={0}>
                    <VStack spacing={5} align="stretch">
                      <Box rounded="lg" overflow="hidden" boxShadow="xl">
                        <Image
                          src={selectedReport.images[0]?.url}
                          alt="Main report"
                          w="100%" h="300px" objectFit="cover"
                          fallbackSrc="https://via.placeholder.com/800x300?text=No+Image"
                        />
                      </Box>

                      {selectedReport.images.length > 1 && (
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                          {selectedReport.images.slice(1).map((image, index) => (
                            <Image
                              key={index} src={image.url} alt={`Report ${index + 2}`}
                              rounded="md" objectFit="cover" h="100px" w="100%"
                              cursor="pointer" onClick={() => window.open(image.url, '_blank')}
                              _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }} transition="all 0.2s"
                            />
                          ))}
                        </SimpleGrid>
                      )}

                      <Box p={5} bg={subtleBg} rounded="lg" borderLeftWidth="4px" borderColor="teal.400">
                        <Text fontWeight="bold" mb={2} color="teal.400">Description</Text>
                        <Text fontSize="md" lineHeight="tall">{selectedReport.description}</Text>
                      </Box>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box p={4} bg={subtleBg} rounded="lg">
                          <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>Category</Text>
                          <HStack>
                            <Text fontSize="2xl">{getCategoryEmoji(selectedReport.category)}</Text>
                            <Text fontSize="lg" textTransform="capitalize" fontWeight="medium">
                              {selectedReport.category} Waste
                            </Text>
                          </HStack>
                        </Box>
                        <Box p={4} bg={subtleBg} rounded="lg">
                          <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>Status</Text>
                          <Badge colorScheme={getStatusColor(selectedReport.status)} fontSize="md" px={4} py={2} rounded="full" textTransform="capitalize">
                            {selectedReport.status}
                          </Badge>
                        </Box>
                        <Box p={4} bg={subtleBg} rounded="lg">
                          <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>Reported On</Text>
                          <HStack>
                            <Icon as={FiClock} color="teal.400" />
                            <Text fontSize="md">{formatDate(selectedReport.createdAt)}</Text>
                          </HStack>
                        </Box>
                        <Box p={4} bg={subtleBg} rounded="lg">
                          <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>Coordinates</Text>
                          <Text fontSize="sm">
                            {selectedReport.location.coordinates[1].toFixed(6)},{' '}
                            {selectedReport.location.coordinates[0].toFixed(6)}
                          </Text>
                        </Box>
                      </SimpleGrid>

                      {selectedReport.location.address && (
                        <Box p={5} bg={subtleBg} rounded="lg" borderLeftWidth="4px" borderColor="green.400">
                          <HStack mb={2}>
                            <Icon as={FiMapPin} color="green.400" boxSize={5} />
                            <Text fontWeight="bold" color="green.400">Location</Text>
                          </HStack>
                          <Text fontSize="md">{selectedReport.location.address}</Text>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* ── Tab 2: AI Waste Classification ── */}
                  {selectedReport.wasteClassification?.wasteType && (
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        <SimpleGrid columns={2} spacing={3}>
                          {[
                            { label: 'Waste Type',    value: selectedReport.wasteClassification.wasteType },
                            { label: 'Sub Type',      value: selectedReport.wasteClassification.subType },
                            { label: 'Hazard Level',  value: selectedReport.wasteClassification.hazardLevel },
                            { label: 'Recyclable',    value: selectedReport.wasteClassification.recyclingPossibility },
                            { label: 'Action Needed', value: selectedReport.wasteClassification.actionRequired },
                            {
                              label: 'Decomposition',
                              value: selectedReport.wasteClassification.estimatedDecompositionDays === -1
                                ? 'Non-biodegradable'
                                : `~${selectedReport.wasteClassification.estimatedDecompositionDays} days`,
                            },
                          ].map(({ label, value }) => (
                            <Box key={label} p={3} bg={subtleBg} rounded="lg">
                              <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
                              <Text fontSize="sm" fontWeight="bold">{value || 'N/A'}</Text>
                            </Box>
                          ))}
                        </SimpleGrid>

                        <Box p={4} bg={subtleBg} rounded="lg">
                          <Text fontSize="xs" color="gray.500" mb={1}>Disposal Method</Text>
                          <Text fontSize="sm">{selectedReport.wasteClassification.disposalMethod}</Text>
                        </Box>
                        <Box p={4} bg={subtleBg} rounded="lg">
                          <Text fontSize="xs" color="gray.500" mb={1}>Recycling Instructions</Text>
                          <Text fontSize="sm">{selectedReport.wasteClassification.recyclingInstructions}</Text>
                        </Box>
                        <Box p={4} bg={subtleBg} rounded="lg" borderLeftWidth="3px" borderColor="orange.400">
                          <Text fontSize="xs" color="orange.500" mb={1}>Environmental Impact</Text>
                          <Text fontSize="sm">{selectedReport.wasteClassification.environmentalImpact}</Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                  )}

                  {/* ── Tab 3: Recommendations ── */}
                  {selectedReport.recommendations?.immediateActions?.length > 0 && (
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        <Box p={4} bg={subtleBg} rounded="lg">
                          <Text fontWeight="bold" fontSize="sm" mb={2}>Immediate Actions</Text>
                          <VStack align="start" spacing={1}>
                            {selectedReport.recommendations.immediateActions.map((a, i) => (
                              <HStack key={i} align="start">
                                <Text color="teal.500" fontSize="sm" flexShrink={0}>{i + 1}.</Text>
                                <Text fontSize="sm">{a}</Text>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>

                        <SimpleGrid columns={2} spacing={3}>
                          <Box p={3} bg={subtleBg} rounded="lg">
                            <Text fontSize="xs" color="gray.500" mb={1}>Authority to Contact</Text>
                            <Text fontSize="sm" fontWeight="bold">{selectedReport.recommendations.authorityToContact}</Text>
                          </Box>
                          <Box p={3} bg={subtleBg} rounded="lg">
                            <Text fontSize="xs" color="gray.500" mb={1}>Est. Resolution</Text>
                            <Text fontSize="sm" fontWeight="bold">{selectedReport.recommendations.estimatedResolutionTime}</Text>
                          </Box>
                        </SimpleGrid>

                        {selectedReport.recommendations.recyclingCenters?.length > 0 && (
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" mb={2}>Nearby Recycling Centers</Text>
                            <VStack spacing={2}>
                              {selectedReport.recommendations.recyclingCenters.map((center, i) => (
                                <Box key={i} p={3} bg={subtleBg} rounded="lg" w="full">
                                  <Text fontSize="sm" fontWeight="bold">{center.name}</Text>
                                  <Text fontSize="xs" color="gray.500">{center.area}</Text>
                                  <Text fontSize="xs" color="teal.500">{center.phone}</Text>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        )}

                        {selectedReport.recommendations.preventionTips?.length > 0 && (
                          <Box p={4} bg={subtleBg} rounded="lg">
                            <Text fontWeight="bold" fontSize="sm" mb={2}>Prevention Tips</Text>
                            <VStack align="start" spacing={1}>
                              {selectedReport.recommendations.preventionTips.map((tip, i) => (
                                <Text key={i} fontSize="sm">• {tip}</Text>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default MapPage;