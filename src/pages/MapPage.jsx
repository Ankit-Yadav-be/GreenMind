import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import {
  Box, Flex, VStack, HStack, Text, Input, Button,
  useColorModeValue, Spinner, Alert, AlertIcon, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, SimpleGrid, Image, Icon,
  InputGroup, InputLeftElement, Select, Divider, Progress,
  Tabs, TabList, Tab, TabPanels, TabPanel, IconButton,
} from '@chakra-ui/react';
import { FiMapPin, FiClock, FiSearch, FiLayers, FiMap, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/reports`;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CAT_COLORS  = { plastic:'#3182CE', organic:'#38A169', electronic:'#805AD5', other:'#DD6B20' };
const PRIORITY_FILL = {
  High:   { color:'#C53030', fillColor:'#FC8181' },
  Medium: { color:'#B7791F', fillColor:'#F6E05E' },
  Low:    { color:'#276749', fillColor:'#68D391'  },
};
const getCatEmoji   = (c) => ({ plastic:'🧴', organic:'🍃', electronic:'🔌', other:'🧩' }[c] || '📦');
const getStatusColor = (s) => ({ pending:'yellow', 'in-progress':'blue', resolved:'green', rejected:'red' }[s] || 'gray');
const fmtDate        = (d) => new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

const createCustomIcon = (category, priorityLevel) => {
  const color      = CAT_COLORS[category] || '#718096';
  const ringColor  = priorityLevel === 'High' ? '#FC8181' : priorityLevel === 'Medium' ? '#F6E05E' : 'transparent';
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="
      background-color:${color};width:34px;height:34px;
      border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 0 0 2px ${ringColor}, 0 3px 10px rgba(0,0,0,0.25);
      display:flex;align-items:center;justify-content:center;">
      <div style="transform:rotate(45deg);color:white;font-size:14px;">${getCatEmoji(category)}</div>
    </div>`,
    iconSize:[34,34], iconAnchor:[17,34], popupAnchor:[0,-34],
  });
};

const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, zoom || map.getZoom()); }, [center, zoom, map]);
  return null;
};

