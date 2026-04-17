import React, { useEffect, useState } from 'react';
import {
  Box, Container, Heading, Text, VStack, SimpleGrid,
  Image, Badge, HStack, Icon, Spinner, Alert, AlertIcon,
  Button, Stack, useColorModeValue, Flex, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure, Tabs,
  TabList, Tab, TabPanels, TabPanel, Progress, Divider,
  useToast,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { FiRefreshCw, FiEye, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ReportProgressTracker from '../components/ReportProgressTracker';

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const STATUS_CONFIG  = { pending: { color: 'yellow', label: 'Pending' }, 'in-progress': { color: 'blue', label: 'In Progress' }, resolved: { color: 'green', label: 'Resolved' }, rejected: { color: 'red', label: 'Rejected' } };
const PRIORITY_COLOR = { High: 'red', Medium: 'yellow', Low: 'green' };
const PRIORITY_EMOJI = { High: '🔴', Medium: '🟡', Low: '🟢' };

const MyReports = () => {
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selectedReport, setSelected] = useState(null);
  const [recalcing, setRecalcing]     = useState(null);
  const { isOpen, onOpen, onClose }   = useDisclosure();
  const toast = useToast();

  const pageBg    = useColorModeValue('gray.50', 'gray.900');
  const cardBg    = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.100', 'gray.700');
  const subtleBg  = useColorModeValue('gray.50', 'gray.700');

  const fetchMyReports = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/reports/my`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setReports(data.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyReports(); }, []);

  const handleView = (report) => { setSelected(report); onOpen(); };

  // Manually trigger AI analysis for old reports showing N/A
  const handleRecalculate = async (reportId, e) => {
    e.stopPropagation();
    setRecalcing(reportId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/reports/${reportId}/recalculate`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.status === 'success') {
        setReports(prev => prev.map(r => r._id === reportId ? data.data : r));
        if (selectedReport?._id === reportId) setSelected(data.data);
        toast({ title: 'Analysis complete!', description: `Priority: ${data.data.priorityLevel} (${data.data.priorityScore})`, status: 'success', duration: 4000, position: 'top-right' });
      }
    } catch {
      toast({ title: 'Recalculation failed', status: 'error', duration: 3000, position: 'top-right' });
    } finally { setRecalcing(null); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Summary counts
  const summary = { total: reports.length, high: reports.filter(r => r.priorityLevel === 'High').length, pending: reports.filter(r => r.status === 'pending').length, resolved: reports.filter(r => r.status === 'resolved').length };

  if (loading) return <Box minH="100vh" bg={pageBg} display="flex" alignItems="center" justifyContent="center"><VStack><Spinner size="xl" color="green.500" /><Text color="gray.400">Loading your reports…</Text></VStack></Box>;

  return (
    <Box minH="100vh" bg={pageBg}>
      {/* Banner */}
      <Box bgGradient="linear(135deg, green.600, teal.500)" py={10} px={6}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="start" flexWrap="wrap" gap={4}>
            <Box>
              <Text fontSize="2xl" fontWeight="extrabold" color="white">My Reports</Text>
              <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                Click any report to see AI classification, priority breakdown and recommendations
              </Text>
            </Box>
            <Button leftIcon={<FiRefreshCw />} onClick={fetchMyReports} size="sm" bg="whiteAlpha.200" color="white" _hover={{ bg: 'whiteAlpha.300' }} borderRadius="xl">
              Refresh
            </Button>
          </Flex>

          {/* Mini stats */}
          <HStack mt={5} spacing={4} flexWrap="wrap">
            {[
              { label: 'Total',    value: summary.total,    color: 'whiteAlpha.300' },
              { label: '🔴 High',  value: summary.high,     color: 'red.400'        },
              { label: '⏳ Pending',value: summary.pending,  color: 'yellow.400'     },
              { label: '✅ Resolved',value: summary.resolved, color: 'green.300'     },
            ].map(({ label, value }) => (
              <Box key={label} bg="whiteAlpha.200" px={4} py={2} borderRadius="xl">
                <Text fontSize="xs" color="whiteAlpha.700">{label}</Text>
                <Text fontSize="xl" fontWeight="extrabold" color="white">{value}</Text>
              </Box>
            ))}
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        {error && <Alert status="error" mb={6} rounded="xl"><AlertIcon />{error}</Alert>}

        {reports.length === 0 && !error ? (
          <Box textAlign="center" py={20}>
            <Text fontSize="4xl" mb={4}>🌿</Text>
            <Text fontSize="xl" fontWeight="bold" color="gray.500">No reports yet</Text>
            <Text color="gray.400" mt={2}>Submit your first report to earn 10 points!</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {reports.map((report, i) => (
              <MotionBox
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.06, 0.4) }}
              >
                <Box
                  bg={cardBg} borderRadius="2xl" overflow="hidden"
                  boxShadow="md" cursor="pointer"
                  borderWidth="1px" borderColor={borderCol}
                  borderTopWidth="3px"
                  borderTopColor={report.priorityLevel ? `${PRIORITY_COLOR[report.priorityLevel]}.400` : 'gray.200'}
                  _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
                  transition="all 0.25s ease"
                  onClick={() => handleView(report)}
                >
                  <Box position="relative">
                    <Image
                      src={report.images[0]?.url}
                      alt="Report" w="100%" h="170px" objectFit="cover"
                      fallbackSrc="https://via.placeholder.com/400x170?text=No+Image"
                    />
                    {report.wasteClassification?.wasteType && (
                      <Badge position="absolute" top={2} left={2} colorScheme="purple" fontSize="9px">{report.wasteClassification.wasteType}</Badge>
                    )}
                    {(report.wasteClassification?.hazardLevel === 'High' || report.wasteClassification?.hazardLevel === 'Critical') && (
                      <Badge position="absolute" top={2} right={2} colorScheme="red" fontSize="9px">⚠️ {report.wasteClassification.hazardLevel}</Badge>
                    )}
                  </Box>

                  <Box p={4}>
                    <HStack justify="space-between" mb={3} flexWrap="wrap" gap={1}>
                      <Badge colorScheme={STATUS_CONFIG[report.status]?.color || 'gray'} fontSize="10px" px={2} py={0.5} borderRadius="full" textTransform="capitalize">
                        {STATUS_CONFIG[report.status]?.label || report.status}
                      </Badge>
                      {report.priorityLevel ? (
                        <Badge colorScheme={PRIORITY_COLOR[report.priorityLevel]} fontSize="10px" px={2} py={0.5} borderRadius="full">
                          {PRIORITY_EMOJI[report.priorityLevel]} {report.priorityLevel} · {report.priorityScore}
                        </Badge>
                      ) : (
                        <Tooltip label="Click to trigger AI analysis for this report">
                          <Button
                            size="xs" leftIcon={<FiZap />} colorScheme="orange" variant="outline"
                            borderRadius="full" fontSize="10px"
                            isLoading={recalcing === report._id}
                            loadingText="Analyzing…"
                            onClick={(e) => handleRecalculate(report._id, e)}
                          >
                            Analyze Now
                          </Button>
                        </Tooltip>
                      )}
                    </HStack>

                    {report.progressPercentage !== undefined && (
  <Box mb={3}>
    <Flex justify="space-between" mb={1}>
      <Text fontSize="xs" color="gray.500">Progress</Text>
      <Text fontSize="xs" fontWeight="bold">{report.progressPercentage}%</Text>
    </Flex>
    <Progress value={report.progressPercentage || 0} size="sm" borderRadius="full" colorScheme={report.progressPercentage === 100 ? 'green' : 'blue'} />
  </Box>
)}

                    <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.200')} noOfLines={2} mb={3} lineHeight="1.5">
                      {report.description}
                    </Text>
                    <Divider mb={3} />
                    <Stack spacing={1.5}>
                      <HStack fontSize="xs" color="gray.400" spacing={1.5}>
                        <Icon as={FaMapMarkerAlt} flexShrink={0} />
                        <Text noOfLines={1}>{report.location?.address || `${report.location?.coordinates[1]?.toFixed(4)}, ${report.location?.coordinates[0]?.toFixed(4)}`}</Text>
                      </HStack>
                      <HStack fontSize="xs" color="gray.400" spacing={1.5}>
                        <Icon as={FaClock} flexShrink={0} />
                        <Text>{formatDate(report.createdAt)}</Text>
                      </HStack>
                    </Stack>
                    <Button size="xs" leftIcon={<FiEye />} colorScheme="green" variant="ghost" mt={3} w="full" borderRadius="lg">
                      View Full Analysis
                    </Button>
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* Analysis Modal */}
      {selectedReport && (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent bg={cardBg} borderRadius="2xl">
            <ModalHeader>
              <HStack>
                <Text>Report Analysis</Text>
                {selectedReport.priorityLevel ? (
                  <Badge colorScheme={PRIORITY_COLOR[selectedReport.priorityLevel]} borderRadius="full" px={2}>
                    {PRIORITY_EMOJI[selectedReport.priorityLevel]} {selectedReport.priorityLevel} · {selectedReport.priorityScore}
                  </Badge>
                ) : (
                  <Button size="xs" leftIcon={<FiZap />} colorScheme="orange" isLoading={recalcing === selectedReport._id} onClick={(e) => handleRecalculate(selectedReport._id, e)}>
                    Analyze Now
                  </Button>
                )}
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Tabs colorScheme="green" variant="soft-rounded" size="sm">
            <TabList flexWrap="wrap" gap={1} mb={4}>
  <Tab>Progress</Tab>
  <Tab>Details</Tab>
  <Tab>Priority Score</Tab>
  {selectedReport.wasteClassification?.wasteType && <Tab>AI Classification</Tab>}
  {selectedReport.recommendations?.immediateActions?.length > 0 && <Tab>Recommendations</Tab>}
</TabList>
                <TabPanels>
                    <TabPanel px={0}>
    <ReportProgressTracker report={selectedReport} />
  </TabPanel>
                  <TabPanel px={0}>
                    <VStack spacing={4} align="stretch">
                      <Image src={selectedReport.images[0]?.url} h="220px" objectFit="cover" borderRadius="xl" fallbackSrc="https://via.placeholder.com/600x220?text=No+Image" />
                      <Box p={4} bg={subtleBg} borderRadius="xl"><Text fontSize="xs" color="gray.500" mb={1}>Description</Text><Text fontSize="sm">{selectedReport.description}</Text></Box>
                      <SimpleGrid columns={2} spacing={3}>
                        {[
                          { label: 'Category', value: selectedReport.category },
                          { label: 'Status',   value: selectedReport.status   },
                          { label: 'Submitted',value: formatDate(selectedReport.createdAt) },
                          { label: 'Location', value: selectedReport.location?.address || 'Unknown' },
                        ].map(({ label, value }) => (
                          <Box key={label} p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">{label}</Text>
                            <Text fontSize="sm" fontWeight="medium" mt={0.5} textTransform="capitalize" noOfLines={2}>{value}</Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                      {selectedReport.escalated && (
                        <Box p={3} bg="red.50" borderRadius="lg" borderLeftWidth="3px" borderColor="red.400" _dark={{ bg: 'red.900' }}>
                          <Text fontSize="xs" color="red.600" fontWeight="bold">⚠️ Escalated — {selectedReport.escalationReason}</Text>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  <TabPanel px={0}>
                    {selectedReport.priorityBreakdown ? (
                      <VStack spacing={4} align="stretch">
                        <Flex align="center" gap={4} p={4} bg={subtleBg} borderRadius="2xl">
                          <Box textAlign="center">
                            <Text fontSize="5xl" fontWeight="extrabold" color={`${PRIORITY_COLOR[selectedReport.priorityLevel]}.500`} lineHeight="1">{selectedReport.priorityScore}</Text>
                            <Text fontSize="xs" color="gray.400">/ 100</Text>
                          </Box>
                          <Box flex={1}>
                            <Progress value={selectedReport.priorityScore || 0} colorScheme={PRIORITY_COLOR[selectedReport.priorityLevel] || 'gray'} borderRadius="full" size="lg" mb={2} />
                            <Badge colorScheme={PRIORITY_COLOR[selectedReport.priorityLevel]} borderRadius="full" px={3} py={1}>{selectedReport.priorityLevel} Priority</Badge>
                          </Box>
                        </Flex>
                        <Divider />
                        {[
                          { label: '♻️ Resource',  key: 'resourceScore',  color: 'teal',   weight: '35%' },
                          { label: '📍 Location',  key: 'locationScore',  color: 'blue',   weight: '25%' },
                          { label: '🌦 Weather',   key: 'weatherScore',   color: 'cyan',   weight: '20%' },
                          { label: '💬 Sentiment', key: 'sentimentScore', color: 'purple', weight: '20%' },
                        ].map(({ label, key, color, weight }) => (
                          <Box key={key}>
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="sm">{label} <Text as="span" fontSize="xs" color="gray.400">({weight})</Text></Text>
                              <Text fontSize="sm" fontWeight="bold">{selectedReport.priorityBreakdown[key] ?? 'N/A'}</Text>
                            </Flex>
                            <Progress value={selectedReport.priorityBreakdown[key] || 0} colorScheme={color} borderRadius="full" size="sm" />
                          </Box>
                        ))}
                        {selectedReport.priorityBreakdown.weatherDetails?.condition && (
                          <Box p={3} bg={subtleBg} borderRadius="lg">
                            <Text fontSize="xs" color="gray.400" mb={1}>Weather at Report Time</Text>
                            <Text fontSize="sm">{selectedReport.priorityBreakdown.weatherDetails.condition} — {selectedReport.priorityBreakdown.weatherDetails.temp}°C</Text>
                          </Box>
                        )}
                        <Box p={3} bg={subtleBg} borderRadius="lg">
                          <Text fontSize="xs" color="gray.400" mb={1}>Sentiment</Text>
                          <Badge colorScheme={selectedReport.priorityBreakdown.sentimentLabel === 'critical' ? 'red' : selectedReport.priorityBreakdown.sentimentLabel === 'high' ? 'orange' : 'green'}>
                            {selectedReport.priorityBreakdown.sentimentLabel || 'N/A'}
                          </Badge>
                        </Box>
                      </VStack>
                    ) : (
                      <Flex py={8} direction="column" align="center" gap={3}>
                        <Text fontSize="3xl">🤖</Text>
                        <Text color="gray.500" fontSize="sm" textAlign="center">AI analysis not yet run for this report.</Text>
                        <Button leftIcon={<FiZap />} colorScheme="orange" size="sm" isLoading={recalcing === selectedReport._id} onClick={(e) => handleRecalculate(selectedReport._id, e)}>
                          Run Analysis Now
                        </Button>
                      </Flex>
                    )}
                  </TabPanel>

                  {selectedReport.wasteClassification?.wasteType && (
                    <TabPanel px={0}>
                      <VStack spacing={3} align="stretch">
                        <Box p={4} bg="purple.50" borderRadius="xl" borderLeftWidth="4px" borderColor="purple.400" _dark={{ bg: 'purple.900' }}>
                          <Text fontWeight="bold" color="purple.600" fontSize="lg">{selectedReport.wasteClassification.wasteType} Waste</Text>
                          <Text fontSize="sm" color="gray.500">{selectedReport.wasteClassification.subType}</Text>
                        </Box>
                        <SimpleGrid columns={2} spacing={3}>
                          {[
                            { label: 'Hazard Level', value: selectedReport.wasteClassification.hazardLevel, badgeColor: selectedReport.wasteClassification.hazardLevel === 'High' ? 'red' : 'yellow' },
                            { label: 'Recyclable',   value: selectedReport.wasteClassification.recyclingPossibility, badgeColor: 'green' },
                            { label: 'Action',       value: selectedReport.wasteClassification.actionRequired, badgeColor: 'blue' },
                            { label: 'Decomposition',value: selectedReport.wasteClassification.estimatedDecompositionDays === -1 ? 'Non-biodeg.' : `~${selectedReport.wasteClassification.estimatedDecompositionDays}d`, badgeColor: 'gray' },
                          ].map(({ label, value, badgeColor }) => (
                            <Box key={label} p={3} bg={subtleBg} borderRadius="lg">
                              <Text fontSize="10px" color="gray.400">{label}</Text>
                              <Badge colorScheme={badgeColor} mt={1} fontSize="xs">{value || 'N/A'}</Badge>
                            </Box>
                          ))}
                        </SimpleGrid>
                        <Box p={4} bg={subtleBg} borderRadius="lg"><Text fontSize="xs" color="gray.400" mb={1}>Disposal Method</Text><Text fontSize="sm">{selectedReport.wasteClassification.disposalMethod}</Text></Box>
                        <Box p={4} bg={subtleBg} borderRadius="lg"><Text fontSize="xs" color="gray.400" mb={1}>Recycling Instructions</Text><Text fontSize="sm">{selectedReport.wasteClassification.recyclingInstructions}</Text></Box>
                        <Box p={4} bg="orange.50" borderRadius="lg" borderLeftWidth="3px" borderColor="orange.400" _dark={{ bg: 'orange.900' }}>
                          <Text fontSize="xs" color="orange.500" fontWeight="bold" mb={1}>⚠️ Environmental Impact</Text>
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
                        <SimpleGrid columns={2} spacing={3}>
                          <Box p={3} bg={subtleBg} borderRadius="lg"><Text fontSize="10px" color="gray.400">Authority</Text><Text fontSize="sm" fontWeight="bold">{selectedReport.recommendations.authorityToContact}</Text></Box>
                          <Box p={3} bg={subtleBg} borderRadius="lg"><Text fontSize="10px" color="gray.400">Est. Resolution</Text><Text fontSize="sm" fontWeight="bold">{selectedReport.recommendations.estimatedResolutionTime}</Text></Box>
                        </SimpleGrid>
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
                        {selectedReport.recommendations.preventionTips?.length > 0 && (
                          <Box p={4} bg="blue.50" borderRadius="lg" _dark={{ bg: 'blue.900' }}>
                            <Text fontWeight="bold" fontSize="sm" mb={2} color="blue.600">Prevention Tips</Text>
                            {selectedReport.recommendations.preventionTips.map((tip, i) => <Text key={i} fontSize="sm">• {tip}</Text>)}
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