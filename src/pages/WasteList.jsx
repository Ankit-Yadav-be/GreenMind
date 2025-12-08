import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
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
  Badge,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  IconButton,
  Tooltip,
  Select,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  Heading,
} from '@chakra-ui/react';
import {
  FiEye,
  FiMapPin,
  FiClock,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';
const MotionBox = motion(Box);

const WasteList = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 9;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const overlayBg = useColorModeValue('rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)');

  // Fetch reports from backend
  useEffect(() => {
    fetchReports();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...reports];

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter((report) => report.category === filterCategory);
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((report) => report.status === filterStatus);
    }

    // Search in description and location
    if (searchQuery) {
      filtered = filtered.filter(
        (report) =>
          report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.location.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [reports, filterCategory, filterStatus, searchQuery]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}?limit=100`);
      setReports(response.data.data);
      setFilteredReports(response.data.data);
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

  const getCategoryEmoji = (category) => {
    const emojis = {
      plastic: '🧴',
      organic: '🍃',
      electronic: '🔌',
      other: '🧩',
    };
    return emojis[category] || '📦';
  };

  const getCategoryColor = (category) => {
    const colors = {
      plastic: 'blue',
      organic: 'green',
      electronic: 'purple',
      other: 'orange',
    };
    return colors[category] || 'gray';
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterStatus('');
    setSearchQuery('');
  };

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text fontSize="lg" color="gray.500">
            Loading waste reports...
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
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <Box textAlign="center">
            <Heading
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="bold"
              bgGradient="linear(to-r, teal.400, green.400)"
              bgClip="text"
              mb={3}
            >
              Waste Reports Gallery
            </Heading>
            <Text fontSize={{ base: 'md', md: 'xl' }} color="gray.500">
              Browse and explore waste reports from your community
            </Text>
            <HStack justify="center" spacing={6} mt={4}>
              <Badge colorScheme="purple" fontSize="md" px={4} py={2} rounded="full">
                {filteredReports.length} Reports Found
              </Badge>
              <Badge colorScheme="teal" fontSize="md" px={4} py={2} rounded="full">
                {reports.length} Total Reports
              </Badge>
            </HStack>
          </Box>

          {/* Search and Filters */}
          <Box
            bg={cardBg}
            p={6}
            rounded="xl"
            boxShadow="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <VStack spacing={4} align="stretch">
              {/* Search Bar */}
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by description or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={bg}
                  borderColor={borderColor}
                  _hover={{ borderColor: 'teal.300' }}
                  _focus={{
                    borderColor: 'teal.400',
                    boxShadow: '0 0 0 1px teal.400',
                  }}
                />
              </InputGroup>

              {/* Filter Options */}
              <Flex
                direction={{ base: 'column', md: 'row' }}
                gap={4}
                align={{ base: 'stretch', md: 'center' }}
              >
                <HStack flex={1} spacing={4}>
                  <Icon as={FiFilter} color="teal.400" boxSize={5} />
                  <Select
                    placeholder="All Categories"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    bg={bg}
                    size="md"
                  >
                    <option value="plastic">🧴 Plastic Waste</option>
                    <option value="organic">🍃 Organic Waste</option>
                    <option value="electronic">🔌 Electronic Waste</option>
                    <option value="other">🧩 Other</option>
                  </Select>

                  <Select
                    placeholder="All Status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    bg={bg}
                    size="md"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </HStack>

                <Button
                  onClick={clearFilters}
                  colorScheme="gray"
                  variant="outline"
                  size="md"
                >
                  Clear All
                </Button>
              </Flex>
            </VStack>
          </Box>

          {/* Reports Grid */}
          {currentReports.length === 0 ? (
            <Box
              bg={cardBg}
              p={16}
              rounded="xl"
              boxShadow="lg"
              textAlign="center"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Text fontSize="6xl" mb={4}>
                🔍
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="gray.600" mb={2}>
                No Reports Found
              </Text>
              <Text color="gray.500" mb={6}>
                Try adjusting your filters or search criteria
              </Text>
              <Button onClick={clearFilters} colorScheme="teal">
                Clear Filters
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {currentReports.map((report, index) => (
                <MotionBox
                  key={report._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Box
                    bg={cardBg}
                    rounded="xl"
                    overflow="hidden"
                    boxShadow="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                    _hover={{
                      transform: 'translateY(-8px)',
                      boxShadow: '2xl',
                    }}
                    transition="all 0.3s"
                    cursor="pointer"
                    position="relative"
                  >
                    {/* Image with Overlay */}
                    <Box position="relative" h="250px" overflow="hidden">
                      <Image
                        src={report.images[0]?.url}
                        alt={report.description}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        fallbackSrc="https://via.placeholder.com/400x250?text=No+Image"
                        transition="transform 0.3s"
                        _hover={{ transform: 'scale(1.1)' }}
                      />

                      {/* Status Badge Overlay */}
                      <Badge
                        position="absolute"
                        top={3}
                        right={3}
                        colorScheme={getStatusColor(report.status)}
                        fontSize="xs"
                        px={3}
                        py={1}
                        rounded="full"
                        textTransform="capitalize"
                        boxShadow="lg"
                      >
                        {report.status}
                      </Badge>

                      {/* Category Badge Overlay */}
                      <Badge
                        position="absolute"
                        top={3}
                        left={3}
                        colorScheme={getCategoryColor(report.category)}
                        fontSize="sm"
                        px={3}
                        py={1}
                        rounded="full"
                        boxShadow="lg"
                      >
                        {getCategoryEmoji(report.category)} {report.category}
                      </Badge>

                      {/* View Button Overlay */}
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        bg={overlayBg}
                        opacity="0"
                        _hover={{ opacity: 1 }}
                        transition="opacity 0.3s"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Button
                          leftIcon={<FiEye />}
                          colorScheme="teal"
                          size="lg"
                          onClick={() => handleViewDetails(report)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Box>

                    {/* Card Content */}
                    <Box p={5}>
                      <VStack align="stretch" spacing={3}>
                        {/* Description */}
                        <Text
                          fontSize="md"
                          fontWeight="medium"
                          noOfLines={2}
                          minH="48px"
                        >
                          {report.description}
                        </Text>

                        {/* Location */}
                        <HStack spacing={2} color="gray.500">
                          <Icon as={FiMapPin} boxSize={4} />
                          <Text fontSize="sm" noOfLines={1}>
                            {report.location.address || 'Location not specified'}
                          </Text>
                        </HStack>

                        {/* Date */}
                        <HStack spacing={2} color="gray.500">
                          <Icon as={FiClock} boxSize={4} />
                          <Text fontSize="sm">{formatDate(report.createdAt)}</Text>
                        </HStack>

                        {/* View Button */}
                        <Button
                          leftIcon={<FiEye />}
                          colorScheme="teal"
                          variant="outline"
                          size="sm"
                          width="full"
                          onClick={() => handleViewDetails(report)}
                          mt={2}
                        >
                          View Full Report
                        </Button>
                      </VStack>
                    </Box>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center" align="center" gap={2} mt={8}>
              <IconButton
                icon={<FiChevronLeft />}
                onClick={() => paginate(currentPage - 1)}
                isDisabled={currentPage === 1}
                colorScheme="teal"
                variant="outline"
                aria-label="Previous page"
              />

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Show first, last, current, and adjacent pages
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      colorScheme={currentPage === pageNumber ? 'teal' : 'gray'}
                      variant={currentPage === pageNumber ? 'solid' : 'outline'}
                      size="md"
                    >
                      {pageNumber}
                    </Button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <Text key={pageNumber}>...</Text>;
                }
                return null;
              })}

              <IconButton
                icon={<FiChevronRight />}
                onClick={() => paginate(currentPage + 1)}
                isDisabled={currentPage === totalPages}
                colorScheme="teal"
                variant="outline"
                aria-label="Next page"
              />
            </Flex>
          )}
        </VStack>

        {/* Details Modal */}
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
      </Container>
    </Box>
  );
};

export default WasteList;