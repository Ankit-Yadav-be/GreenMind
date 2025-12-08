import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Image,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Flex,
  IconButton,
  Tooltip,
  Select,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from '@chakra-ui/react';
import {
  FiEye,
  FiTrash2,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiXCircle,
  FiActivity,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';
const MotionBox = motion(Box);

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('teal.500', 'teal.600');
  const statBg = useColorModeValue('white', 'gray.800');

  // Fetch reports and stats
  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [filterCategory, filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      let url = API_URL;
      const params = [];
      if (filterCategory) params.push(`category=${filterCategory}`);
      if (filterStatus) params.push(`status=${filterStatus}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await axios.get(url);
      setReports(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    onOpen();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingStatus(true);
      await axios.patch(`${API_URL}/${id}/status`, { status: newStatus });

      // Update local state
      setReports(
        reports.map((report) =>
          report._id === id ? { ...report, status: newStatus } : report
        )
      );

      if (selectedReport && selectedReport._id === id) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }

      // Refresh stats
      fetchStats();

      toast({
        title: 'Status Updated',
        description: `Report status changed to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: err.response?.data?.message || 'Failed to update status',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setReports(reports.filter((report) => report._id !== id));
      fetchStats();
      onClose();

      toast({
        title: 'Report Deleted',
        description: 'Report has been permanently deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (err) {
      toast({
        title: 'Delete Failed',
        description: err.response?.data?.message || 'Failed to delete report',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
    }
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

  // Statistics Cards Data
  const statsCards = stats
    ? [
        {
          label: 'Total Reports',
          value: stats.overall.totalReports || 0,
          icon: FiActivity,
          color: 'purple',
          helpText: 'All time reports',
        },
        {
          label: 'Pending',
          value: stats.overall.pendingReports || 0,
          icon: FiClock,
          color: 'yellow',
          helpText: 'Awaiting review',
        },
        {
          label: 'In Progress',
          value: stats.overall.inProgressReports || 0,
          icon: FiAlertCircle,
          color: 'blue',
          helpText: 'Being processed',
        },
        {
          label: 'Resolved',
          value: stats.overall.resolvedReports || 0,
          icon: FiCheckCircle,
          color: 'green',
          helpText: 'Successfully completed',
        },
      ]
    : [];

  if (loading && !stats) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text fontSize="lg" color="gray.500">
            Loading dashboard...
          </Text>
        </VStack>
      </Container>
    );
  }

  if (error && !stats) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="error" rounded="lg" boxShadow="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bg} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Text fontSize="4xl" fontWeight="bold" color="teal.400" mb={2}>
              Admin Dashboard
            </Text>
            <Text fontSize="lg" color="gray.500">
              Monitor and manage all waste reports
            </Text>
          </Box>

          {/* Statistics Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {statsCards.map((stat, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Box
                  bg={statBg}
                  p={6}
                  rounded="xl"
                  boxShadow="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
                  transition="all 0.3s"
                >
                  <Stat>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <StatLabel color="gray.500" fontSize="sm">
                          {stat.label}
                        </StatLabel>
                        <StatNumber fontSize="3xl" fontWeight="bold" color={`${stat.color}.500`}>
                          {stat.value}
                        </StatNumber>
                        <StatHelpText mb={0}>{stat.helpText}</StatHelpText>
                      </Box>
                      <Box
                        bg={`${stat.color}.100`}
                        p={4}
                        rounded="full"
                        color={`${stat.color}.500`}
                      >
                        <Icon as={stat.icon} boxSize={8} />
                      </Box>
                    </Flex>
                  </Stat>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>

          {/* Category Breakdown */}
          {stats && stats.byCategory && stats.byCategory.length > 0 && (
            <Box
              bg={cardBg}
              p={6}
              rounded="xl"
              boxShadow="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                Reports by Category
              </Text>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {stats.byCategory.map((cat, index) => (
                  <Box
                    key={index}
                    p={4}
                    bg={bg}
                    rounded="lg"
                    textAlign="center"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    <Text fontSize="3xl" mb={2}>
                      {getCategoryEmoji(cat._id)}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="teal.400">
                      {cat.count}
                    </Text>
                    <Text fontSize="sm" color="gray.500" textTransform="capitalize">
                      {cat._id}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Filters and Table */}
          <Box
            bg={cardBg}
            rounded="xl"
            boxShadow="xl"
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Box p={6} borderBottomWidth="1px" borderColor={borderColor}>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ base: 'stretch', md: 'center' }}
                gap={4}
              >
                <Text fontSize="xl" fontWeight="bold">
                  All Reports
                </Text>

                <HStack spacing={4}>
                  <Select
                    placeholder="All Categories"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    maxW="200px"
                    size="sm"
                  >
                    <option value="plastic">🧴 Plastic</option>
                    <option value="organic">🍃 Organic</option>
                    <option value="electronic">🔌 Electronic</option>
                    <option value="other">🧩 Other</option>
                  </Select>

                  <Select
                    placeholder="All Status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    maxW="200px"
                    size="sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </Select>

                  <Button
                    onClick={() => {
                      setFilterCategory('');
                      setFilterStatus('');
                    }}
                    size="sm"
                    variant="outline"
                    colorScheme="gray"
                  >
                    Clear
                  </Button>
                </HStack>
              </Flex>
            </Box>

            {loading ? (
              <VStack py={10}>
                <Spinner size="lg" color="teal.500" />
                <Text color="gray.500">Loading reports...</Text>
              </VStack>
            ) : reports.length === 0 ? (
              <Box p={10} textAlign="center">
                <Icon as={FiAlertCircle} boxSize={12} color="gray.400" mb={4} />
                <Text fontSize="lg" color="gray.500">
                  No reports found
                </Text>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th color="white">Image</Th>
                      <Th color="white">Description</Th>
                      <Th color="white">Category</Th>
                      <Th color="white">Location</Th>
                      <Th color="white">Status</Th>
                      <Th color="white">Date</Th>
                      <Th color="white" textAlign="center">
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {reports.map((report) => (
                      <Tr
                        key={report._id}
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                        transition="all 0.2s"
                      >
                        <Td>
                          <Image
                            src={report.images[0]?.url}
                            alt="Report"
                            boxSize="60px"
                            objectFit="cover"
                            rounded="md"
                            fallbackSrc="https://via.placeholder.com/60"
                          />
                        </Td>
                        <Td maxW="250px">
                          <Text noOfLines={2} fontSize="sm">
                            {report.description}
                          </Text>
                        </Td>
                        <Td>
                          <HStack>
                            <Text fontSize="xl">{getCategoryEmoji(report.category)}</Text>
                            <Text textTransform="capitalize" fontSize="sm">
                              {report.category}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Tooltip label={report.location.address || 'No address'}>
                            <HStack spacing={1} cursor="pointer">
                              <FiMapPin />
                              <Text fontSize="sm" noOfLines={1} maxW="150px">
                                {report.location.address || 'View location'}
                              </Text>
                            </HStack>
                          </Tooltip>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(report.status)}
                            fontSize="xs"
                            px={3}
                            py={1}
                            rounded="full"
                            textTransform="capitalize"
                          >
                            {report.status}
                          </Badge>
                        </Td>
                        <Td fontSize="sm">{formatDate(report.createdAt)}</Td>
                        <Td>
                          <HStack spacing={2} justify="center">
                            <Tooltip label="View & Manage">
                              <IconButton
                                icon={<FiEye />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleViewDetails(report)}
                                aria-label="View details"
                              />
                            </Tooltip>
                            <Tooltip label="Delete Report">
                              <IconButton
                                icon={<FiTrash2 />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(report._id)}
                                aria-label="Delete report"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        </VStack>

        {/* Details & Management Modal */}
        {selectedReport && (
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent bg={cardBg}>
              <ModalHeader>
                <HStack>
                  <Text fontSize="xl">{getCategoryEmoji(selectedReport.category)}</Text>
                  <Text>Manage Report</Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Tabs colorScheme="teal" variant="enclosed">
                  <TabList>
                    <Tab>Details</Tab>
                    <Tab>Update Status</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Details Tab */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        {/* Images */}
                        <Box>
                          <Text fontWeight="bold" mb={2}>
                            Images
                          </Text>
                          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                            {selectedReport.images.map((image, index) => (
                              <Image
                                key={index}
                                src={image.url}
                                alt={`Report ${index + 1}`}
                                rounded="md"
                                objectFit="cover"
                                h="150px"
                                w="100%"
                                cursor="pointer"
                                onClick={() => window.open(image.url, '_blank')}
                                _hover={{ transform: 'scale(1.05)' }}
                                transition="all 0.2s"
                              />
                            ))}
                          </SimpleGrid>
                        </Box>

                        {/* Description */}
                        <Box>
                          <Text fontWeight="bold" mb={2}>
                            Description
                          </Text>
                          <Text fontSize="sm" color="gray.600" p={3} bg={bg} rounded="md">
                            {selectedReport.description}
                          </Text>
                        </Box>

                        {/* Details Grid */}
                        <SimpleGrid columns={2} spacing={4}>
                          <Box>
                            <Text fontWeight="bold" fontSize="sm" color="gray.500">
                              Category
                            </Text>
                            <HStack mt={1}>
                              <Text fontSize="lg">
                                {getCategoryEmoji(selectedReport.category)}
                              </Text>
                              <Text textTransform="capitalize">{selectedReport.category}</Text>
                            </HStack>
                          </Box>

                          <Box>
                            <Text fontWeight="bold" fontSize="sm" color="gray.500">
                              Current Status
                            </Text>
                            <Badge
                              colorScheme={getStatusColor(selectedReport.status)}
                              fontSize="sm"
                              px={3}
                              py={1}
                              rounded="full"
                              textTransform="capitalize"
                              mt={1}
                            >
                              {selectedReport.status}
                            </Badge>
                          </Box>

                          <Box>
                            <Text fontWeight="bold" fontSize="sm" color="gray.500">
                              Coordinates
                            </Text>
                            <Text fontSize="sm" mt={1}>
                              Lat: {selectedReport.location.coordinates[1].toFixed(4)}
                              <br />
                              Lng: {selectedReport.location.coordinates[0].toFixed(4)}
                            </Text>
                          </Box>

                          <Box>
                            <Text fontWeight="bold" fontSize="sm" color="gray.500">
                              Reported On
                            </Text>
                            <Text fontSize="sm" mt={1}>
                              {formatDate(selectedReport.createdAt)}
                            </Text>
                          </Box>
                        </SimpleGrid>

                        {/* Location Address */}
                        {selectedReport.location.address && (
                          <Box>
                            <Text fontWeight="bold" mb={2}>
                              Location Address
                            </Text>
                            <Flex align="center" gap={2} p={3} bg={bg} rounded="md">
                              <FiMapPin />
                              <Text fontSize="sm">{selectedReport.location.address}</Text>
                            </Flex>
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Update Status Tab */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Text fontWeight="bold" mb={4}>
                            Change Report Status
                          </Text>
                          <VStack spacing={3}>
                            <Button
                              width="full"
                              colorScheme="yellow"
                              leftIcon={<FiClock />}
                              onClick={() =>
                                handleUpdateStatus(selectedReport._id, 'pending')
                              }
                              isLoading={updatingStatus}
                              isDisabled={selectedReport.status === 'pending'}
                            >
                              Mark as Pending
                            </Button>
                            <Button
                              width="full"
                              colorScheme="blue"
                              leftIcon={<FiAlertCircle />}
                              onClick={() =>
                                handleUpdateStatus(selectedReport._id, 'in-progress')
                              }
                              isLoading={updatingStatus}
                              isDisabled={selectedReport.status === 'in-progress'}
                            >
                              Mark as In Progress
                            </Button>
                            <Button
                              width="full"
                              colorScheme="green"
                              leftIcon={<FiCheckCircle />}
                              onClick={() =>
                                handleUpdateStatus(selectedReport._id, 'resolved')
                              }
                              isLoading={updatingStatus}
                              isDisabled={selectedReport.status === 'resolved'}
                            >
                              Mark as Resolved
                            </Button>
                            <Button
                              width="full"
                              colorScheme="red"
                              leftIcon={<FiXCircle />}
                              onClick={() =>
                                handleUpdateStatus(selectedReport._id, 'rejected')
                              }
                              isLoading={updatingStatus}
                              isDisabled={selectedReport.status === 'rejected'}
                            >
                              Mark as Rejected
                            </Button>
                          </VStack>
                        </Box>

                        <Box p={4} bg={bg} rounded="md">
                          <Text fontSize="sm" color="gray.600">
                            <strong>Note:</strong> Changing the status will notify users and
                            update the report's progress tracking.
                          </Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </ModalBody>

              <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
                <Button
                  colorScheme="red"
                  variant="ghost"
                  mr={3}
                  onClick={() => handleDelete(selectedReport._id)}
                  leftIcon={<FiTrash2 />}
                >
                  Delete Report
                </Button>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;