const MapPage = () => {
  const [reports, setReports]             = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [heatLoading, setHeatLoading]     = useState(false);
  const [error, setError]                 = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [mapCenter, setMapCenter]         = useState([22.9734, 78.6569]);
  const [statusFilter, setStatus]         = useState('all');
  const [priorityFilter, setPriority]     = useState('all');
  const [mapMode, setMapMode]             = useState('markers');
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [suggestions, setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapZoom, setMapZoom]             = useState(6);
  const { isOpen, onOpen, onClose }       = useDisclosure();

  const bg       = useColorModeValue('gray.50',  'gray.900');
  const sidebarBg = useColorModeValue('white',   'gray.800');
  const borderCol = useColorModeValue('gray.200','gray.700');
  const subtleBg  = useColorModeValue('gray.50', 'gray.700');
  const cardBg    = useColorModeValue('white',   'gray.800');

  useEffect(() => { fetchReports(); }, []);

  useEffect(() => {
    if (mapMode === 'heatmap' && heatmapPoints.length === 0) fetchHeatmap();
  }, [mapMode]);

  useEffect(() => {
    let result = [...reports];
    if (locationSearch) result = result.filter(r => r.location.address?.toLowerCase().includes(locationSearch.toLowerCase()));
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter(r => r.priorityLevel === priorityFilter);
    setFiltered(result);
    if (result.length > 0 && locationSearch) setMapCenter([result[0].location.coordinates[1], result[0].location.coordinates[0]]);
  }, [reports, locationSearch, statusFilter, priorityFilter]);

  const fetchReports = async () => {
    try { setLoading(true); setError('');
      const { data } = await axios.get(`${API_URL}?limit=1000`, { withCredentials:true });
      setReports(data.data); setFiltered(data.data);
    } catch (err) { setError(err.response?.data?.message || 'Failed to fetch'); }
    finally { setLoading(false); }
  };

  const fetchHeatmap = async () => {
    try { setHeatLoading(true);
      const { data } = await axios.get(`${API_URL}/heatmap`, { withCredentials:true });
      setHeatmapPoints(data.data || []);
    } catch (err) { console.error(err.message); }
    finally { setHeatLoading(false); }
  };

  const handleMarkerClick = (report) => { setSelectedReport(report); onOpen(); };

  const hasFilters = locationSearch || statusFilter !== 'all' || priorityFilter !== 'all';

  // Stats for sidebar
  const stats = {
    total:  filtered.length,
    high:   filtered.filter(r => r.priorityLevel === 'High').length,
    medium: filtered.filter(r => r.priorityLevel === 'Medium').length,
    low:    filtered.filter(r => r.priorityLevel === 'Low').length,
  };

  if (loading) return (
    <Flex h="100vh" align="center" justify="center" direction="column" gap={4}>
      <Spinner size="xl" color="teal.500" thickness="4px"/>
      <Text color="gray.500">Loading map data…</Text>
    </Flex>
  );

  if (error) return (
    <Box p={8}><Alert status="error" rounded="xl"><AlertIcon/><Text>{error}</Text></Alert></Box>
  );

  return (
    <Flex h="calc(100vh - 70px)" overflow="hidden">

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <Box
        w={sidebarOpen ? { base:'100%', md:'320px' } : '0'}
        minW={sidebarOpen ? { base:'100%', md:'320px' } : '0'}
        bg={sidebarBg}
        borderRightWidth="1px"
        borderColor={borderCol}
        overflowY="auto"
        overflowX="hidden"
        transition="all 0.3s ease"
        flexShrink={0}
        display={{ base: sidebarOpen ? 'block' : 'none', md:'block' }}
        position="relative"
      >
        {sidebarOpen && (
          <VStack spacing={0} align="stretch" h="100%">
            {/* Sidebar Header */}
            <Box p={5} borderBottomWidth="1px" borderColor={borderCol}
              bgGradient="linear(135deg, teal.600, green.500)">
              <Text fontSize="lg" fontWeight="extrabold" color="white">🗺️ Waste Map</Text>
              <Text fontSize="xs" color="whiteAlpha.800" mt={0.5}>Click any marker to view details</Text>
            </Box>

            <Box p={4} overflowY="auto" flex={1}>
              {/* Map Mode Toggle */}
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                View Mode
              </Text>
              <HStack mb={4} spacing={2}>
                <Button flex={1} size="sm" colorScheme={mapMode === 'markers' ? 'teal' : 'gray'}
                  variant={mapMode === 'markers' ? 'solid' : 'outline'}
                  onClick={() => setMapMode('markers')} leftIcon={<Icon as={FiMapPin}/>} borderRadius="xl">
                  Markers
                </Button>
                <Button flex={1} size="sm" colorScheme={mapMode === 'heatmap' ? 'orange' : 'gray'}
                  variant={mapMode === 'heatmap' ? 'solid' : 'outline'}
                  onClick={() => setMapMode('heatmap')} leftIcon={<Icon as={FiLayers}/>} borderRadius="xl">
                  Heatmap
                </Button>
              </HStack>

              {/* Search */}
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                Search
              </Text>
            <Box mb={4} position="relative">
  <InputGroup size="sm">
    <InputLeftElement><Icon as={FiSearch} color="gray.400"/></InputLeftElement>
    <Input
      placeholder="Search by location…"
      value={locationSearch}
      borderRadius="xl"
      bg={subtleBg}
      autoComplete="off"
      onChange={async (e) => {
        const val = e.target.value;
        setLocationSearch(val);
        if (val.trim().length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&addressdetails=1`);
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch {}
      }}
      onKeyDown={async (e) => {
        if (e.key === 'Enter' && locationSearch.trim()) {
          setShowSuggestions(false);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&limit=1`);
            const data = await res.json();
            if (data.length > 0) { setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]); setMapZoom(12); }
          } catch {}
        }
        if (e.key === 'Escape') setShowSuggestions(false);
      }}
      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
    />
  </InputGroup>

  {/* Autocomplete Dropdown */}
  {showSuggestions && suggestions.length > 0 && (
    <Box
      position="absolute" top="36px" left={0} right={0} zIndex={9999}
      bg={sidebarBg} borderRadius="xl" boxShadow="xl"
      borderWidth="1px" borderColor={borderCol} overflow="hidden"
    >
      {suggestions.map((s, i) => (
        <Box
          key={i}
          px={3} py={2}
          cursor="pointer"
          fontSize="xs"
          borderBottomWidth={i < suggestions.length - 1 ? '1px' : '0'}
          borderColor={borderCol}
          _hover={{ bg: subtleBg }}
          onMouseDown={() => {
            setLocationSearch(s.display_name);
            setMapCenter([parseFloat(s.lat), parseFloat(s.lon)]);
            setMapZoom(12);
            setSuggestions([]);
            setShowSuggestions(false);
          }}
        >
          <Text noOfLines={1} title={s.display_name}>
            📍 {s.display_name}
          </Text>
        </Box>
      ))}
    </Box>
  )}
