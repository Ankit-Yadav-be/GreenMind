import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
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
  useDisclosure,
  SimpleGrid,
  Flex,
  IconButton,
  Tooltip,
  Select,
} from '@chakra-ui/react';
import { FiEye, FiTrash2, FiMapPin } from 'react-icons/fi';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('teal.500', 'teal.600');

  // Fetch reports from backend
  useEffect(() => {
    fetchReports();
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

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setReports(reports.filter((report) => report._id !== id));
      alert('Report deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report');
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

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text fontSize="lg" color="gray.500">
            Loading reports...
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
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Text fontSize="4xl" fontWeight="bold" color="teal.400" mb={2}>
              My Reports
            </Text>
            <Text fontSize="lg" color="gray.500">
              View and manage all your waste reports
            </Text>
          </Box>

          {/* Filters */}
          <HStack spacing={4} mb={4}>
            <Select
              placeholder="All Categories"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              bg={cardBg}
              borderColor={borderColor}
              maxW="200px"
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
              bg={cardBg}
              borderColor={borderColor}
              maxW="200px"
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
              colorScheme="gray"
              variant="outline"
            >
              Clear Filters
            </Button>
          </HStack>

          {/* Reports Table */}
          {reports.length === 0 ? (
            <Alert status="info" rounded="lg" boxShadow="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>No Reports Found</AlertTitle>
                <AlertDescription>
                  You haven't submitted any reports yet, or no reports match your filters.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Box
              bg={cardBg}
              rounded="xl"
              boxShadow="xl"
              overflow="hidden"
              borderWidth="1px"
              borderColor={borderColor}
            >
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
                        <Td maxW="200px">
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
                                {report.location.address || 'View on map'}
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
                            <Tooltip label="View Details">
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
            </Box>
          )}
        </VStack>

        {/* Details Modal */}
        {selectedReport && (
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent bg={cardBg}>
              <ModalHeader>
                <HStack>
                  <Text fontSize="xl">{getCategoryEmoji(selectedReport.category)}</Text>
                  <Text>Report Details</Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
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
                        <Text fontSize="lg">{getCategoryEmoji(selectedReport.category)}</Text>
                        <Text textTransform="capitalize">{selectedReport.category}</Text>
                      </HStack>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.500">
                        Status
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
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </Box>
  );
};

export default MyReports;