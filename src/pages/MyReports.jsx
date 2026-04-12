import React, { useEffect, useState } from 'react';
import {
  Box, Container, Heading, Text, VStack, SimpleGrid,
  Image, Badge, HStack, Icon, Spinner, Alert, AlertIcon,
  Button, Stack, useColorModeValue, Flex, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure, Tabs,
  TabList, Tab, TabPanels, TabPanel, Progress, Divider,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock, FaImage } from 'react-icons/fa';
import { FiRefreshCw, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const STATUS_CONFIG = {
  pending:       { color: 'yellow', label: 'Pending' },
  'in-progress': { color: 'blue',   label: 'In Progress' },
  resolved:      { color: 'green',  label: 'Resolved' },
  rejected:      { color: 'red',    label: 'Rejected' },
};

const PRIORITY_COLOR = { High: 'red', Medium: 'yellow', Low: 'green' };

const PriorityBadge = ({ priorityLevel, priorityScore }) => {
  const emoji = { High: '🔴', Medium: '🟡', Low: '🟢' }[priorityLevel] || '⚪';
  if (!priorityLevel) return <Badge colorScheme="gray" fontSize="xs">Analyzing…</Badge>;
  return (
    <Tooltip label={`Score: ${priorityScore ?? 'N/A'}/100`} hasArrow>
      <Badge colorScheme={PRIORITY_COLOR[priorityLevel]} fontSize="xs" px={2} py={1} rounded="full">
        {emoji} {priorityLevel} ({priorityScore ?? '?'})
      </Badge>
    </Tooltip>
  );
};

const MyReports = () => {
  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [selectedReport, setSelected]   = useState(null);
  const { isOpen, onOpen, onClose }     = useDisclosure();

  const cardBg   = useColorModeValue('white', 'gray.800');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const pageBg   = useColorModeValue('gray.50', 'gray.900');

  const fetchMyReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/reports/my`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setReports(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyReports(); }, []);

  const handleView = (report) => { setSelected(report); onOpen(); };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  if (loading) {
    return (
      <Container maxW="container.xl" py={20} textAlign="center">
        <Spinner size="xl" color="green.500" thickness="4px" />
        <Text mt={4} color="gray.500">Loading your reports…</Text>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} py={10}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading color="green.600" fontSize={{ base: '2xl', md: '3xl' }}>My Reports</Heading>
            <Text color="gray.500" mt={1}>Click any report to see AI analysis, classification and recommendations</Text>
          </Box>
          <Button leftIcon={<FiRefreshCw />} onClick={fetchMyReports} colorScheme="green" variant="outline" size="sm">
            Refresh
          </Button>
        </Flex>

        {error && <Alert status="error" mb={6} rounded="lg"><AlertIcon />{error}</Alert>}

        {reports.length === 0 && !error ? (
          <Box textAlign="center" py={20}>
            <Icon as={FaImage} boxSize={16} color="gray.300" mb={4} />
            <Text fontSize="xl" color="gray.500">No reports yet.</Text>
            <Text color="gray.400" mt={2}>Submit your first waste report to earn 10 points!</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {reports.map((report, i) => (
              <MotionBox
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
              >
                <Box
                  bg={cardBg} borderRadius="2xl" overflow="hidden"
                  boxShadow="md" cursor="pointer"
                  _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
                  transition="all 0.3s ease"
                  onClick={() => handleView(report)}
                >
                  <Box position="relative">
                    <Image
                      src={report.images[0]?.url}
                      alt="Report"
                      w="100%" h="180px" objectFit="cover"
                      fallbackSrc="https://via.placeholder.com/400x180?text=No+Image"
                    />
                    {/* AI Classification badge on image */}
                    {report.wasteClassification?.wasteType && (
                      <Badge
                        position="absolute" top={2} left={2}
                        colorScheme="purple" fontSize="xs" px={2} py={1}
                      >
                        {report.wasteClassification.wasteType}
                      </Badge>
                    )}
                    {/* Hazard badge */}
                    {report.wasteClassification?.hazardLevel === 'High' || report.wasteClassification?.hazardLevel === 'Critical' ? (
                      <Badge
                        position="absolute" top={2} right={2}
                        colorScheme="red" fontSize="xs" px={2} py={1}
                      >
                        ⚠️ {report.wasteClassification.hazardLevel}
                      </Badge>
                    ) : null}
                  </Box>

                  <Box p={5}>
                    <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
                      <Badge
                        colorScheme={STATUS_CONFIG[report.status]?.color || 'gray'}
                        fontSize="xs" px={2} py={1} rounded="full" textTransform="capitalize"
                      >
                        {STATUS_CONFIG[report.status]?.label || report.status}
                      </Badge>
                      <PriorityBadge priorityLevel={report.priorityLevel} priorityScore={report.priorityScore} />
                    </HStack>

                    <Text fontSize="sm" color="gray.600" noOfLines={2} mb={3}>
                      {report.description}
                    </Text>

                    <Divider mb={3} />

                    <Stack spacing={1}>
                      <HStack fontSize="xs" color="gray.500">
                        <Icon as={FaMapMarkerAlt} />
                        <Text noOfLines={1}>
                          {report.location?.address || `${report.location?.coordinates[1]?.toFixed(4)}, ${report.location?.coordinates[0]?.toFixed(4)}`}
                        </Text>
                      </HStack>
                      <HStack fontSize="xs" color="gray.500">
                        <Icon as={FaClock} />
                        <Text>{formatDate(report.createdAt)}</Text>
                      </HStack>
                    </Stack>

                    <Button
                      size="xs" leftIcon={<FiEye />} colorScheme="green"
                      variant="ghost" mt={3} w="full"
                    >
                      View Full Analysis
                    </Button>
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* ── Full Analysis Modal ── */}
      {selectedReport && (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent bg={cardBg}>
            <ModalHeader>
              <HStack>
                <Text>Report Analysis</Text>
                <PriorityBadge priorityLevel={selectedReport.priorityLevel} priorityScore={selectedReport.priorityScore} />
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Tabs colorScheme="green" variant="enclosed">
                <TabList flexWrap="wrap">
                  <Tab fontSize="sm">Details</Tab>
                  <Tab fontSize="sm">Priority Score</Tab>
                  {selectedReport.wasteClassification?.wasteType && <Tab fontSize="sm">AI Classification</Tab>}
                  {selectedReport.recommendations?.immediateActions?.length > 0 && <Tab fontSize="sm">Recommendations</Tab>}
                </TabList>

                <TabPanels>
                  {/* ── Tab 1: Basic Details ── */}
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      <Image
                        src={selectedReport.images[0]?.url}
                        alt="Report" w="100%" h="220px" objectFit="cover"
                        borderRadius="lg"
                        fallbackSrc="https://via.placeholder.com/600x220?text=No+Image"
                      />
                      <Box p={4} bg={subtleBg} rounded="lg">
                        <Text fontSize="xs" color="gray.500" mb={1}>Description</Text>
                        <Text fontSize="sm">{selectedReport.description}</Text>
                      </Box>
                      <SimpleGrid columns={2} spacing={3}>
                        <Box p={3} bg={subtleBg} rounded="lg">
                          <Text fontSize="xs" color="gray.500" mb={1}>Category</Text>
                          <Text fontSize="sm" fontWeight="bold" textTransform="capitalize">{selectedReport.category}</Text>
                        </Box>
                        <Box p={3} bg={subtleBg} rounded="lg">
                          <Text fontSize="xs" color="gray.500" mb={1}>Status</Text>
                          <Badge colorScheme={STATUS_CONFIG[selectedReport.status]?.color} textTransform="capitalize">
                            {selectedReport.status}
                          </Badge>
                        </Box>
                        <Box p={3} bg={subtleBg} rounded="lg">
                          <Text fontSize="xs" color="gray.500" mb={1}>Submitted</Text>
                          <Text fontSize="sm">{formatDate(selectedReport.createdAt)}</Text>
                        </Box>
                        <Box p={3} bg={subtleBg} rounded="lg">
                          <Text fontSize="xs" color="gray.500" mb={1}>Location</Text>
                          <Text fontSize="xs" noOfLines={2}>{selectedReport.location?.address || 'Unknown'}</Text>
                        </Box>
                      </SimpleGrid>
                      {selectedReport.escalated && (
                        <Box p={3} bg="red.50" rounded="lg" borderLeftWidth="3px" borderColor="red.400">
                          <Text fontSize="xs" color="red.600" fontWeight="bold">⚠️ Escalated</Text>
                          <Text fontSize="xs" color="red.500">{selectedReport.escalationReason}</Text>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* ── Tab 2: Priority Score Breakdown ── */}
                  <TabPanel px={0}>
                    {selectedReport.priorityBreakdown ? (
                      <VStack spacing={4} align="stretch">
                        <Box textAlign="center" p={4} bg={subtleBg} rounded="xl">
                          <Text fontSize="4xl" fontWeight="bold" color={`${PRIORITY_COLOR[selectedReport.priorityLevel]}.500`}>
                            {selectedReport.priorityScore}
                          </Text>
                          <Text fontSize="sm" color="gray.500">out of 100</Text>
                          <Badge colorScheme={PRIORITY_COLOR[selectedReport.priorityLevel]} mt={2} px={3} py={1} rounded="full" fontSize="sm">
                            {selectedReport.priorityLevel} Priority
                          </Badge>
                        </Box>

                        <Progress
                          value={selectedReport.priorityScore || 0}
                          colorScheme={PRIORITY_COLOR[selectedReport.priorityLevel] || 'gray'}
                          rounded="full" size="lg"
                        />

                        <Divider />

                        {[
                          { label: '♻️ Resource Score', key: 'resourceScore',  weight: '35%', color: 'teal'   },
                          { label: '📍 Location Score', key: 'locationScore',  weight: '25%', color: 'blue'   },
                          { label: '🌦 Weather Score',  key: 'weatherScore',   weight: '20%', color: 'cyan'   },
                          { label: '💬 Sentiment Score',key: 'sentimentScore', weight: '20%', color: 'purple' },
                        ].map(({ label, key, weight, color }) => (
                          <Box key={key}>
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="sm">{label} <Text as="span" fontSize="xs" color="gray.400">({weight})</Text></Text>
                              <Text fontSize="sm" fontWeight="bold">{selectedReport.priorityBreakdown[key] ?? 'N/A'}/100</Text>
                            </Flex>
                            <Progress value={selectedReport.priorityBreakdown[key] || 0} colorScheme={color} rounded="full" size="sm" />
                          </Box>
                        ))}

                        {selectedReport.priorityBreakdown.materials?.length > 0 && (
                          <Box p={3} bg={subtleBg} rounded="lg">
                            <Text fontSize="xs" color="gray.500" mb={2}>Detected Materials</Text>
                            <HStack flexWrap="wrap" gap={2}>
                              {selectedReport.priorityBreakdown.materials.map((m, i) => (
                                <Badge key={i} colorScheme="teal" fontSize="xs">{m}</Badge>
                              ))}
                            </HStack>
                          </Box>
                        )}

                        {selectedReport.priorityBreakdown.weatherDetails?.condition && (
                          <Box p={3} bg={subtleBg} rounded="lg">
                            <Text fontSize="xs" color="gray.500" mb={1}>Weather at Time of Report</Text>
                            <Text fontSize="sm">
                              {selectedReport.priorityBreakdown.weatherDetails.condition} —
                              {selectedReport.priorityBreakdown.weatherDetails.temp !== null
                                ? ` ${selectedReport.priorityBreakdown.weatherDetails.temp}°C`
                                : ' Temperature unavailable'}
                            </Text>
                          </Box>
                        )}

                        <Box p={3} bg={subtleBg} rounded="lg">
                          <Text fontSize="xs" color="gray.500" mb={1}>Sentiment Analysis</Text>
                          <Badge colorScheme={
                            selectedReport.priorityBreakdown.sentimentLabel === 'critical' ? 'red' :
                            selectedReport.priorityBreakdown.sentimentLabel === 'high' ? 'orange' :
                            selectedReport.priorityBreakdown.sentimentLabel === 'moderate' ? 'yellow' : 'green'
                          }>
                            {selectedReport.priorityBreakdown.sentimentLabel || 'N/A'}
                          </Badge>
                        </Box>
                      </VStack>
                    ) : (
                      <Box textAlign="center" py={10}>
                        <Spinner color="green.500" size="lg" />
                        <Text mt={4} color="gray.500">AI priority analysis is being calculated…</Text>
                        <Text fontSize="xs" color="gray.400" mt={1}>Refresh in a few seconds</Text>
                      </Box>
                    )}
                  </TabPanel>

                  {/* ── Tab 3: AI Waste Classification ── */}
                  {selectedReport.wasteClassification?.wasteType && (
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        <Box p={4} bg="purple.50" rounded="xl" borderLeftWidth="4px" borderColor="purple.400" _dark={{ bg: 'purple.900' }}>
                          <Text fontSize="lg" fontWeight="bold" color="purple.600">
                            {selectedReport.wasteClassification.wasteType} Waste
                          </Text>
                          <Text fontSize="sm" color="gray.600">{selectedReport.wasteClassification.subType}</Text>
                        </Box>

                        <SimpleGrid columns={2} spacing={3}>
                          {[
                            { label: 'Hazard Level',    value: selectedReport.wasteClassification.hazardLevel,
                              badgeColor: selectedReport.wasteClassification.hazardLevel === 'High' || selectedReport.wasteClassification.hazardLevel === 'Critical' ? 'red' : 'yellow' },
                            { label: 'Recyclable',      value: selectedReport.wasteClassification.recyclingPossibility,
                              badgeColor: selectedReport.wasteClassification.recyclingPossibility === 'Yes' ? 'green' : 'gray' },
                            { label: 'Action Required', value: selectedReport.wasteClassification.actionRequired,
                              badgeColor: selectedReport.wasteClassification.actionRequired === 'Immediate' ? 'red' : 'blue' },
                            { label: 'Decomposition',   value: selectedReport.wasteClassification.estimatedDecompositionDays === -1
                                ? 'Non-biodegradable'
                                : `~${selectedReport.wasteClassification.estimatedDecompositionDays} days`,
                              badgeColor: 'gray' },
                          ].map(({ label, value, badgeColor }) => (
                            <Box key={label} p={3} bg={subtleBg} rounded="lg">
                              <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
                              <Badge colorScheme={badgeColor} fontSize="xs">{value || 'N/A'}</Badge>
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

                        <Box p={4} bg="orange.50" rounded="lg" borderLeftWidth="3px" borderColor="orange.400" _dark={{ bg: 'orange.900' }}>
                          <Text fontSize="xs" color="orange.600" fontWeight="bold" mb={1}>⚠️ Environmental Impact</Text>
                          <Text fontSize="sm">{selectedReport.wasteClassification.environmentalImpact}</Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                  )}

                  {/* ── Tab 4: Smart Recommendations ── */}
                  {selectedReport.recommendations?.immediateActions?.length > 0 && (
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        <Box p={4} bg={subtleBg} rounded="lg">
                          <Text fontWeight="bold" fontSize="sm" mb={3}>Immediate Actions</Text>
                          <VStack align="start" spacing={2}>
                            {selectedReport.recommendations.immediateActions.map((action, i) => (
                              <HStack key={i} align="start" spacing={2}>
                                <Box minW="20px" h="20px" bg="green.500" borderRadius="full"
                                  display="flex" alignItems="center" justifyContent="center" mt="1px">
                                  <Text fontSize="10px" color="white" fontWeight="bold">{i + 1}</Text>
                                </Box>
                                <Text fontSize="sm">{action}</Text>
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
                            <Text fontSize="xs" color="gray.500" mb={1}>How to Contact</Text>
                            <Text fontSize="sm">{selectedReport.recommendations.contactMethod}</Text>
                          </Box>
                          <Box p={3} bg={subtleBg} rounded="lg">
                            <Text fontSize="xs" color="gray.500" mb={1}>Est. Resolution Time</Text>
                            <Text fontSize="sm" fontWeight="bold">{selectedReport.recommendations.estimatedResolutionTime}</Text>
                          </Box>
                          <Box p={3} bg={subtleBg} rounded="lg">
                            <Text fontSize="xs" color="gray.500" mb={1}>Community Role</Text>
                            <Text fontSize="sm">{selectedReport.recommendations.communityRole}</Text>
                          </Box>
                        </SimpleGrid>

                        {selectedReport.recommendations.recyclingCenters?.length > 0 && (
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" mb={3}>Nearby Recycling Centers</Text>
                            <VStack spacing={2}>
                              {selectedReport.recommendations.recyclingCenters.map((center, i) => (
                                <Box key={i} p={4} bg={subtleBg} rounded="lg" w="full" borderLeftWidth="3px" borderColor="teal.400">
                                  <Text fontSize="sm" fontWeight="bold">{center.name}</Text>
                                  <Text fontSize="xs" color="gray.500">📍 {center.area}</Text>
                                  <Text fontSize="xs" color="teal.500">📞 {center.phone}</Text>
                                  <HStack mt={1} flexWrap="wrap" gap={1}>
                                    {center.accepts?.map(a => (
                                      <Badge key={a} fontSize="10px" colorScheme="teal">{a}</Badge>
                                    ))}
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        )}

                        {selectedReport.recommendations.preventionTips?.length > 0 && (
                          <Box p={4} bg="blue.50" rounded="lg" _dark={{ bg: 'blue.900' }}>
                            <Text fontWeight="bold" fontSize="sm" mb={2} color="blue.600">Prevention Tips</Text>
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

export default MyReports;