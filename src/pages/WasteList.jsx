import React, { useEffect, useState } from 'react';
import {
  Box, Container, Text, SimpleGrid, Image, Badge, HStack,
  Icon, Spinner, Alert, AlertIcon, VStack, Stack,
  useColorModeValue, Select, Flex, Button, Input,
  InputGroup, InputLeftElement, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, Divider, Tabs, TabList, Tab, TabPanels,
  TabPanel, Progress,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { FiSearch, FiFilter, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const STATUS_COLOR   = { pending: 'yellow', 'in-progress': 'blue', resolved: 'green', rejected: 'red' };
const PRIORITY_COLOR = { High: 'red', Medium: 'yellow', Low: 'green' };
const PRIORITY_EMOJI = { High: '🔴', Medium: '🟡', Low: '🟢' };
const CAT_EMOJI      = { plastic: '🧴', organic: '🍃', electronic: '🔌', other: '🧩' };

const WasteList = () => {
  const [reports, setReports]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch]               = useState('');
  const [selectedReport, setSelected]     = useState(null);
  const { isOpen, onOpen, onClose }       = useDisclosure();

  const pageBg    = useColorModeValue('gray.50', 'gray.900');
  const cardBg    = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.100', 'gray.700');
  const subtleBg  = useColorModeValue('gray.50', 'gray.700');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const params = ['sortBy=priorityScore&order=desc&limit=100'];
      if (filterCategory) params.push(`category=${filterCategory}`);
      if (filterStatus)   params.push(`status=${filterStatus}`);
      if (filterPriority) params.push(`priorityLevel=${filterPriority}`);
      const res = await fetch(`${BACKEND_URL}/api/reports?${params.join('&')}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setReports(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [filterCategory, filterStatus, filterPriority]);

  const filtered = reports.filter(r =>
    !search || r.description?.toLowerCase().includes(search.toLowerCase()) || r.location?.address?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const openDetail = (r) => { setSelected(r); onOpen(); };

  const hasFilters = filterCategory || filterStatus || filterPriority || search;

  return (
    <Box bg={pageBg} minH="100vh">
      {/* Banner */}
      <Box bgGradient="linear(135deg, teal.600, green.500)" py={10} px={6}>
        <Container maxW="container.xl">
          <Text fontSize="2xl" fontWeight="extrabold" color="white">All Waste Reports</Text>
          <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
            Sorted by AI priority score — highest urgency shown first
          </Text>

          {/* Quick stats strip */}
          <HStack mt={4} spacing={4} flexWrap="wrap">
            {[
              { label: 'Total', value: reports.length,                                              color: 'whiteAlpha.300' },
              { label: '🔴 High',   value: reports.filter(r => r.priorityLevel === 'High').length,   color: 'red.400'        },
              { label: '🟡 Medium', value: reports.filter(r => r.priorityLevel === 'Medium').length, color: 'yellow.400'     },
              { label: '🟢 Low',    value: reports.filter(r => r.priorityLevel === 'Low').length,    color: 'green.400'      },
            ].map(({ label, value, color }) => (
              <Box key={label} bg="whiteAlpha.200" px={4} py={2} borderRadius="xl">
                <Text fontSize="xs" color="whiteAlpha.700">{label}</Text>
                <Text fontSize="xl" fontWeight="extrabold" color="white">{value}</Text>
              </Box>
            ))}
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={6}>
        {/* Filter Bar */}
        <Box bg={cardBg} p={4} borderRadius="2xl" boxShadow="md" mb={6} borderWidth="1px" borderColor={borderCol}>
          <Flex gap={3} flexWrap="wrap" align="center">
            <InputGroup maxW="220px" size="sm">
              <InputLeftElement><Icon as={FiSearch} color="gray.400" /></InputLeftElement>
              <Input
                placeholder="Search reports…" value={search}
                onChange={e => setSearch(e.target.value)}
                borderRadius="lg" bg={subtleBg}
              />
            </InputGroup>
            <Select placeholder="All Categories" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} size="sm" maxW="160px" borderRadius="lg" bg={subtleBg}>
              <option value="plastic">🧴 Plastic</option>
              <option value="organic">🍃 Organic</option>
              <option value="electronic">🔌 Electronic</option>
              <option value="other">🧩 Other</option>
            </Select>
            <Select placeholder="All Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} size="sm" maxW="150px" borderRadius="lg" bg={subtleBg}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </Select>
            <Select placeholder="All Priorities" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} size="sm" maxW="150px" borderRadius="lg" bg={subtleBg}>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </Select>
            {hasFilters && (
              <Button size="sm" variant="ghost" colorScheme="red" onClick={() => { setFilterCategory(''); setFilterStatus(''); setFilterPriority(''); setSearch(''); }} borderRadius="lg">
                Clear all
              </Button>
            )}
            <Text fontSize="xs" color="gray.400" ml="auto">
              {filtered.length} report{filtered.length !== 1 ? 's' : ''}
            </Text>
          </Flex>
        </Box>

        {error && <Alert status="error" mb={4} rounded="xl"><AlertIcon />{error}</Alert>}

        {loading ? (
          <Flex py={20} justify="center" direction="column" align="center" gap={3}>
            <Spinner size="xl" color="green.500" thickness="4px" />
            <Text color="gray.400">Loading reports…</Text>
          </Flex>
        ) : filtered.length === 0 ? (
          <Flex py={20} direction="column" align="center" gap={3}>
            <Text fontSize="3xl">🔍</Text>
            <Text fontSize="lg" color="gray.500">No reports match your filters</Text>
            {hasFilters && <Button size="sm" colorScheme="green" variant="outline" onClick={() => { setFilterCategory(''); setFilterStatus(''); setFilterPriority(''); setSearch(''); }}>Clear Filters</Button>}
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {filtered.map((report, i) => (
              <MotionBox
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
              >
                <Box
                  bg={cardBg} borderRadius="2xl" overflow="hidden"
                  boxShadow="md" cursor="pointer"
                  borderWidth="1px" borderColor={borderCol}
                  borderTopWidth="3px"
                  borderTopColor={report.priorityLevel ? `${PRIORITY_COLOR[report.priorityLevel]}.400` : 'gray.200'}
                  _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
                  transition="all 0.25s ease"
                  onClick={() => openDetail(report)}
                >
                  <Box position="relative">
                    <Image
                      src={report.images[0]?.url}
                      alt={report.description}
                      w="100%" h="190px" objectFit="cover"
                      fallbackSrc="https://via.placeholder.com/400x190?text=No+Image"
                    />
                    {/* Priority overlay */}
                    {report.priorityLevel && (
                      <Box position="absolute" top={0} left={0} right={0} h="3px"
                        bg={`${PRIORITY_COLOR[report.priorityLevel]}.400`}
                      />
                    )}
                    {report.wasteClassification?.wasteType && (
                      <Badge position="absolute" top={2} left={2} colorScheme="purple" fontSize="9px">
                        {report.wasteClassification.wasteType}
                      </Badge>
                    )}
                    <Badge position="absolute" bottom={2} right={2} bg="blackAlpha.700" color="white" fontSize="9px" px={2}>
                      {CAT_EMOJI[report.category]} {report.category}
                    </Badge>
                  </Box>

                  <Box p={4}>
                    <HStack justify="space-between" mb={2} flexWrap="wrap" gap={1}>
                      <Badge colorScheme={STATUS_COLOR[report.status] || 'gray'} fontSize="10px" px={2} py={0.5} borderRadius="full" textTransform="capitalize">
                        {report.status}
                      </Badge>
                      {report.priorityLevel ? (
                        <Badge colorScheme={PRIORITY_COLOR[report.priorityLevel]} fontSize="10px" px={2} py={0.5} borderRadius="full">
                          {PRIORITY_EMOJI[report.priorityLevel]} {report.priorityLevel} · {report.priorityScore}
                        </Badge>
                      ) : (
                        <Badge colorScheme="gray" fontSize="10px">Analyzing…</Badge>
                      )}
                    </HStack>

                    <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.200')} noOfLines={2} mb={3} lineHeight="1.5">
                      {report.description}
                    </Text>

                    <Divider mb={3} />

                    <Stack spacing={1.5}>
                      <HStack fontSize="xs" color="gray.400" spacing={1.5}>
                        <Icon as={FaMapMarkerAlt} flexShrink={0} />
                        <Text noOfLines={1}>{report.location?.address || 'Location unavailable'}</Text>
                      </HStack>
                      <HStack fontSize="xs" color="gray.400" spacing={1.5}>
                        <Icon as={FaClock} flexShrink={0} />
                        <Text>{formatDate(report.createdAt)}</Text>
                      </HStack>
                    </Stack>

                    <Button size="xs" leftIcon={<FiEye />} colorScheme="green" variant="ghost" mt={3} w="full" borderRadius="lg">
                      View Details
                    </Button>
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* Detail Modal */}
      {selectedReport && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent bg={cardBg} borderRadius="2xl">
            <ModalHeader>
              <HStack>
                <Text fontSize="lg">Report Details</Text>
                {selectedReport.priorityLevel && (
                  <Badge colorScheme={PRIORITY_COLOR[selectedReport.priorityLevel]} borderRadius="full" px={2}>
                    {PRIORITY_EMOJI[selectedReport.priorityLevel]} {selectedReport.priorityLevel} · {selectedReport.priorityScore}
                  </Badge>
                )}
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Tabs colorScheme="green" variant="soft-rounded" size="sm">
                <TabList mb={4} flexWrap="wrap" gap={1}>
                  <Tab>Details</Tab>
                  <Tab>Priority</Tab>
                  {selectedReport.wasteClassification?.wasteType && <Tab>AI Classification</Tab>}
                  {selectedReport.recommendations?.immediateActions?.length > 0 && <Tab>Actions</Tab>}
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      <Image src={selectedReport.images[0]?.url} h="220px" objectFit="cover" borderRadius="xl" />
                      <Box p={4} bg={subtleBg} borderRadius="xl">
                        <Text fontSize="xs" color="gray.500" mb={1}>Description</Text>
                        <Text fontSize="sm">{selectedReport.description}</Text>
                      </Box>
                      <SimpleGrid columns={2} spacing={3}>
                        {[
                          { label: 'Category', value: `${CAT_EMOJI[selectedReport.category]} ${selectedReport.category}` },
                          { label: 'Status', value: selectedReport.status },
                          { label: 'Date', value: formatDate(selectedReport.createdAt) },
                          { label: 'Location', value: selectedReport.location?.address || 'Unknown' },
                        ].map(({ label, value }) => (
                          <Box key={label} p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{label}</Text>
                            <Text fontSize="sm" fontWeight="medium" mt={0.5} textTransform="capitalize" noOfLines={2}>{value}</Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  <TabPanel px={0}>
                    {selectedReport.priorityBreakdown ? (
                      <VStack spacing={4} align="stretch">
                        <Box textAlign="center" p={5} bg={subtleBg} borderRadius="2xl">
                          <Text fontSize="5xl" fontWeight="extrabold" color={`${PRIORITY_COLOR[selectedReport.priorityLevel]}.500`} lineHeight="1">
                            {selectedReport.priorityScore}
                          </Text>
                          <Text fontSize="sm" color="gray.400">out of 100</Text>
                          <Badge colorScheme={PRIORITY_COLOR[selectedReport.priorityLevel]} mt={2} px={3} py={1} borderRadius="full">
                            {selectedReport.priorityLevel} Priority
                          </Badge>
                        </Box>
                        <Progress value={selectedReport.priorityScore} colorScheme={PRIORITY_COLOR[selectedReport.priorityLevel] || 'gray'} borderRadius="full" size="lg" />
                        <Divider />
                        {[
                          { label: '♻️ Resource', key: 'resourceScore',  color: 'teal',   weight: '35%' },
                          { label: '📍 Location', key: 'locationScore',  color: 'blue',   weight: '25%' },
                          { label: '🌦 Weather',  key: 'weatherScore',   color: 'cyan',   weight: '20%' },
                          { label: '💬 Sentiment',key: 'sentimentScore', color: 'purple', weight: '20%' },
                        ].map(({ label, key, color, weight }) => (
                          <Box key={key}>
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="sm">{label} <Text as="span" fontSize="xs" color="gray.400">({weight})</Text></Text>
                              <Text fontSize="sm" fontWeight="bold">{selectedReport.priorityBreakdown[key] ?? 'N/A'}</Text>
                            </Flex>
                            <Progress value={selectedReport.priorityBreakdown[key] || 0} colorScheme={color} borderRadius="full" size="sm" />
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Flex py={8} direction="column" align="center" gap={3}>
                        <Spinner color="green.500" />
                        <Text color="gray.400" fontSize="sm">Priority analysis in progress…</Text>
                      </Flex>
                    )}
                  </TabPanel>

                  {selectedReport.wasteClassification?.wasteType && (
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Box p={4} bg="purple.50" borderRadius="xl" borderLeftWidth="4px" borderColor="purple.400" _dark={{ bg: 'purple.900' }}>
                          <Text fontWeight="bold" color="purple.600">{selectedReport.wasteClassification.wasteType}</Text>
                          <Text fontSize="sm" color="gray.500">{selectedReport.wasteClassification.subType}</Text>
                        </Box>
                        <Box p={4} bg={subtleBg} borderRadius="lg">
                          <Text fontSize="xs" color="gray.400" mb={1}>Disposal Method</Text>
                          <Text fontSize="sm">{selectedReport.wasteClassification.disposalMethod}</Text>
                        </Box>
                        <Box p={4} bg="orange.50" borderRadius="lg" borderLeftWidth="3px" borderColor="orange.400" _dark={{ bg: 'orange.900' }}>
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
                              <Box minW="20px" h="20px" bg="green.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                                <Text fontSize="10px" color="white" fontWeight="bold">{i + 1}</Text>
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
    </Box>
  );
};

export default WasteList;