</Box>

              {/* Filters — marker mode only */}
              {mapMode === 'markers' && (
                <>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                    Filters
                  </Text>
                  <VStack spacing={2} mb={4}>
                    <Select size="sm" value={statusFilter} onChange={e => setStatus(e.target.value)} borderRadius="xl" bg={subtleBg}>
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </Select>
                    <Select size="sm" value={priorityFilter} onChange={e => setPriority(e.target.value)} borderRadius="xl" bg={subtleBg}>
                      <option value="all">All Priorities</option>
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </Select>
                    {hasFilters && (
                      <Button size="xs" variant="ghost" colorScheme="red" w="full" borderRadius="xl"
                        onClick={() => { setLocationSearch(''); setStatus('all'); setPriority('all'); }}>
                        Clear all filters
                      </Button>
                    )}
                  </VStack>
                </>
              )}

              <Divider mb={4}/>

              {/* Stats */}
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={3}>
                {mapMode === 'markers' ? 'Visible Reports' : 'Heatmap Points'}
              </Text>

              {mapMode === 'markers' ? (
                <SimpleGrid columns={2} spacing={2} mb={4}>
                  {[
                    { label:'Total',  value: stats.total,  color:'teal'   },
                    { label:'🔴 High',  value: stats.high,   color:'red'    },
                    { label:'🟡 Medium',value: stats.medium, color:'yellow' },
                    { label:'🟢 Low',   value: stats.low,    color:'green'  },
                  ].map(({ label, value, color }) => (
                    <Box key={label} p={3} bg={subtleBg} borderRadius="xl" textAlign="center">
                      <Text fontSize="xs" color="gray.400">{label}</Text>
                      <Text fontSize="xl" fontWeight="extrabold" color={`${color}.500`}>{value}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <Box p={3} bg={subtleBg} borderRadius="xl" mb={4}>
                  <VStack spacing={2}>
                    {[
                      { label:'High priority',   color:'#FC8181' },
                      { label:'Medium priority', color:'#F6E05E' },
                      { label:'Low priority',    color:'#68D391' },
                    ].map(({ label, color }) => (
                      <HStack key={label} w="full" justify="space-between">
                        <HStack><Box w="12px" h="12px" borderRadius="full" bg={color}/><Text fontSize="xs">{label}</Text></HStack>
                        <Text fontSize="xs" color="gray.400">circle size = score</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              <Divider mb={4}/>

              {/* Category Legend */}
              {mapMode === 'markers' && (
                <>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={3}>
                    Pin Colors (by category)
                  </Text>
                  <VStack spacing={1.5} mb={4}>
                    {Object.entries(CAT_COLORS).map(([cat, color]) => (
                      <HStack key={cat} justify="space-between" w="full">
                        <HStack spacing={2}>
                          <Box w="12px" h="12px" borderRadius="full" bg={color}/>
                          <Text fontSize="xs" textTransform="capitalize">{getCatEmoji(cat)} {cat}</Text>
                        </HStack>
                        <Text fontSize="10px" color="gray.400">Ring = priority</Text>
                      </HStack>
                    ))}
                  </VStack>
                </>
              )}

              {heatLoading && (
                <HStack justify="center" p={4}>
                  <Spinner size="sm" color="orange.400"/>
                  <Text fontSize="sm" color="gray.500">Loading heatmap…</Text>
                </HStack>
              )}
            </Box>
          </VStack>
        )}
      </Box>

      {/* ── Sidebar Toggle Button ─────────────────────────────────────── */}
      <Box
        position="absolute"
        left={sidebarOpen ? { base:'auto', md:'312px' } : '0'}
        top="50%"
        transform="translateY(-50%)"
        zIndex={1001}
        display={{ base:'none', md:'block' }}
      >
        <IconButton
          icon={sidebarOpen ? <FiChevronLeft/> : <FiChevronRight/>}
          onClick={() => setSidebarOpen(o => !o)}
          size="sm" colorScheme="teal" borderRadius="0 xl xl 0"
          aria-label="Toggle sidebar"
          boxShadow="md"
        />
      </Box>

      {/* ── Map Area ──────────────────────────────────────────────────── */}
      <Box flex={1} position="relative">
        <MapContainer center={mapCenter} zoom={6} style={{ height:'100%', width:'100%' }} scrollWheelZoom>
          <RecenterMap center={mapCenter} zoom={mapZoom}/>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {mapMode === 'markers' && filtered.map(report => (
            <Marker key={report._id}
              position={[report.location.coordinates[1], report.location.coordinates[0]]}
              icon={createCustomIcon(report.category, report.priorityLevel)}
              eventHandlers={{ click: () => handleMarkerClick(report) }}
            >
              <Popup>
                <Box p={2} minW="180px">
                  <HStack mb={1}>
                    <Text fontWeight="bold" fontSize="sm">{getCatEmoji(report.category)} {report.category}</Text>
                  </HStack>
                  <Text fontSize="xs" noOfLines={2} color="gray.600" mb={2}>{report.description}</Text>
                  <HStack flexWrap="wrap" gap={1}>
                    <Badge colorScheme={getStatusColor(report.status)} fontSize="10px">{report.status}</Badge>
                    {report.priorityLevel && (
                      <Badge colorScheme={report.priorityLevel === 'High' ? 'red' : report.priorityLevel === 'Medium' ? 'yellow' : 'green'} fontSize="10px">
                        {report.priorityLevel} · {report.priorityScore}
                      </Badge>
                    )}
                  </HStack>
                  <Button size="xs" mt={2} colorScheme="teal" w="full" onClick={() => handleMarkerClick(report)}>
                    View Details
                  </Button>
                </Box>
              </Popup>
            </Marker>
          ))}

          {mapMode === 'heatmap' && !heatLoading && heatmapPoints.map((point, idx) => {
            const cfg    = PRIORITY_FILL[point.priorityLevel] || { color:'#718096', fillColor:'#A0AEC0' };
            const radius = 6 + (point.clusterSize || 1) * 2 + (point.weight || 0.3) * 10;
            return (
              <CircleMarker key={idx} center={[point.lat, point.lng]}
                radius={Math.min(radius, 28)} color={cfg.color}
                fillColor={cfg.fillColor} fillOpacity={0.72} weight={1.5}>
                <Popup>
                  <Box p={1}>
                    <Badge colorScheme={point.priorityLevel === 'High' ? 'red' : point.priorityLevel === 'Medium' ? 'yellow' : 'green'} mb={1}>
                      {point.priorityLevel || 'Unscored'}
                    </Badge>
                    <Text fontSize="xs" textTransform="capitalize">Category: {point.category}</Text>
                    <Text fontSize="xs" textTransform="capitalize">Status: {point.status}</Text>
                    {point.clusterSize > 1 && <Text fontSize="xs" color="orange.600">{point.clusterSize} nearby</Text>}
                  </Box>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Report count overlay bottom-right */}
        <Box position="absolute" bottom={4} right={4} zIndex={999}
          bg={cardBg} px={4} py={2} borderRadius="xl" boxShadow="lg" borderWidth="1px" borderColor={borderCol}>
          <Text fontSize="xs" color="gray.500">
            {mapMode === 'markers' ? `${filtered.length} reports` : `${heatmapPoints.length} points`}
          </Text>
        </Box>
      </Box>

      {/* ── Report Detail Modal ───────────────────────────────────────── */}
      {selectedReport && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
          <ModalOverlay backdropFilter="blur(4px)"/>
          <ModalContent bg={cardBg} borderRadius="2xl">
            <ModalHeader>
              <HStack>
                <Text fontSize="xl">{getCatEmoji(selectedReport.category)}</Text>
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg">Report Details</Text>
                  <HStack>
                    <Badge colorScheme={getStatusColor(selectedReport.status)} fontSize="xs" textTransform="capitalize">
                      {selectedReport.status}
                    </Badge>
                    {selectedReport.priorityLevel && (
                      <Badge colorScheme={selectedReport.priorityLevel === 'High' ? 'red' : selectedReport.priorityLevel === 'Medium' ? 'yellow' : 'green'} fontSize="xs">
                        {selectedReport.priorityLevel} · {selectedReport.priorityScore}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton/>
            <ModalBody pb={6}>
              <Tabs colorScheme="teal" variant="soft-rounded" size="sm">
                <TabList flexWrap="wrap" gap={1} mb={4}>
                  <Tab>Details</Tab>
                  {selectedReport.priorityBreakdown && <Tab>Priority</Tab>}
                  {selectedReport.wasteClassification?.wasteType && <Tab>Classification</Tab>}
                  {selectedReport.recommendations?.immediateActions?.length > 0 && <Tab>Actions</Tab>}
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      <Image src={selectedReport.images[0]?.url} h="250px" objectFit="cover" borderRadius="xl"
                        fallbackSrc="https://via.placeholder.com/800x250?text=No+Image"/>
                      {selectedReport.images.length > 1 && (
                        <SimpleGrid columns={4} spacing={2}>
                          {selectedReport.images.slice(1).map((img, i) => (
                            <Image key={i} src={img.url} h="70px" objectFit="cover" borderRadius="lg"
                              cursor="pointer" onClick={() => window.open(img.url,'_blank')} _hover={{ opacity:0.85 }}/>
                          ))}
                        </SimpleGrid>
                      )}
                      <Box p={4} bg={subtleBg} borderRadius="xl" borderLeftWidth="4px" borderColor="teal.400">
                        <Text fontSize="xs" color="teal.500" fontWeight="bold" mb={1}>Description</Text>
                        <Text fontSize="sm">{selectedReport.description}</Text>
                      </Box>
                      <SimpleGrid columns={2} spacing={3}>
                        {[
                          { label:'Category',   value:`${getCatEmoji(selectedReport.category)} ${selectedReport.category}` },
                          { label:'Reported On',value: fmtDate(selectedReport.createdAt) },
                          { label:'Coordinates',value:`${selectedReport.location.coordinates[1].toFixed(4)}, ${selectedReport.location.coordinates[0].toFixed(4)}` },
                          { label:'Cluster',    value:`${selectedReport.clusterSize || 1} nearby report(s)` },
                        ].map(({ label, value }) => (
                          <Box key={label} p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{label}</Text>
                            <Text fontSize="sm" fontWeight="medium" mt={0.5} textTransform="capitalize" noOfLines={2}>{value}</Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                      {selectedReport.location.address && (
                        <Box p={4} bg={subtleBg} borderRadius="xl" borderLeftWidth="4px" borderColor="green.400">
                          <HStack mb={1}><Icon as={FiMapPin} color="green.400"/><Text fontWeight="bold" color="green.400" fontSize="sm">Location</Text></HStack>
                          <Text fontSize="sm">{selectedReport.location.address}</Text>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {selectedReport.priorityBreakdown && (
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        <Flex align="center" gap={4} p={4} bg={subtleBg} borderRadius="2xl">
                          <Box textAlign="center">
                            <Text fontSize="4xl" fontWeight="extrabold" lineHeight="1"
                              color={selectedReport.priorityLevel === 'High' ? 'red.500' : selectedReport.priorityLevel === 'Medium' ? 'yellow.500' : 'green.500'}>
                              {selectedReport.priorityScore}
                            </Text>
                            <Text fontSize="xs" color="gray.400">/ 100</Text>
                          </Box>
                          <Box flex={1}>
                            <Progress value={selectedReport.priorityScore || 0} borderRadius="full" size="lg" mb={2}
                              colorScheme={selectedReport.priorityLevel === 'High' ? 'red' : selectedReport.priorityLevel === 'Medium' ? 'yellow' : 'green'}/>
                          </Box>
                        </Flex>
                        {[
                          { label:'♻️ Resource',  key:'resourceScore',  color:'teal',   weight:'35%' },
                          { label:'📍 Location',  key:'locationScore',  color:'blue',   weight:'25%' },
                          { label:'🌦 Weather',   key:'weatherScore',   color:'cyan',   weight:'20%' },
                          { label:'💬 Sentiment', key:'sentimentScore', color:'purple', weight:'20%' },
                        ].map(({ label, key, color, weight }) => (
                          <Box key={key}>
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="sm">{label} <Text as="span" fontSize="xs" color="gray.400">({weight})</Text></Text>
                              <Text fontSize="sm" fontWeight="bold">{selectedReport.priorityBreakdown[key] ?? 'N/A'}</Text>
                            </Flex>
                            <Progress value={selectedReport.priorityBreakdown[key] || 0} colorScheme={color} borderRadius="full" size="sm"/>
                          </Box>
                        ))}
                      </VStack>
                    </TabPanel>
                  )}

                  {selectedReport.wasteClassification?.wasteType && (
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Box p={4} bg="purple.50" borderRadius="xl" borderLeftWidth="4px" borderColor="purple.400" _dark={{ bg:'purple.900' }}>
                          <Text fontWeight="bold" color="purple.600">{selectedReport.wasteClassification.wasteType}</Text>
                          <Text fontSize="sm" color="gray.500">{selectedReport.wasteClassification.subType}</Text>
                        </Box>
                        <Box p={4} bg={subtleBg} borderRadius="lg"><Text fontSize="xs" color="gray.400" mb={1}>Disposal</Text><Text fontSize="sm">{selectedReport.wasteClassification.disposalMethod}</Text></Box>
                        <Box p={4} bg="orange.50" borderRadius="lg" borderLeftWidth="3px" borderColor="orange.400" _dark={{ bg:'orange.900' }}>
                          <Text fontSize="xs" color="orange.500" mb={1}>⚠️ Environmental Impact</Text>
                          <Text fontSize="sm">{selectedReport.wasteClassification.environmentalImpact}</Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                  )}

                  {selectedReport.recommendations?.immediateActions?.length > 0 && (
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Box p={4} bg={subtleBg} borderRadius="xl">
                          <Text fontWeight="bold" fontSize="sm" mb={3}>Immediate Actions</Text>
                          {selectedReport.recommendations.immediateActions.map((a, i) => (
                            <HStack key={i} align="start" mb={2} spacing={2}>
                              <Box minW="20px" h="20px" bg="teal.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                                <Text fontSize="10px" color="white" fontWeight="bold">{i+1}</Text>
                              </Box>
                              <Text fontSize="sm">{a}</Text>
                            </HStack>
                          ))}
                        </Box>
                        {selectedReport.recommendations.recyclingCenters?.length > 0 && (
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" mb={2}>Nearby Recycling Centers</Text>
                            {selectedReport.recommendations.recyclingCenters.map((c, i) => (
                              <Box key={i} p={3} bg={subtleBg} borderRadius="lg" mb={2} borderLeftWidth="3px" borderColor="teal.400">
                                <Text fontSize="sm" fontWeight="bold">{c.name}</Text>
                                <Text fontSize="xs" color="gray.400">📍 {c.area} · 📞 {c.phone}</Text>
                              </Box>
                            ))}
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
    </Flex>
  );
};

export default MapPage;