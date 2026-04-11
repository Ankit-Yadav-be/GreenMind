import React, { useEffect, useState } from 'react';
import {
  Box, Container, Heading, Text, SimpleGrid, Image,
  Badge, HStack, Icon, Spinner, Alert, AlertIcon,
  VStack, Stack, useColorModeValue, Select, Flex,
  Button, Input,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import PriorityBadge from '../components/shared/PriorityBadge';

const MotionBox = motion(Box);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const STATUS_COLOR = { pending: 'yellow', 'in-progress': 'blue', resolved: 'green', rejected: 'red' };

const WasteList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const pageBg = useColorModeValue('gray.50', 'gray.900');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const params = ['sortBy=priorityScore&order=desc&limit=50'];
      if (filterCategory) params.push(`category=${filterCategory}`);
      if (filterStatus) params.push(`status=${filterStatus}`);
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

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Box bg={pageBg} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <Heading mb={2} color="green.600" textAlign="center" fontSize={{ base: '2xl', md: '4xl' }}>
          All Waste Reports
        </Heading>
        <Text color="gray.500" textAlign="center" mb={8}>
          Sorted by priority score — highest urgency first
        </Text>

        {/* Filters */}
        <Flex gap={3} mb={8} flexWrap="wrap" justify="center">
          <Select placeholder="All Categories" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} maxW="180px" size="sm" bg={cardBg}>
            <option value="plastic">🧴 Plastic</option>
            <option value="organic">🍃 Organic</option>
            <option value="electronic">🔌 Electronic</option>
            <option value="other">🧩 Other</option>
          </Select>
          <Select placeholder="All Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} maxW="160px" size="sm" bg={cardBg}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </Select>
          <Select placeholder="All Priorities" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} maxW="160px" size="sm" bg={cardBg}>
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </Select>
          {(filterCategory || filterStatus || filterPriority) && (
            <Button size="sm" variant="outline" onClick={() => { setFilterCategory(''); setFilterStatus(''); setFilterPriority(''); }}>
              Clear
            </Button>
          )}
        </Flex>

        {error && <Alert status="error" mb={6} rounded="lg"><AlertIcon />{error}</Alert>}

        {loading ? (
          <VStack py={20}><Spinner size="xl" color="green.500" thickness="4px" /><Text color="gray.500">Loading reports…</Text></VStack>
        ) : reports.length === 0 ? (
          <VStack py={20}><Text fontSize="xl" color="gray.500">No reports found.</Text></VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {reports.map((report, i) => (
              <MotionBox key={report._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                <Box bg={cardBg} borderRadius="2xl" overflow="hidden" boxShadow="md" _hover={{ transform: 'translateY(-6px) scale(1.02)', boxShadow: '2xl', cursor: 'pointer' }} transition="all 0.3s ease">
                  <Image src={report.images[0]?.url} alt={report.description} w="100%" h="200px" objectFit="cover" fallbackSrc="https://via.placeholder.com/400x200?text=No+Image" />
                  <Box p={5}>
                    {/* Badges row */}
                    <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
                      <Badge colorScheme={STATUS_COLOR[report.status] || 'gray'} fontSize="xs" px={2} py={1} rounded="full" textTransform="capitalize">
                        {report.status}
                      </Badge>
                      <PriorityBadge priorityLevel={report.priorityLevel} priorityScore={report.priorityScore} size="sm" />
                    </HStack>

                    <Text fontSize="sm" color="gray.600" noOfLines={2} mb={3}>{report.description}</Text>

                    <Stack spacing={1}>
                      <HStack fontSize="xs" color="gray.500">
                        <Icon as={FaMapMarkerAlt} />
                        <Text noOfLines={1}>{report.location?.address || 'Location unavailable'}</Text>
                      </HStack>
                      <HStack fontSize="xs" color="gray.500">
                        <Icon as={FaClock} />
                        <Text>{formatDate(report.createdAt)}</Text>
                      </HStack>
                    </Stack>
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default WasteList;